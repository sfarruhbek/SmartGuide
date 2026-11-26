import { env } from '../src/config/env.js';
import { generateGroq, generateSpeech } from '../src/ai/providers.js';
import { ProviderPool, InvalidProviderOutput } from '../src/ai/provider-pool.js';
import { summarizeContentImport } from '../src/ai/content-import.js';

// Read-only model catalogs by default. --probe makes a small paid generation per task model/key.
const probe = process.argv.includes('--probe');
const report: Record<string, unknown> = { checkedAt: new Date().toISOString(), content: summarizeContentImport() };
async function catalog(url: string, headers: Record<string, string>) {
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    const body = await response.json() as { data?: { id: string }[]; models?: { name: string; supportedGenerationMethods?: string[] }[] };
    return { status: response.status, models: body.data?.map((m) => m.id) ?? body.models?.map((m) => ({ id: m.name.replace(/^models\//, ''), methods: m.supportedGenerationMethods })) ?? [] };
  } catch { return { status: 'network-error', models: [] }; }
}
const groqCatalogs = [];
for (let index = 0; index < env.groqKeys.length; index++) {
  groqCatalogs.push({ credential: index + 1, ...await catalog('https://api.groq.com/openai/v1/models', { Authorization: `Bearer ${env.groqKeys[index]}` }) });
}
report.groq = groqCatalogs;
report.gemini = env.isGeminiConfigured ? await catalog('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', { 'x-goog-api-key': env.GEMINI_API_KEY }) : { status: 'not-configured' };
if (probe) {
  const keys = [];
  for (let index = 0; index < env.groqKeys.length; index++) {
    const pool = new ProviderPool({ keys: [env.groqKeys[index]], models: [env.groqModels[0]], timeoutMs: 15_000 });
    try {
      await pool.run((model, key) => ({ url: 'https://api.groq.com/openai/v1/chat/completions', init: {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Return JSON {"ok":true}.' }], max_completion_tokens: 512, response_format: { type: 'json_object' }, ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}) }),
      } }), (raw) => {
        const body = raw as { choices?: { message?: { content?: string } }[] };
        if (JSON.parse(body.choices?.[0]?.message?.content ?? '{}').ok !== true) throw new InvalidProviderOutput();
        return true;
      });
      keys.push({ credential: index + 1, ok: true });
    } catch { keys.push({ credential: index + 1, ok: false }); }
  }
  report.credentialProbes = keys;
  try { report.textProbe = { ok: true, model: (await generateGroq({ system: 'Return JSON only.', prompt: 'Return {"ok":true}.', json: true, parse: JSON.parse })).modelUsed }; }
  catch { report.textProbe = { ok: false }; }
  try {
    const audio = await generateSpeech('Здравствуйте, добро пожаловать в Узбекистан.', 'ru');
    report.speechProbe = { ok: true, model: audio.modelUsed, mime: audio.value.audioMimeType, bytes: Buffer.from(audio.value.audioBase64, 'base64').length };
  } catch { report.speechProbe = { ok: false }; }
}
console.log(JSON.stringify(report, null, 2));
