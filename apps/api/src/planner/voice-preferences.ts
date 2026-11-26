import { catalog, tripInputSchema } from './catalog.js';
import type { Interest, TripInput } from './trip.js';

const VALID_INTERESTS: readonly Interest[] = ['history', 'local', 'food', 'nature', 'sacred'];

const CITY_ALIASES: Record<string, string> = {
  // Bukhara
  bukhara: 'bukhara', buxoro: 'bukhara', buxara: 'bukhara', bujara: 'bukhara',
  бухара: 'bukhara', бухаре: 'bukhara', бухару: 'bukhara', бухары: 'bukhara',
  // Samarkand
  samarkand: 'samarkand', samarqand: 'samarkand', samarcanda: 'samarkand',
  самарканд: 'samarkand', самарканде: 'samarkand', самарканда: 'samarkand',
  // Khiva
  khiva: 'khiva', xiva: 'khiva', jiva: 'khiva', hiva: 'khiva', 'ichan-qala': 'khiva', 'ichan qala': 'khiva',
  хива: 'khiva', хиве: 'khiva', хиву: 'khiva', хивы: 'khiva',
  // Tashkent
  tashkent: 'tashkent', toshkent: 'tashkent',
  ташкент: 'tashkent', ташкенте: 'tashkent', ташкента: 'tashkent',
  // Nukus
  nukus: 'nukus', нукус: 'nukus', нукусе: 'nukus', нукуса: 'nukus',
  // Termez
  termez: 'termez', termiz: 'termez', термез: 'termez', термезе: 'termez', термеза: 'termez',
  // Shahrisabz
  shahrisabz: 'shahrisabz', shakhrisabz: 'shahrisabz', shahrisabzda: 'shahrisabz',
  шахрисабз: 'shahrisabz', шахрисабзе: 'shahrisabz', шахрисабза: 'shahrisabz',
  // Kokand
  kokand: 'kokand', qoqon: 'kokand', qoʻqon: 'kokand', "qo'qon": 'kokand',
  коканд: 'kokand', коканде: 'kokand', коканда: 'kokand',
  // Fergana
  fergana: 'fergana', fargona: 'fergana', fargʻona: 'fergana', "farg'ona": 'fergana',
  фергана: 'fergana', фергане: 'fergana', фергану: 'fergana', ферганы: 'fergana',
  // Andijan
  andijan: 'andijan', andijon: 'andijan', андижан: 'andijan', андижане: 'andijan', андижана: 'andijan',
  // Namangan
  namangan: 'namangan', наманган: 'namangan', намангане: 'namangan', намангана: 'namangan',
  // Jizzakh
  jizzakh: 'jizzakh', jizzax: 'jizzakh', джизак: 'jizzakh', джизаке: 'jizzakh', джизака: 'jizzakh',
  // Navoi
  navoi: 'navoi', navoiy: 'navoi', навои: 'navoi',
  // Karshi
  karshi: 'karshi', qarshi: 'karshi', карши: 'karshi',
  // Gulistan
  gulistan: 'gulistan', guliston: 'gulistan', гулистан: 'gulistan', гулистане: 'gulistan',
  // Margilan
  margilan: 'margilan', margilon: 'margilan', margʻilon: 'margilan', "marg'ilon": 'margilan',
  маргилан: 'margilan', маргилане: 'margilan', маргилана: 'margilan',
};

const INTEREST_ALIASES: Record<string, Interest> = {
  history: 'history', historical: 'history', architecture: 'history', monuments: 'history', heritage: 'history', museums: 'history',
  история: 'history', исторические: 'history', архитектура: 'history', памятники: 'history', музеи: 'history',
  tarix: 'history', obidalar: 'history', memorchilik: 'history',
  local: 'local', culture: 'local', crafts: 'local', bazaar: 'local', shopping: 'local', people: 'local', art: 'local',
  местная: 'local', культура: 'local', ремесла: 'local', ремёсла: 'local', базар: 'local', базары: 'local', локальное: 'local',
  mahalliy: 'local', madaniyat: 'local', hunarmandchilik: 'local', bozor: 'local',
  food: 'food', cuisine: 'food', gastronomy: 'food', culinary: 'food', restaurants: 'food', plov: 'food',
  еда: 'food', кухня: 'food', гастрономия: 'food', рестораны: 'food', плов: 'food',
  taom: 'food', ovqat: 'food', oshxona: 'food', palov: 'food',
  nature: 'nature', mountains: 'nature', desert: 'nature', outdoors: 'nature', parks: 'nature', scenery: 'nature',
  природа: 'nature', горы: 'nature', пустыня: 'nature', парки: 'nature',
  tabiat: 'nature', toglar: 'nature',
  sacred: 'sacred', spiritual: 'sacred', religion: 'sacred', religious: 'sacred', pilgrimage: 'sacred', mosques: 'sacred', sufi: 'sacred',
  святыни: 'sacred', духовное: 'sacred', религия: 'sacred', мечети: 'sacred', паломничество: 'sacred',
  ziyorat: 'sacred', muqaddas: 'sacred', masjid: 'sacred',
};

function cleanToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[ʻ’'`]/g, '')
    .replace(/\s+/g, ' ');
}

export function resolveCityId(raw: string): string | null {
  const token = cleanToken(raw);
  if (!token) return null;
  if (catalog.cities.some((c) => c.id === token)) return token;
  if (CITY_ALIASES[token]) return CITY_ALIASES[token];

  for (const city of catalog.cities) {
    for (const label of Object.values(city.name)) {
      if (label && cleanToken(label) === token) return city.id;
    }
  }
  // Substring match for phrases like "город Самарканд" or "Khiva city"
  for (const [alias, id] of Object.entries(CITY_ALIASES)) {
    if (alias.length >= 4 && token.includes(alias)) return id;
  }
  return null;
}

function coerceNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$€£,\s]/g, '').replace(',', '.');
    const match = /\d+(?:\.\d+)?/.exec(cleaned);
    if (match) {
      const parsed = Number(match[0]);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function coerceBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', 'yes', 'да', 'ha', '1', 'with'].includes(v)) return true;
    if (['false', 'no', 'нет', 'yoq', "yo'q", '0', 'without'].includes(v)) return false;
  }
  return undefined;
}

function normalizeInterests(raw: unknown, fallback: Interest[]): Interest[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(/[,;/]+/)
      : [];
  const mapped: Interest[] = [];
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const token = cleanToken(item);
    if (!token) continue;
    if ((VALID_INTERESTS as readonly string[]).includes(token)) {
      mapped.push(token as Interest);
      continue;
    }
    if (INTEREST_ALIASES[token]) {
      mapped.push(INTEREST_ALIASES[token]);
      continue;
    }
    for (const [alias, interest] of Object.entries(INTEREST_ALIASES)) {
      if (alias.length >= 4 && token.includes(alias)) {
        mapped.push(interest);
        break;
      }
    }
  }
  const unique = [...new Set(mapped)].slice(0, 5);
  if (unique.length > 0) return unique;
  return fallback.length > 0 ? fallback : ['history', 'local'];
}

/**
 * Normalizes messy LLM/voice tool preferences (localized city names, capitalization,
 * missing optional fields, string numbers, interest synonyms) into a strict TripInput.
 */
export function normalizeVoicePreferences(
  raw: unknown,
  fallback?: TripInput,
): { ok: true; data: TripInput } | { ok: false; reason: string } {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const rawCities = Array.isArray(obj.cities)
    ? obj.cities
    : typeof obj.cities === 'string'
      ? obj.cities.split(/[,;/]+/)
      : typeof obj.city === 'string'
        ? [obj.city]
        : undefined;

  const resolvedCities: string[] = [];
  let customCity =
    typeof obj.customCity === 'string'
      ? obj.customCity.trim().slice(0, 100)
      : '';

  if (rawCities !== undefined) {
    for (const entry of rawCities) {
      if (typeof entry !== 'string' || !entry.trim()) continue;
      const matched = resolveCityId(entry);
      if (matched) {
        if (!resolvedCities.includes(matched)) resolvedCities.push(matched);
      } else if (!customCity) {
        customCity = entry.trim().slice(0, 100);
      }
    }
  } else if (fallback) {
    resolvedCities.push(...fallback.cities);
    if (!customCity) customCity = fallback.customCity;
  }

  // If customCity itself actually matches a known city ID, promote it to cities
  if (customCity) {
    const matchedCustom = resolveCityId(customCity);
    if (matchedCustom) {
      if (!resolvedCities.includes(matchedCustom)) resolvedCities.push(matchedCustom);
      customCity = '';
    }
  }

  const destinationCount = resolvedCities.length + (customCity ? 1 : 0);
  if (destinationCount < 1) {
    return {
      ok: false,
      reason: 'Missing destination city. Ask which Uzbekistan city or cities the visitor wants to visit.',
    };
  }

  const rawDays = coerceNumber(obj.days) ?? fallback?.days;
  if (rawDays === undefined || rawDays < 1) {
    return {
      ok: false,
      reason: 'Missing trip duration. Ask how many days (1 to 14) the trip will be.',
    };
  }
  const days = Math.min(14, Math.max(destinationCount, Math.round(rawDays)));
  // If user asked for more cities than max 14 days, trim cities to days
  const cities = resolvedCities.slice(0, customCity ? Math.max(0, days - 1) : days);

  const rawBudget = coerceNumber(obj.budget) ?? fallback?.budget;
  if (rawBudget === undefined || rawBudget <= 0) {
    return {
      ok: false,
      reason: 'Missing total USD budget. Ask for the approximate total trip budget in US dollars.',
    };
  }
  const budget = Math.min(1_000_000, Math.max(1, Math.round(rawBudget * 100) / 100));

  const interests = normalizeInterests(obj.interests, fallback?.interests ?? ['history', 'local']);
  const accommodation =
    coerceBoolean(obj.accommodation) ?? fallback?.accommodation ?? true;

  const candidate: TripInput = {
    cities,
    days,
    budget,
    interests,
    accommodation,
    customCity,
  };

  const validated = tripInputSchema.safeParse(candidate);
  if (!validated.success) {
    return {
      ok: false,
      reason: validated.error.issues.map((i) => `${i.path.join('.') || 'preferences'}: ${i.message}`).join('; '),
    };
  }
  return { ok: true, data: validated.data };
}

export const CATALOG_CITY_IDS = catalog.cities.map((c) => c.id);
