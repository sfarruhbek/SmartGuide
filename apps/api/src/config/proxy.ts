import type { IncomingMessage } from 'node:http';

export type ExpressTrustProxyValue = boolean | number | string;

/**
 * Parses TRUST_PROXY env var for Express `app.set('trust proxy', ...)`
 * and WebSocket upgrade client IP extraction.
 * Recommended behind local Nginx: TRUST_PROXY=loopback (or 1).
 */
export function parseTrustProxy(raw: string | undefined): ExpressTrustProxyValue {
  const value = (raw ?? 'false').trim();
  if (!value || value.toLowerCase() === 'false' || value === '0') return false;
  if (value.toLowerCase() === 'true') return true;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

export function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) return false;
  const normalized = address.trim().toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1' ||
    normalized.startsWith('127.') ||
    normalized.startsWith('::ffff:127.')
  );
}

/**
 * Extracts client IP for raw HTTP/WebSocket upgrade requests using the same
 * trust boundary configured for Express (`TRUST_PROXY`).
 * Never trusts spoofed X-Forwarded-For headers when TRUST_PROXY is disabled
 * or the direct peer is outside the trusted proxy range.
 */
export function resolveClientIp(req: IncomingMessage, trustProxyRaw: string | undefined): string {
  const directIp = req.socket.remoteAddress ?? 'unknown';
  const setting = parseTrustProxy(trustProxyRaw);
  if (setting === false) return directIp;

  const header = req.headers['x-forwarded-for'];
  const rawForwarded = Array.isArray(header) ? header.join(',') : header ?? '';
  const chain = rawForwarded
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (chain.length === 0) return directIp;

  if (setting === true) {
    return chain[0];
  }

  if (typeof setting === 'number') {
    if (setting <= 0) return directIp;
    const index = Math.max(0, chain.length - setting);
    return chain[index];
  }

  const lower = setting.toLowerCase();
  if (lower === 'loopback') {
    if (!isLoopbackAddress(directIp)) return directIp;
    for (let i = chain.length - 1; i >= 0; i--) {
      if (!isLoopbackAddress(chain[i])) return chain[i];
    }
    return chain[0];
  }

  // Explicit trusted proxy IP list (comma-separated exact matches)
  const trustedIps = setting.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (trustedIps.includes(directIp.toLowerCase())) {
    return chain[chain.length - 1];
  }

  return directIp;
}
