import { env } from '../config/env.js';
import { InvalidProviderOutput, ProviderPool } from './provider-pool.js';

const groq = new ProviderPool({ keys: env.groqKeys, models: env.groqModels, timeoutMs: env.AI_REQUEST_TIMEOUT_MS });
const gemini = new ProviderPool({ keys: env.isGeminiConfigured ? [env.GEMINI_API_KEY] : [], models: env.ttsModels, timeoutMs: env.AI_REQUEST_TIMEOUT_MS });

export async function generateGroq<T>(params: {
  system: string;
  prompt: string;
  json?: boolean;
  maxTokens?: number;
  image?: { data: string; mimeType: string };
  parse: (text: string) => T;
  signal?: AbortSignal;
  timeoutMs?: number;
}) {
  return groq.run((model, key) => ({
    url: 'https://api.groq.com/openai/v1/chat/completions',
    init: {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: params.system + (params.json ? '\nReturn a JSON object only.' : '') },
          { role: 'user', content: params.image ? [
            { type: 'text', text: params.prompt },
            { type: 'image_url', image_url: { url: `data:${params.image.mimeType};base64,${params.image.data}` } },
          ] : params.prompt },
        ],
        max_completion_tokens: params.maxTokens ?? 2048,
        ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
        ...(model.startsWith('qwen/') ? { reasoning_effort: 'none' } : {}),
        ...(params.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    },
  }), (raw) => {
    const body = raw as { choices?: { finish_reason?: string; message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim();
    if (!text || body.choices?.[0]?.finish_reason === 'length') throw new InvalidProviderOutput();
    try { return params.parse(text); } catch { throw new InvalidProviderOutput(); }
  }, params.image ? [env.GROQ_VISION_MODEL] : env.groqModels, {
    signal: params.signal,
    timeoutMs: params.timeoutMs,
  });
}

export function normalizeAudio(data: string, mime: string): { audioBase64: string; audioMimeType: string } {
  const bytes = Buffer.from(data, 'base64');
  if (bytes.length < 4 || bytes.length > 10_000_000) throw new InvalidProviderOutput();
  if (/^audio\/(wav|x-wav|wave)(;|$)/i.test(mime)) {
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw new InvalidProviderOutput();
    return { audioBase64: data, audioMimeType: 'audio/wav' };
  }
  if (!/^audio\/l16(;|$)/i.test(mime) || bytes.length % 2) throw new InvalidProviderOutput();
  const rate = Number(/rate=(\d+)/i.exec(mime)?.[1] ?? 24000);
  const channels = Number(/channels=(\d+)/i.exec(mime)?.[1] ?? 1);
  if (rate < 8000 || rate > 48000 || channels !== 1) throw new InvalidProviderOutput();
  // Gemini speech-generation returns signed little-endian 16-bit PCM.
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36 + bytes.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22); header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * channels * 2, 28); header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(bytes.length, 40);
  return { audioBase64: Buffer.concat([header, bytes]).toString('base64'), audioMimeType: 'audio/wav' };
}

export async function generateSpeech(
  text: string,
  language: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
) {
  return gemini.run((model, key) => ({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    init: {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Read the following text aloud in language ${language}, warmly and naturally. Do not add or change words:\n${text}` }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: env.GEMINI_TTS_VOICE } } } },
      }),
    },
  }), (raw) => {
    const body = raw as { candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[] };
    const audio = body.candidates?.[0]?.content?.parts?.find((part) => part.inlineData)?.inlineData;
    if (!audio?.data || !audio.mimeType) throw new InvalidProviderOutput();
    return normalizeAudio(audio.data, audio.mimeType);
  }, undefined, options);
}
