'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  History,
  Landmark,
  Clock3,
  Compass,
  Loader2,
  MapPin,
  Plus,
  Route,
  Sparkles,
  Wallet,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  LANGUAGE_CODES,
  type SupportedLanguage,
} from '@smartguide/shared';
import { CITIES, PLACES } from '@/lib/places';
import {
  DISCOVERY_KEY,
  TRIP_KEY,
  generateTrip,
  local,
  money,
  budgetCents,
  matchesPlaceFilter,
  readDiscoveries,
  readTrip,
  type Discovery,
  type Interest,
  type Trip,
  type TripInput,
  type PlaceFilter,
} from '@/lib/journey';
import { journeyCopy } from '@/lib/journey-copy';
import {
  getSavedLanguage,
  saveLanguage,
  updateLanguage,
  createLocalId,
} from '@/lib/session';
import { requestTrip } from '@/lib/trip-api';
import { TouristHeader } from './TouristHeader';
import { DiscoveryMap } from './DiscoveryMap';
import {
  readJourneyNavigation,
  journeyUrl,
  type JourneyView,
} from '@/lib/journey-navigation';
import { tripBreakdown, tripText } from '@/lib/trip-summary';
import { useKeyboardViewport } from '@/lib/use-keyboard-viewport';
import { MapVoiceAssistant } from './MapVoiceAssistant';
import { voiceCopy } from '@/lib/voice-copy';
import type { VoicePlace, VoicePosition } from '@/lib/live-voice';

const initialInput: TripInput = {
  cities: ['bukhara'],
  days: 4,
  budget: 160,
  interests: ['local', 'history'],
  accommodation: true,
  customCity: '',
};
const interests: Interest[] = ['history', 'local', 'food', 'nature', 'sacred'];
export function TouristHomeClient({
  initialLang,
  initialQuery = '',
}: {
  initialLang?: string;
  initialQuery?: string;
}) {
  const initialRoute = readJourneyNavigation(initialQuery, CITIES, PLACES);
  const [language, setLanguage] = useState<SupportedLanguage>(
    LANGUAGE_CODES.includes(initialLang as SupportedLanguage)
      ? (initialLang as SupportedLanguage)
      : 'en',
  );
  const [tab, setTab] = useState<JourneyView>(initialRoute.view);
  const [input, setInput] = useState<TripInput>(initialInput);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [day, setDay] = useState(0);
  const [ready, setReady] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const keyboardOpen = useKeyboardViewport();
  const [error, setError] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const planController = useRef<AbortController | null>(null);
  const [saved, setSaved] = useState(true);
  const [cityId, setCityId] = useState(initialRoute.city);
  const [filter, setFilter] = useState<PlaceFilter>(initialRoute.collection);
  const [selected, setSelected] = useState<string | null>(initialRoute.place);
  const [voiceOpen,setVoiceOpen]=useState(false);
  const [voicePlaces,setVoicePlaces]=useState<VoicePlace[]>([]);
  const [voiceFocus,setVoiceFocus]=useState<VoicePlace|null>(null);
  const [touristPosition,setTouristPosition]=useState<VoicePosition|null>(null);
  const [drafts, setDrafts] = useState<Discovery[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const savedTripRef = useRef<Trip | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => () => planController.current?.abort(), []);
  const copy = journeyCopy(language);
  const city = CITIES.find((value) => value.id === cityId) || CITIES[0];
  const places = PLACES.filter(
    (place) => place.city === cityId && matchesPlaceFilter(place, filter),
  );
  const visibleDrafts = drafts.filter((draft) => draft.city === cityId);
  const selectedPlace = places.find((place) => place.id === selected);
  const selectedDraft = visibleDrafts.find((draft) => draft.id === selected);
  const cityName = (id: string) =>
    id === 'custom'
      ? tab === 'itinerary' && trip
        ? trip.input.customCity
        : input.customCity
      : local(
          CITIES.find((value) => value.id === id)?.name || {
            en: id,
            ru: id,
            uz: id,
          },
          language,
        );
  useEffect(() => {
    const lang = getSavedLanguage(initialLang);
    setLanguage(lang);
    saveLanguage(lang);
    const restored = readTrip(CITIES, PLACES);
    if (restored) {
      setTrip(restored);
      setInput(restored.input);
      savedTripRef.current = restored;
    }
    setDrafts(readDiscoveries());
    const applyRoute = () => {
      const route = readJourneyNavigation(
        window.location.search,
        CITIES,
        PLACES,
      );
      if (route.view !== 'plan') planController.current?.abort();
      setVoiceOpen(false);setTouristPosition(null);setVoiceFocus(null);
      setTab(route.view);
      setCityId(route.city);
      setSelected(route.place);
      setFilter(route.collection);
      setDay(Math.min(route.day, (savedTripRef.current?.days.length || 1) - 1));
      setShowDraft(false);
    };
    applyRoute();
    setReady(true);
    window.addEventListener('popstate', applyRoute);
    return () => window.removeEventListener('popstate', applyRoute);
  }, [initialLang]);
  useEffect(() => {
    if (!ready) return;
    const next = journeyUrl(
      new URL(window.location.href),
      { view: tab, city: cityId, place: selected, collection: filter, day },
      PLACES,
    );
    if (`${window.location.pathname}${window.location.search}` !== next)
      window.history.replaceState(window.history.state, '', next);
  }, [tab, cityId, selected, filter, day, ready]);
  useEffect(() => {
    if (showDraft) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [showDraft]);
  const navigate = (next: typeof tab) => {
    if (next !== 'plan') planController.current?.abort();
    if (next !== tab) {
      const url = journeyUrl(
        new URL(window.location.href),
        { view: next, city: cityId, place: selected, collection: filter, day },
        PLACES,
      );
      window.history.pushState(window.history.state, '', url);
    }
    setTab(next);
    setError('');
    requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  };
  const changeCity = (id: string) => {
    setVoiceFocus(null);setVoicePlaces([]);setTouristPosition(null);
    setCityId(id);
    setSelected(
      PLACES.find(
        (place) => place.city === id && matchesPlaceFilter(place, filter),
      )?.id || null,
    );
  };
  const saveTrip = async (event: React.FormEvent) => {
    event.preventDefault();
    if (planController.current) return;
    const controller = new AbortController();
    planController.current = controller;
    setError('');
    let preferencesValid = false;
    try {
      // Validate preferences locally; generation always goes through our API.
      generateTrip(input, CITIES, PLACES);
      preferencesValid = true;
      setPlanBusy(true);
      const next = await requestTrip(input, controller.signal);
      if (controller.signal.aborted) return;
      setTrip(next);
      savedTripRef.current = next;
      setDownloaded(false);
      setDay(0);
      setSaved(true);
      try {
        localStorage.setItem(TRIP_KEY, JSON.stringify(next));
      } catch {
        setSaved(false);
      }
      navigate('itinerary');
    } catch {
      if (!controller.signal.aborted) setError(copy(preferencesValid ? 'planError' : 'invalid'));
    } finally {
      if (planController.current === controller) {
        planController.current = null;
        setPlanBusy(false);
      }
    }
  };
  const saveDiscovery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (drafts.length >= 50) {
      setError(copy('draftLimit'));
      return;
    }
    const form = new FormData(event.currentTarget);
    const draft: Discovery = {
      id: createLocalId('discovery'),
      name: String(form.get('name')).trim(),
      city: cityId,
      lat: Number(form.get('lat')),
      lng: Number(form.get('lng')),
      story: String(form.get('story')).trim(),
      source: String(form.get('source')).trim(),
      kind: form.get('kind') as Discovery['kind'],
      createdAt: new Date().toISOString(),
    };
    if (
      !draft.name ||
      !draft.story ||
      !draft.source ||
      !Number.isFinite(draft.lat) ||
      !Number.isFinite(draft.lng) ||
      draft.lat < 37 ||
      draft.lat > 46 ||
      draft.lng < 55 ||
      draft.lng > 74
    ) {
      setError(copy('draftInvalid'));
      return;
    }
    const next = [draft, ...drafts];
    try {
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(next));
      setDrafts(next);
      setSelected(draft.id);
      event.currentTarget.reset();
      setShowDraft(false);
      setError('');
    } catch {
      setError(copy('storageError'));
    }
  };
  const downloadTrip = () => {
    if (!trip) return;
    const url = URL.createObjectURL(
      new Blob(['\uFEFF', tripText(trip, language, CITIES, PLACES)], {
        type: 'text/plain;charset=utf-8',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartguide-trip-${language}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  };
  return (
    <div className="tourist-app journey-app" data-keyboard-open={keyboardOpen}>
      <TouristHeader
        language={language}
        onLanguageChange={(lang) => {
          planController.current?.abort();
          setLanguage(lang);
          updateLanguage(lang);
        }}
      />
      <nav className="journey-nav" aria-label={copy('navigation')}>
        {(['plan', 'itinerary', 'map'] as const).map((key, index) => {
          const Icon = [Compass, Route, MapPin][index];
          return (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? 'page' : undefined}
              aria-label={copy(key)}
              onClick={() => navigate(key)}
            >
              <Icon aria-hidden="true" />
              <span className="nav-desktop-label">{copy(key)}</span>
              <span className="nav-mobile-label">
                {copy(
                  key === 'plan'
                    ? 'navPlan'
                    : key === 'itinerary'
                      ? 'navItinerary'
                      : 'navMap',
                )}
              </span>
            </button>
          );
        })}
      </nav>
      <main ref={mainRef} tabIndex={-1} className="journey-main">
        {tab === 'plan' && (
          <>
            <section className="journey-hero" aria-labelledby="journey-title">
              <div className="journey-hero-copy">
                <p className="eyebrow">{copy('eyebrow')}</p>
                <h1 id="journey-title">
                  {copy('title')}
                  <em>{copy('accent')}</em>
                </h1>
                <p className="journey-intro">{copy('intro')}</p>
                <a className="journey-primary" href="#trip-planner">
                  {copy('plan')}
                  <ArrowDown aria-hidden="true" />
                </a>
                <span className="hero-coordinate">
                  39°46′ N &nbsp; 64°25′ E
                </span>
              </div>
              <figure className="journey-cover">
                <img
                  src="/cities/bukhara.webp"
                  alt="Po-i-Kalyan, Bukhara"
                  fetchPriority="high"
                />
                <figcaption>
                  <span>01 / BUXORO</span>
                  <span>Oʻzbekiston</span>
                </figcaption>
                <div className="cover-note">
                  Bukhara<em>slow mornings.</em>
                </div>
              </figure>
              <div className="journey-stamp" aria-hidden="true">
                GO YOUR
                <br />
                <strong>OWN WAY</strong>
                <Sparkles />
              </div>
            </section>
            <section
              id="trip-planner"
              className="trip-planner"
              aria-labelledby="planner-title"
            >
              <div className="planner-heading">
                <p className="eyebrow">01 — {copy('plan')}</p>
                <h2 id="planner-title">{copy('plannerTitle')}</h2>
                <p>{copy('budgetHint')}</p>
              </div>
              <form onSubmit={saveTrip} className="planner-form" aria-busy={planBusy}>
                <fieldset className="planner-request-fields" disabled={planBusy}>
                <fieldset>
                  <legend>{copy('cities')}</legend>
                  <p className="field-hint">{copy('cityHint')}</p>
                  <div className="city-choices">
                    {CITIES.slice(0, 4).map((value) => (
                      <button
                        key={value.id}
                        type="button"
                        aria-pressed={input.cities.includes(value.id)}
                        onClick={() =>
                          setInput({
                            ...input,
                            cities: input.cities.includes(value.id)
                              ? input.cities.filter((id) => id !== value.id)
                              : [...input.cities, value.id],
                          })
                        }
                      >
                        {input.cities.includes(value.id) && (
                          <span>{input.cities.indexOf(value.id) + 1}</span>
                        )}
                        {local(value.name, language)}
                        {input.cities.includes(value.id) && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                  <div className="other-cities">
                    {CITIES.slice(4).map((value) => (
                      <label key={value.id}>
                        <input
                          type="checkbox"
                          checked={input.cities.includes(value.id)}
                          onChange={(event) =>
                            setInput({
                              ...input,
                              cities: event.target.checked
                                ? [...input.cities, value.id]
                                : input.cities.filter((id) => id !== value.id),
                            })
                          }
                        />
                        {local(value.name, language)}
                        {input.cities.includes(value.id) && (
                          <small>{input.cities.indexOf(value.id) + 1}</small>
                        )}
                      </label>
                    ))}
                  </div>
                  <label className="other-city-label">
                    <span>{copy('other')}</span>
                    <input
                      maxLength={100}
                      value={input.customCity}
                      onChange={(event) =>
                        setInput({ ...input, customCity: event.target.value })
                      }
                    />
                  </label>
                </fieldset>
                <div className="planner-numbers">
                  <label>
                    <span>{copy('days')}</span>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      required
                      value={input.days || ''}
                      onChange={(event) =>
                        setInput({ ...input, days: Number(event.target.value) })
                      }
                    />
                  </label>
                  <label>
                    <span>{copy('budget')}</span>
                    <input
                      type="number"
                      min={0.01}
                      max={1000000}
                      step={0.01}
                      required
                      value={input.budget || ''}
                      onChange={(event) =>
                        setInput({
                          ...input,
                          budget: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
                <fieldset>
                  <legend>{copy('interests')}</legend>
                  <div className="interest-choices">
                    {interests.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={input.interests.includes(interest)}
                        onClick={() =>
                          setInput({
                            ...input,
                            interests: input.interests.includes(interest)
                              ? input.interests.filter(
                                  (value) => value !== interest,
                                )
                              : [...input.interests, interest],
                          })
                        }
                      >
                        {copy(interest)}
                        {input.interests.includes(interest) && (
                          <Check size={14} />
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="stay-checkbox">
                  <input
                    type="checkbox"
                    checked={input.accommodation}
                    onChange={(event) =>
                      setInput({
                        ...input,
                        accommodation: event.target.checked,
                      })
                    }
                  />
                  {copy('accommodation')}
                </label>
                </fieldset>
                {error && (
                  <p role="alert" className="journey-error">
                    {error}
                  </p>
                )}
                <button type="submit" className="journey-primary" disabled={planBusy}>
                  {copy(planBusy ? 'generating' : 'generate')}
                  {planBusy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                </button>
                {planBusy && <p className="field-hint" role="status">{copy('generatingHint')}</p>}
                <p className="field-hint">{copy('estimates')}</p>
              </form>
            </section>
            <section className="discovery-teaser">
              <div>
                <p className="eyebrow">02 — {copy('map')}</p>
                <h2>{copy('mapTitle')}</h2>
                <p>{copy('mapIntro')}</p>
                <button
                  type="button"
                  className="journey-text-link"
                  onClick={() => navigate('map')}
                >
                  {copy('map')}
                  <ArrowRight />
                </button>
              </div>
              <div className="teaser-photos">
                {CITIES.slice(1, 4).map((value) => (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => {
                      changeCity(value.id);
                      navigate('map');
                    }}
                  >
                    <img
                      loading="lazy"
                      src={value.image}
                      alt={local(value.name, language)}
                    />
                    <span>
                      {local(value.name, language)}
                      <ArrowRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === 'itinerary' && (
          <section className="itinerary-view">
            <p className="eyebrow">{copy('eyebrow')}</p>
            <div className="view-heading">
              <h1>{copy('itinerary')}</h1>
              <button
                type="button"
                className="journey-text-link"
                onClick={() => navigate('plan')}
              >
                {copy('edit')}
                <ArrowRight />
              </button>
            </div>
            {!trip ? (
              <div className="journey-empty">
                <Compass />
                <p>{copy('empty')}</p>
                <button
                  type="button"
                  className="journey-primary"
                  onClick={() => navigate('plan')}
                >
                  {copy('plan')}
                  <ArrowRight />
                </button>
              </div>
            ) : (
              <>
                <p className="journey-route-names">
                  {trip.input.cities
                    .map(cityName)
                    .concat(
                      trip.input.customCity ? [trip.input.customCity] : [],
                    )
                    .join(' → ')}
                </p>
                <div className="trip-summary">
                  <div>
                    <span>{copy('total')}</span>
                    <strong>{money(trip.total, language)}</strong>
                    <small>
                      {copy('reserve')}: {money(trip.reserve, language)}
                    </small>
                  </div>
                  <div
                    className={
                      trip.shortfall ? 'budget-shortfall' : 'budget-good'
                    }
                  >
                    <Wallet />
                    <span>
                      {copy(trip.shortfall ? 'shortfall' : 'remaining')}
                    </span>
                    <strong>
                      {money(
                        trip.shortfall ||
                          budgetCents(trip.input.budget) - trip.total,
                        language,
                      )}
                    </strong>
                  </div>
                </div>
                <p className="field-hint">{copy('estimates')}</p>
                <p
                  className={`trip-save-status ${saved ? '' : 'journey-error'}`}
                  role="status"
                >
                  <Bookmark size={14} />
                  {copy(saved ? 'saved' : 'storageError')}
                </p>
                {trip.generation && <p className="trip-generation-status" role="status">
                  <Sparkles size={16} aria-hidden="true" />
                  {copy(trip.generation.source === 'groq' ? 'aiPlan' : trip.generation.fallbackReason === 'no-catalog-places' ? 'basicPlan' : 'fallbackPlan')}
                </p>}
                <details className="budget-breakdown">
                  <summary>{copy('breakdown')}</summary>
                  <dl>
                    {Object.entries(tripBreakdown(trip)).map(
                      ([kind, amount]) => (
                        <div key={kind}>
                          <dt>
                            {copy(
                              kind as keyof ReturnType<typeof tripBreakdown>,
                            )}
                          </dt>
                          <dd>{money(amount, language)}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </details>
                <button
                  type="button"
                  className="journey-outline trip-download"
                  onClick={downloadTrip}
                >
                  <Download size={17} />
                  {copy('exportTrip')}
                </button>
                <span className="sr-only" role="status">
                  {downloaded ? copy('tripDownloaded') : ''}
                </span>
                <div className="day-switcher" aria-label={copy('day')}>
                  {trip.days.map((value, index) => (
                    <button
                      key={value.number}
                      type="button"
                      aria-pressed={day === index}
                      onClick={() => setDay(index)}
                    >
                      {copy('day')} {value.number}
                      <small>{cityName(value.city)}</small>
                    </button>
                  ))}
                </div>
                <div className="mobile-day-picker">
                  <button
                    type="button"
                    className="journey-outline"
                    aria-label={copy('previousDay')}
                    disabled={day === 0}
                    onClick={() => setDay(day - 1)}
                  >
                    <ChevronLeft />
                  </button>
                  <label>
                    <span className="sr-only">{copy('chooseDay')}</span>
                    <select
                      value={day}
                      onChange={(event) => setDay(Number(event.target.value))}
                    >
                      {trip.days.map((value, index) => (
                        <option key={value.number} value={index}>
                          {copy('day')} {value.number} · {cityName(value.city)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="journey-outline"
                    aria-label={copy('nextDay')}
                    disabled={day === trip.days.length - 1}
                    onClick={() => setDay(day + 1)}
                  >
                    <ChevronRight />
                  </button>
                </div>
                <div className="day-layout">
                  <div className="day-heading">
                    <span className="day-number">
                      {String(day + 1).padStart(2, '0')}
                    </span>
                    <h2>{cityName(trip.days[day].city)}</h2>
                    <p>{money(trip.days[day].total, language)}</p>
                  </div>
                  <ol className="trip-timeline">
                    {trip.days[day].slots.map((slot, index) => {
                      const place = PLACES.find((p) => p.id === slot.placeId);
                      return (
                        <li key={`${day}-${index}`}>
                          <div className="slot-time">
                            {slot.time}
                            <small>{slot.end}</small>
                          </div>
                          <div className={`slot-content slot-${slot.kind}`}>
                            <div className="slot-title">
                              <h3>
                                {place
                                  ? local(place.name, language)
                                  : copy(
                                      slot.kind === 'visit'
                                        ? 'explore'
                                        : slot.kind,
                                    )}
                              </h3>
                              <span>
                                {slot.cost
                                  ? money(slot.cost, language)
                                  : copy(
                                      slot.kind === 'transfer'
                                        ? 'included'
                                        : 'free',
                                    )}
                              </span>
                            </div>
                            {place ? (
                              <>
                                <p>{local(place.story, language)}</p>
                                {!place.story[language] && (
                                  <small className="field-hint">English</small>
                                )}
                                <button
                                  type="button"
                                  className="journey-text-link"
                                  onClick={() => {
                                    setFilter('all');
                                    changeCity(place.city);
                                    setSelected(place.id);
                                    navigate('map');
                                  }}
                                >
                                  {copy('map')}
                                  <ArrowRight size={15} />
                                </button>
                              </>
                            ) : slot.kind === 'explore' ? (
                              <p>{copy('exploreHint')}</p>
                            ) : slot.kind === 'transfer' ? (
                              <p>
                                {cityName(slot.from!)} → {cityName(slot.to!)}.{' '}
                                {copy('transferHint')}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </>
            )}
          </section>
        )}
        {tab === 'map' && (
          <section className="map-view">
            <p className="eyebrow">02 — {copy('map')}</p>
            <div className="view-heading">
              <h1>{copy('mapTitle')}</h1>
              <button
                type="button"
                className="journey-outline"
                onClick={() => {
                  setError('');
                  setShowDraft(true);
                }}
              >
                <Plus />
                {copy('add')}
              </button>
            </div>
            <p className="map-intro">{copy('mapIntro')}</p>
            <div className="map-filterbar">
              <label>
                <span className="sr-only">{copy('cities')}</span>
                <select
                  value={cityId}
                  onChange={(event) => changeCity(event.target.value)}
                >
                  {CITIES.map((value) => (
                    <option key={value.id} value={value.id}>
                      {local(value.name, language)}
                    </option>
                  ))}
                </select>
              </label>
              {(['all', 'landmark', 'discovery'] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={filter === category}
                  className={`collection-filter collection-${category}`}
                  onClick={() => {
                    setFilter(category);
                    setSelected(
                      PLACES.find(
                        (place) =>
                          place.city === cityId &&
                          matchesPlaceFilter(place, category),
                      )?.id || null,
                    );
                  }}
                >
                  {category === 'landmark' ? (
                    <Landmark size={15} />
                  ) : category === 'discovery' ? (
                    <Sparkles size={15} />
                  ) : null}
                  {copy(category)}
                  <span className="collection-count">
                    {
                      PLACES.filter(
                        (place) =>
                          place.city === cityId &&
                          matchesPlaceFilter(place, category),
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
            <p className="collection-explanation">{copy('collectionHint')}</p>
            <div className="map-layout">
              <DiscoveryMap
                city={city}
                places={places}
                drafts={visibleDrafts}
                selected={selected}
                onSelect={id=>{setSelected(id);setVoiceFocus(null);}}
                language={language}
                onOpenVoice={()=>setVoiceOpen(true)}
                extraPlaces={voicePlaces}
                onSelectExtra={place=>{setSelected(null);setVoiceFocus(place);setVoiceOpen(true);}}
                focus={voiceFocus}
                touristLocation={touristPosition}
              />
              <aside className="map-place-panel">
                {selectedPlace ? (
                  <article className="place-story">
                    <p className="eyebrow">
                      {cityName(selectedPlace.city)} ·{' '}
                      {copy(selectedPlace.category)}
                    </p>
                    <h2>{local(selectedPlace.name, language)}</h2>
                    <p>{local(selectedPlace.story, language)}</p>
                    {!selectedPlace.story[language] && (
                      <small className="field-hint">English</small>
                    )}
                    {selectedPlace.history && (
                      <section className="place-history">
                        <h3>
                          <History size={16} />
                          {copy('historicalContext')}
                        </h3>
                        <p>{local(selectedPlace.history, language)}</p>
                      </section>
                    )}
                    <div className="place-practical">
                      <span>
                        <Clock3 size={15} />
                        {selectedPlace.minutes} min
                      </span>
                      <span>
                        {selectedPlace.admission
                          ? `${copy('admission')}: ${money(selectedPlace.admission, language)}`
                          : copy('free')}
                      </span>
                    </div>
                    <a
                      href={selectedPlace.source}
                      target="_blank"
                      rel="noreferrer"
                      className="journey-text-link"
                    >
                      {copy('source')}
                      <ArrowRight size={15} />
                    </a>
                    {selectedPlace.guideSlug && (
                      <Link
                        href={`/l/${selectedPlace.guideSlug}?lang=${language}`}
                        className="journey-primary"
                      >
                        {copy('guide')}
                        <ArrowRight />
                      </Link>
                    )}
                    <p className="field-hint">{copy('estimates')}</p>
                  </article>
                ) : selectedDraft ? (
                  <article className="place-story">
                    <p className="eyebrow">
                      {copy('unverified')} · {copy(selectedDraft.kind)}
                    </p>
                    <h2>{selectedDraft.name}</h2>
                    <p>{selectedDraft.story}</p>
                    <p className="draft-source">
                      {copy('source')}: {selectedDraft.source}
                    </p>
                    <button
                      type="button"
                      className="journey-text-link"
                      onClick={() => {
                        const next = drafts.filter(
                          (value) => value.id !== selectedDraft.id,
                        );
                        try {
                          localStorage.setItem(
                            DISCOVERY_KEY,
                            JSON.stringify(next),
                          );
                          setDrafts(next);
                          setSelected(null);
                          setError('');
                        } catch {
                          setError(copy('storageError'));
                        }
                      }}
                    >
                      {copy('remove')}
                      <X size={15} />
                    </button>
                  </article>
                ) : (
                  <div className="place-story">
                    <Compass />
                    <p>{copy('collectionNote')}</p>
                  </div>
                )}
                <div className="place-list">
                  {places.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      aria-pressed={selected === place.id}
                      onClick={() => setSelected(place.id)}
                    >
                      <span
                        className={`place-category-symbol ${place.category}`}
                        aria-hidden="true"
                      >
                        {place.category === 'discovery' ? (
                          <Sparkles size={15} />
                        ) : (
                          <Landmark size={15} />
                        )}
                      </span>
                      <span className="place-list-title">
                        {local(place.name, language)}
                        <small>{copy(place.category)}</small>
                      </span>
                    </button>
                  ))}
                  {visibleDrafts.map((draft) => (
                    <button
                      key={draft.id}
                      type="button"
                      aria-pressed={selected === draft.id}
                      onClick={() => setSelected(draft.id)}
                    >
                      <span>◇</span>
                      {draft.name}
                      <small>{copy('unverified')}</small>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
            <p className="field-hint">{copy('collectionNote')}</p>
            {error && (
              <p role="alert" className="journey-error">
                {error}
              </p>
            )}
            <section className="journey-camera">
              <Camera aria-hidden="true" />
              <div><h2>{voiceCopy(language)('title')}</h2><p>{voiceCopy(language)('intro')}</p></div>
              <button type="button" className="journey-primary" onClick={()=>setVoiceOpen(true)}>{voiceCopy(language)('open')}<ArrowRight /></button>
            </section>
          </section>
        )}
        <MapVoiceAssistant open={voiceOpen&&tab==='map'} onClose={()=>setVoiceOpen(false)} city={city} language={language}
          location={touristPosition} onLocation={setTouristPosition} onPlaces={setVoicePlaces}
          focusPlace={voiceFocus?.id==='tourist-location'?null:voiceFocus??(selectedPlace?{id:selectedPlace.id,name:local(selectedPlace.name,language),lat:selectedPlace.lat,lng:selectedPlace.lng}:null)}
          onFocus={place=>{setVoiceFocus(place);if(place.id!=='tourist-location')setVoicePlaces(current=>[...current.filter(p=>p.id!==place.id),place]);}}/>
        <footer className="journey-footer">
          <span>smartguide / Oʻzbekiston</span>
          <span>{copy('collectionNote')}</span>
          <a href="/credits.html" target="_blank" rel="noreferrer">
            {copy('photoCredits')}
          </a>
        </footer>
      </main>
      <dialog
        ref={dialogRef}
        className="discovery-dialog"
        onCancel={() => setShowDraft(false)}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.target === event.currentTarget &&
            (event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom)
          )
            setShowDraft(false);
        }}
        aria-labelledby="draft-title"
      >
        <button
          type="button"
          className="dialog-close"
          aria-label={copy('close')}
          onClick={() => setShowDraft(false)}
        >
          <X />
        </button>
        <h2 id="draft-title">{copy('add')}</h2>
        <p>{copy('contributionHint')}</p>
        <form onSubmit={saveDiscovery}>
          <label>
            {copy('name')}
            <input name="name" maxLength={100} required autoFocus />
          </label>
          <label>
            {copy('cities')}
            <select
              value={cityId}
              onChange={(event) => changeCity(event.target.value)}
            >
              {CITIES.map((value) => (
                <option key={value.id} value={value.id}>
                  {local(value.name, language)}
                </option>
              ))}
            </select>
          </label>
          <div className="planner-numbers">
            <label>
              {copy('latitude')}
              <input
                key={`lat-${cityId}`}
                name="lat"
                type="number"
                step="any"
                min={37}
                max={46}
                defaultValue={city.lat}
                required
              />
            </label>
            <label>
              {copy('longitude')}
              <input
                key={`lng-${cityId}`}
                name="lng"
                type="number"
                step="any"
                min={55}
                max={74}
                defaultValue={city.lng}
                required
              />
            </label>
          </div>
          <label>
            {copy('story')}
            <textarea name="story" maxLength={2000} rows={4} required />
          </label>
          <label>
            {copy('reference')}
            <input name="source" maxLength={500} required />
          </label>
          <label>
            {copy('storyType')}
            <select name="kind">
              <option value="personal">{copy('personal')}</option>
              <option value="legend">{copy('legend')}</option>
              <option value="fact">{copy('fact')}</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="journey-error">
              {error}
            </p>
          )}
          <button type="submit" className="journey-primary">
            {copy('add')}
            <Bookmark />
          </button>
        </form>
      </dialog>
    </div>
  );
}
