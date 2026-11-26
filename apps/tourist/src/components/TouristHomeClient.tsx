'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Bookmark,
  Camera,
  Check,
  Clock3,
  Compass,
  Loader2,
  MapPin,
  Plus,
  Route,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import type { GuideAskResponse, SupportedLanguage } from '@smartguide/shared';
import { CITIES, PLACES } from '@/lib/places';
import {
  DISCOVERY_KEY,
  TRIP_KEY,
  generateTrip,
  local,
  money,
  readDiscoveries,
  readTrip,
  type Discovery,
  type Interest,
  type Trip,
  type TripInput,
} from '@/lib/journey';
import { journeyCopy } from '@/lib/journey-copy';
import {
  getOrCreateSessionId,
  getSavedLanguage,
  saveLanguage,
  updateLanguage,
} from '@/lib/session';
import { compressImageToBase64 } from '@/lib/image-utils';
import { askGuide } from '@/lib/api';
import { TouristHeader } from './TouristHeader';
import { DiscoveryMap } from './DiscoveryMap';
import { AudioGuidePlayer } from './AudioGuidePlayer';

const initialInput: TripInput = {
  cities: ['bukhara'],
  days: 4,
  budget: 2000000,
  interests: ['local', 'history'],
  accommodation: true,
  customCity: '',
};
const interests: Interest[] = ['history', 'local', 'food', 'nature', 'sacred'];
export function TouristHomeClient({ initialLang }: { initialLang?: string }) {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [tab, setTab] = useState<'plan' | 'itinerary' | 'map'>('plan');
  const [input, setInput] = useState<TripInput>(initialInput);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [day, setDay] = useState(0);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(true);
  const [cityId, setCityId] = useState('bukhara');
  const [filter, setFilter] = useState(false);
  const [selected, setSelected] = useState<string | null>('chor-bakr');
  const [drafts, setDrafts] = useState<Discovery[]>([]);
  const [showDraft, setShowDraft] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [photoResult, setPhotoResult] = useState<GuideAskResponse | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoLock = useRef(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const copy = journeyCopy(language);
  const city = CITIES.find((value) => value.id === cityId) || CITIES[0];
  const places = PLACES.filter(
    (place) => place.city === cityId && (!filter || place.local),
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
    }
    setDrafts(readDiscoveries());
  }, [initialLang]);
  useEffect(() => {
    if (showDraft) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [showDraft]);
  const navigate = (next: typeof tab) => {
    setTab(next);
    setError('');
    requestAnimationFrame(() => {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  };
  const changeCity = (id: string) => {
    setCityId(id);
    setSelected(
      PLACES.find((place) => place.city === id && (!filter || place.local))
        ?.id || null,
    );
  };
  const saveTrip = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const next = generateTrip(input, CITIES, PLACES);
      setTrip(next);
      setDay(0);
      setSaved(true);
      try {
        localStorage.setItem(TRIP_KEY, JSON.stringify(next));
      } catch {
        setSaved(false);
      }
      navigate('itinerary');
    } catch {
      setError(copy('invalid'));
    }
  };
  const choosePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || photoLock.current) return;
    photoLock.current = true;
    setPhotoBusy(true);
    setPhotoError(false);
    setPhotoResult(null);
    try {
      const photo = await compressImageToBase64(file);
      setPhotoPreview(photo.previewDataUrl);
      const result = await askGuide({
        question: '',
        language,
        sessionId: getOrCreateSessionId(),
        imageBase64: photo.base64,
        imageMimeType: photo.mimeType,
        includeAudio: true,
      });
      if (
        !result.identifiedByVision ||
        ![
          'kalta-minor',
          'juma-mosque',
          'pahlavon-mahmud',
          'tosh-hovli',
          'kunya-ark',
        ].includes(result.landmarkSlug)
      )
        throw Error('Unknown pilot place');
      setPhotoResult(result);
    } catch {
      setPhotoError(true);
    } finally {
      photoLock.current = false;
      setPhotoBusy(false);
    }
  };
  const saveDiscovery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const draft: Discovery = {
      id: crypto.randomUUID(),
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
    )
      return;
    const next = [draft, ...drafts].slice(0, 50);
    try {
      localStorage.setItem(DISCOVERY_KEY, JSON.stringify(next));
      setDrafts(next);
      setSelected(draft.id);
      setShowDraft(false);
      setError('');
    } catch {
      setError(copy('storageError'));
    }
  };
  return (
    <div className="tourist-app journey-app">
      <TouristHeader
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          updateLanguage(lang);
        }}
      />
      <nav className="journey-nav" aria-label="SmartGuide">
        {(['plan', 'itinerary', 'map'] as const).map((key, index) => {
          const Icon = [Compass, Route, MapPin][index];
          return (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? 'page' : undefined}
              onClick={() => navigate(key)}
            >
              <Icon aria-hidden="true" />
              <span>{copy(key)}</span>
              {key === 'itinerary' && trip && <span className="nav-dot" />}
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
              <form onSubmit={saveTrip} className="planner-form">
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
                      min={1}
                      max={1000000000}
                      step={1}
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
                {error && (
                  <p role="alert" className="journey-error">
                    {error}
                  </p>
                )}
                <button type="submit" className="journey-primary">
                  {copy('generate')}
                  <ArrowRight aria-hidden="true" />
                </button>
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
                        trip.shortfall || trip.input.budget - trip.total,
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
              <button
                type="button"
                aria-pressed={!filter}
                onClick={() => setFilter(false)}
              >
                {copy('all')}
              </button>
              <button
                type="button"
                aria-pressed={filter}
                onClick={() => {
                  setFilter(true);
                  setSelected(
                    PLACES.find((place) => place.city === cityId && place.local)
                      ?.id || null,
                  );
                }}
              >
                <Sparkles size={14} />
                {copy('localFilter')}
              </button>
            </div>
            <div className="map-layout">
              <DiscoveryMap
                city={city}
                places={places}
                drafts={visibleDrafts}
                selected={selected}
                onSelect={setSelected}
                language={language}
              />
              <aside className="map-place-panel">
                {selectedPlace ? (
                  <article className="place-story">
                    <p className="eyebrow">
                      {cityName(selectedPlace.city)} ·{' '}
                      {selectedPlace.local ? '✦' : ''}
                    </p>
                    <h2>{local(selectedPlace.name, language)}</h2>
                    <p>{local(selectedPlace.story, language)}</p>
                    {!selectedPlace.story[language] && (
                      <small className="field-hint">English</small>
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
                      <span>{place.local ? '✦' : '○'}</span>
                      {local(place.name, language)}
                      <ArrowRight size={15} />
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
              <Camera />
              <div>
                <h2>{copy('camera')}</h2>
                <p>{copy('cameraHint')}</p>
              </div>
              <input
                ref={photoRef}
                className="sr-only"
                type="file"
                accept="image/*"
                tabIndex={-1}
                onChange={choosePhoto}
              />
              <button
                type="button"
                className="journey-outline"
                disabled={photoBusy}
                onClick={() => photoRef.current?.click()}
              >
                {photoBusy ? <Loader2 className="animate-spin" /> : <Camera />}
                {copy('choosePhoto')}
              </button>
              {photoError && (
                <p role="alert" className="journey-error">
                  {copy('photoError')}
                </p>
              )}
              {photoResult && (
                <div className="journey-photo-result">
                  {photoPreview && (
                    <img src={photoPreview} alt={copy('camera')} />
                  )}
                  <p>{photoResult.answer}</p>
                  <AudioGuidePlayer
                    audioBase64={photoResult.audioBase64}
                    audioMimeType={photoResult.audioMimeType}
                    fallbackText={photoResult.answer}
                    language={photoResult.language}
                  />
                  <Link
                    className="journey-text-link"
                    href={`/l/${photoResult.landmarkSlug}?lang=${language}`}
                  >
                    {copy('guide')}
                    <ArrowRight />
                  </Link>
                </div>
              )}
            </section>
          </section>
        )}
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
          if (event.target === event.currentTarget) setShowDraft(false);
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
