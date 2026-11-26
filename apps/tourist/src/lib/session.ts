import { LANGUAGE_CODES, type SupportedLanguage } from '@smartguide/shared';

const SESSION_KEY = 'smartguide_tourist_session_id';
const LANG_KEY = 'smartguide_tourist_language';
let memorySessionId: string | undefined;

export function createLocalId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  return `${prefix}-${randomPart}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  if (memorySessionId) return memorySessionId;

  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 6) {
      memorySessionId = existing;
      return memorySessionId;
    }

    const created = createLocalId('visitor');
    memorySessionId = created;
    window.localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    memorySessionId ??= createLocalId('visitor');
    return memorySessionId;
  }
}

export function getSavedLanguage(urlLang?: string | null): SupportedLanguage {
  if (urlLang && LANGUAGE_CODES.includes(urlLang as SupportedLanguage)) {
    return urlLang as SupportedLanguage;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored && LANGUAGE_CODES.includes(stored as SupportedLanguage)) {
        return stored as SupportedLanguage;
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
    const browserLang = window.navigator.language.slice(0, 2).toLowerCase();
    if (LANGUAGE_CODES.includes(browserLang as SupportedLanguage))
      return browserLang as SupportedLanguage;
  }

  return 'en';
}

export function saveLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  document.documentElement.lang = lang;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage access errors
  }
}

/** Keep explicit URL language and the saved preference in sync on refresh. */
export function updateLanguage(lang: SupportedLanguage): void {
  saveLanguage(lang);
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState(window.history.state, '', url);
}
