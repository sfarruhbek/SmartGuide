import type { PlaceFilter } from './journey';

export type JourneyView = 'plan' | 'itinerary' | 'map' | 'snap' | 'guide' | 'pass' | 'auth';
export interface JourneyNavigation {
  view: JourneyView;
  city: string;
  place: string | null;
  collection: PlaceFilter;
  day: number;
}
interface CatalogItem {
  id: string;
  city: string;
  category: string;
}
export function readJourneyNavigation(
  search: string,
  cities: readonly { id: string }[],
  places: readonly CatalogItem[],
): JourneyNavigation {
  const params = new URLSearchParams(search);
  const requestedView = params.get('view');
  const view: JourneyView =
    requestedView === 'map' || requestedView === 'itinerary' || requestedView === 'snap' || requestedView === 'guide' || requestedView === 'pass' || requestedView === 'auth'
      ? requestedView
      : 'plan';
  const city =
    cities.find((value) => value.id === params.get('city'))?.id || cities[0].id;
  const requestedCollection = params.get('collection');
  let collection: PlaceFilter =
    requestedCollection === 'landmark' || requestedCollection === 'discovery'
      ? requestedCollection
      : 'all';
  const requestedPlace = places.find(
    (value) => value.city === city && value.id === params.get('place'),
  );
  if (
    requestedPlace &&
    collection !== 'all' &&
    requestedPlace.category !== collection
  )
    collection = 'all';
  const place =
    requestedPlace?.id ||
    places.find(
      (value) =>
        value.city === city &&
        (collection === 'all' || value.category === collection),
    )?.id ||
    null;
  const requestedDay = Number(params.get('day') || 1);
  return {
    view,
    city,
    place,
    collection,
    day: Number.isInteger(requestedDay)
      ? Math.max(0, Math.min(13, requestedDay - 1))
      : 0,
  };
}
export function journeyUrl(
  url: URL,
  state: JourneyNavigation,
  places: readonly { id: string }[],
): string {
  const next = new URL(url);
  next.hash = '';
  next.searchParams.set('view', state.view);
  if (state.view === 'map' || state.view === 'snap' || state.view === 'guide') {
    next.searchParams.set('city', state.city);
    if(state.view==='map')next.searchParams.set('collection', state.collection);
    else next.searchParams.delete('collection');
    if (state.place && places.some((place) => place.id === state.place))
      next.searchParams.set('place', state.place);
    else next.searchParams.delete('place');
  } else {
    for (const key of ['city', 'place', 'collection'])
      next.searchParams.delete(key);
  }
  if (state.view === 'itinerary')
    next.searchParams.set('day', String(state.day + 1));
  else next.searchParams.delete('day');
  return `${next.pathname}${next.search}`;
}
