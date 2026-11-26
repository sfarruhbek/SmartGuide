import type { SupportedLanguage } from '@smartguide/shared';
import { local, money, type City, type Place, type Trip } from './journey';
import { journeyCopy } from './journey-copy';

export function tripBreakdown(trip: Trip) {
  const costs = {
    meals: 0,
    transport: 0,
    admissions: 0,
    lodging: 0,
    reserve: trip.reserve,
  };
  for (const { slots } of trip.days)
    for (const slot of slots) {
      if (['breakfast', 'lunch', 'dinner'].includes(slot.kind))
        costs.meals += slot.cost;
      else if (slot.kind === 'taxi' || slot.kind === 'transfer')
        costs.transport += slot.cost;
      else if (slot.kind === 'stay') costs.lodging += slot.cost;
      else costs.admissions += slot.cost;
    }
  return costs;
}
export function tripText(
  trip: Trip,
  language: SupportedLanguage,
  cities: readonly City[],
  places: readonly Place[],
) {
  const copy = journeyCopy(language);
  const cityName = (id: string) =>
    id === 'custom'
      ? trip.input.customCity
      : local(
          cities.find((city) => city.id === id)?.name || {
            en: id,
            ru: id,
            uz: id,
          },
          language,
        );
  const lines = [
    'SmartGuide · Uzbekistan',
    copy('estimates'),
    '',
    `${copy('budget')}: ${money(Math.round(trip.input.budget * 100), language)}`,
    `${copy('total')}: ${money(trip.total, language)}`,
  ];
  for (const [kind, amount] of Object.entries(tripBreakdown(trip)))
    lines.push(
      `${copy(kind as keyof ReturnType<typeof tripBreakdown>)}: ${money(amount, language)}`,
    );
  for (const day of trip.days) {
    lines.push(
      '',
      `${copy('day')} ${day.number} · ${cityName(day.city)} · ${money(day.total, language)}`,
    );
    for (const slot of day.slots) {
      const place = places.find((place) => place.id === slot.placeId);
      lines.push(
        `${slot.time}–${slot.end} · ${place ? local(place.name, language) : copy(slot.kind === 'visit' ? 'explore' : slot.kind)} · ${money(slot.cost, language)}`,
      );
      if (place) lines.push(local(place.story, language), place.source);
      if (slot.kind === 'explore') lines.push(copy('exploreHint'));
      if (slot.kind === 'transfer')
        lines.push(
          `${cityName(slot.from!)} → ${cityName(slot.to!)}. ${copy('transferHint')}`,
        );
    }
  }
  return lines.join('\n');
}
