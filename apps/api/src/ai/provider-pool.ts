/** No upstream error bodies, headers, or credentials escape this module. */
export class ProviderUnavailable extends Error {
  constructor(public readonly reason: 'not-configured' | 'exhausted' | 'deadline') {
    super(`AI provider unavailable: ${reason}`);
  }
}

export class InvalidProviderOutput extends Error {}

export function retryAfterMs(value: string | null, now = Date.now()): number {
  if (!value) return 60_000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(delay) ? Math.max(1000, Math.min(delay, 86_400_000)) : 60_000;
}

function quotaWait(headers: Headers, now: number): number {
  if (headers.has('retry-after')) return retryAfterMs(headers.get('retry-after'), now);
  const waits = ['tokens', 'requests'].flatMap((kind) => {
    if (headers.get(`x-ratelimit-remaining-${kind}`) !== '0') return [];
    const reset = headers.get(`x-ratelimit-reset-${kind}`) ?? '';
    let ms = 0;
    for (const match of reset.matchAll(/([\d.]+)(ms|h|m|s)/g)) ms += Number(match[1]) * ({ ms: 1, s: 1000, m: 60_000, h: 3_600_000 }[match[2]] ?? 0);
    return ms ? [Math.max(1000, Math.min(ms, 86_400_000))] : [];
  });
  return waits.length ? Math.max(...waits) : 60_000;
}

type PoolOptions = {
  keys: string[];
  models: string[];
  timeoutMs?: number;
  fetcher?: typeof fetch;
  now?: () => number;
};

export class ProviderPool {
  private readonly disabledKeys = new Set<number>();
  private readonly modelCooldowns = new Map<string, number>();
  private readonly keyCooldowns = new Map<number, number>();
  private organizationCooldown = 0;
  private nextKey = 0;
  constructor(private readonly options: PoolOptions) {}

  async run<T>(
    request: (model: string, key: string, signal: AbortSignal) => { url: string; init: RequestInit },
    parse: (body: unknown, model: string) => T,
    candidateModels = this.options.models,
  ): Promise<{ value: T; modelUsed: string }> {
    const { keys, timeoutMs = 25_000, fetcher = fetch, now = Date.now } = this.options;
    if (!keys.length || !candidateModels.length) throw new ProviderUnavailable('not-configured');
    const deadline = now() + timeoutMs;
    let attempts = 0;
    // All keys are conservatively treated as one organization/project quota pool.
    for (const model of candidateModels) {
      if (this.organizationCooldown > now()) break;
      if ((this.modelCooldowns.get(model) ?? 0) > now()) continue;
      const start = this.nextKey++ % keys.length;
      for (let offset = 0; offset < keys.length; offset++) {
        const index = (start + offset) % keys.length;
        if (this.disabledKeys.has(index) || (this.keyCooldowns.get(index) ?? 0) > now()) continue;
        const remaining = deadline - now();
        if (remaining <= 0) throw new ProviderUnavailable('deadline');
        if (++attempts > 8) throw new ProviderUnavailable('exhausted');
        const signal = AbortSignal.timeout(Math.max(1, Math.min(10_000, remaining)));
        try {
          const { url, init } = request(model, keys[index], signal);
          const response = await fetcher(url, { ...init, signal });
          if (response.status === 401 || response.status === 403) {
            this.disabledKeys.add(index);
            continue;
          }
          if (response.status === 429) {
            const until = now() + quotaWait(response.headers, now());
            const errorBody = await response.json().catch(() => ({})) as { error?: { code?: string; type?: string; message?: string } };
            const quota = `${errorBody.error?.code ?? ''} ${errorBody.error?.type ?? ''} ${errorBody.error?.message ?? ''}`;
            if (/billing|insufficient_quota|organization.*(daily|budget)|project.*daily/i.test(quota)) this.organizationCooldown = until;
            this.modelCooldowns.set(model, until);
            break; // Never rotate through same-organization keys to evade 429.
          }
          if (response.status >= 500 || [408, 404].includes(response.status)) {
            this.modelCooldowns.set(model, now() + (response.status === 404 ? 600_000 : 15_000));
            break;
          }
          if (!response.ok) {
            // Invalid/unsupported request: try another model, never repeat all keys.
            this.modelCooldowns.set(model, now() + 60_000);
            break;
          }
          const body: unknown = await response.json();
          const value = parse(body, model);
          return { value, modelUsed: model };
        } catch (error) {
          if (error instanceof InvalidProviderOutput || error instanceof SyntaxError) {
            this.modelCooldowns.set(model, now() + 15_000);
          } else {
            this.keyCooldowns.set(index, now() + 5000);
          }
          break;
        }
      }
    }
    throw new ProviderUnavailable(now() >= deadline ? 'deadline' : 'exhausted');
  }
}
