import { LANGUAGE_CODES, type SupportedLanguage } from '@smartguide/shared';

const SESSION_KEY = 'smartguide_tourist_session_id';
const LANG_KEY = 'smartguide_tourist_language';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';

  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 6) {
      return existing;
    }

    const randomPart =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 12)
        : Math.random().toString(36).slice(2, 14);
    const created = `visitor-${randomPart}`;
    window.localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return `visitor-${Date.now().toString(36)}`;
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

      const browserLang = window.navigator.language.slice(0, 2).toLowerCase();
      if (LANGUAGE_CODES.includes(browserLang as SupportedLanguage)) {
        return browserLang as SupportedLanguage;
      }
    } catch {
      // Ignore storage access errors in private browsing
    }
  }

  return 'en';
}

export function saveLanguage(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Ignore storage access errors
  }
}
