'use client';
import { useEffect, useRef, useState } from 'react';
import { AudioLines, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Compass, Download, ArrowRight, Landmark, Leaf, Loader2, Map as MapIcon, MapPin, Navigation, Pencil, Plus, Route, Ticket, Trash2, UserRound, Utensils, Wallet, X } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { CITIES, PLACES } from '@/lib/places';
import { local, money, distanceKm, readTrip, readDiscoveries, matchesPlaceFilter, TRIP_KEY, DISCOVERY_KEY, type Trip, type TripInput, type Place, type PlaceFilter, type Discovery } from '@/lib/journey';
import { journeyCopy } from '@/lib/journey-copy';
import { hubCopy, tripDays } from '@/lib/hub-copy';
import { voiceCopy } from '@/lib/voice-copy';
import { getSavedLanguage, saveLanguage, updateLanguage, createLocalId } from '@/lib/session';
import { readJourneyNavigation, journeyUrl, type JourneyView } from '@/lib/journey-navigation';
import { composeTrip, currentTrip, parseComposedTrip } from '@/lib/trip-api';
import { readAccess, registrationRequired, type AccessState } from '@/lib/access-api';
import { planningCopy } from '@/lib/planning-copy';
import { TrialStatus } from './TrialStatus';
import { tripBreakdown, tripText } from '@/lib/trip-summary';
import { useTouristLocation } from '@/lib/use-tourist-location';
import { useKeyboardViewport } from '@/lib/use-keyboard-viewport';
import type { VoicePlace } from '@/lib/live-voice';
import { LanguageSwitcher } from './LanguageSwitcher';
import { DiscoveryMap } from './DiscoveryMap';
import { MapVoiceAssistant } from './MapVoiceAssistant';
import { HubOnboarding } from './HubOnboarding';
import { HubSnap } from './HubSnap';
import { HubPass } from './HubPass';
import { HubAuth } from './HubAuth';
import { currentAccount, type Account } from '@/lib/auth-api';
import { authCopy } from '@/lib/auth-copy';

const defaultInput: TripInput={cities:['samarkand','bukhara'],days:4,budget:200,interests:['history','local'],accommodation:true,customCity:''};
const preferenceKey='smartguide_preferences_v1';
const normalizedName=(name:string)=>name.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
const uniquePlaces=(places:VoicePlace[])=>[...new Map(places.map(place=>[place.id,place])).values()];

export function SmartGuideHub({initialLang,initialQuery=''}:{initialLang?:string;initialQuery?:string}) {
  const initial=readJourneyNavigation(initialQuery,CITIES,PLACES);
  const [language,setLanguage]=useState<SupportedLanguage>(['en','ru','uz','es','ja','ko'].includes(initialLang??'')?initialLang as SupportedLanguage:'en');
  const [view,setView]=useState<JourneyView>(initial.view),[cityId,setCityId]=useState(initial.city),[selected,setSelected]=useState<string|null>(initial.place);
  const [filter,setFilter]=useState<PlaceFilter>(initial.collection),[day,setDay]=useState(initial.day);
  const [input,setInput]=useState<TripInput>(defaultInput),[trip,setTrip]=useState<Trip|null>(null),[ready,setReady]=useState(false);
  const [pending,setPending]=useState(false),[error,setError]=useState(''),[stored,setStored]=useState(true),[downloaded,setDownloaded]=useState(false);
  const [voiceOpen,setVoiceOpen]=useState(false),[nearby,setNearby]=useState<VoicePlace[]>([]),[focus,setFocus]=useState<VoicePlace|null>(null);
  const [voiceActive,setVoiceActive]=useState(false);
  const [account,setAccount]=useState<Account|null>(null),[authIntent,setAuthIntent]=useState(false),[authMode,setAuthMode]=useState<'register'|'login'>('register');
  const [access,setAccess]=useState<AccessState|null>(null),[gate,setGate]=useState<'plans'|'photos'|'voice'|null>(null);
  const [editInstruction,setEditInstruction]=useState(''),[voicePurpose,setVoicePurpose]=useState<'plan'|'guide'>('guide');
  const [drafts,setDrafts]=useState<Discovery[]>([]),[draftOpen,setDraftOpen]=useState(false);
  const location=useTouristLocation(),keyboardOpen=useKeyboardViewport();
  const main=useRef<HTMLElement>(null),draftDialog=useRef<HTMLDialogElement>(null),planning=useRef<AbortController|null>(null),tripRef=useRef<Trip|null>(null);
  const c=journeyCopy(language),h=hubCopy(language),v=voiceCopy(language),a=authCopy(language),p=planningCopy(language);
  const allPlaces=[...new Map([...PLACES,...(trip?.places??[])].map(place=>[place.id,place])).values()];
  const city=CITIES.find(value=>value.id===cityId)??CITIES[0];
  const cityName=(id:string)=>id==='custom'?input.customCity:local(CITIES.find(value=>value.id===id)?.name??{en:id,ru:id,uz:id},language);
  const cityPlaces=allPlaces.filter(place=>place.city===cityId);
  const places=cityPlaces.filter(place=>matchesPlaceFilter(place,filter));
  const publicExtras=nearby.filter(place=>!allPlaces.some(known=>known.id===place.id||Object.values(known.name).some(name=>name&&normalizedName(name)===normalizedName(place.name)))&&place.kind!=='area');
  const activeExtra=focus&&focus.id!=='tourist-location'?focus:location.position?nearby[0]??null:null;
  const activeKnown=allPlaces.find(place=>place.id===(activeExtra?.id??selected)&&(activeExtra?.id?true:place.city===cityId));
  const activeDraft=drafts.find(draft=>draft.id===selected);
  const activeName=activeKnown?local(activeKnown.name,language):activeExtra?.name??activeDraft?.name;
  const activeStory=activeKnown?local(activeKnown.story,language):activeDraft?.story;
  const currentDay=trip?.days[Math.min(day,(trip?.days.length??1)-1)];
  const firstPlace=(id:string,col:PlaceFilter=filter)=>allPlaces.find(place=>place.city===id&&matchesPlaceFilter(place,col))?.id??null;

  useEffect(()=>{let active=true;void currentAccount().then(user=>{if(active)setAccount(user);}).catch(()=>{});return()=>{active=false;};},[]);
  useEffect(()=>{
    const lang=getSavedLanguage(initialLang);setLanguage(lang);saveLanguage(lang);
    const saved=readTrip(CITIES,allPlaces);if(saved){setTrip(saved);tripRef.current=saved;setInput(saved.input);
      const initialSearch=new URLSearchParams(initialQuery);const savedCity=saved.days[0]?.city;
      if(!initialSearch.has('city')&&!initialSearch.has('place')&&savedCity&&CITIES.some(c=>c.id===savedCity)){setCityId(savedCity);setSelected(allPlaces.find(p=>p.city===savedCity)?.id??null);}
    }
    try{const draft=JSON.parse(localStorage.getItem(preferenceKey)??'null') as TripInput|null;
      if(draft&&Array.isArray(draft.cities)&&draft.cities.every(id=>CITIES.some(city=>city.id===id))&&draft.cities.length<=14&&Number.isInteger(draft.days)&&draft.days>=1&&draft.days<=14&&draft.days>=draft.cities.length&&Number.isFinite(draft.budget)&&draft.budget>0&&draft.budget<=1000000&&Array.isArray(draft.interests)&&draft.interests.length>0&&draft.interests.every(value=>['history','local','food','nature','sacred'].includes(value))&&typeof draft.accommodation==='boolean'&&typeof draft.customCity==='string'&&draft.customCity.length<=100)setInput(draft);
    }catch{}
    setDrafts(readDiscoveries());

    const restore=()=>{const route=readJourneyNavigation(window.location.search,CITIES,allPlaces);planning.current?.abort();setVoiceOpen(false);location.clear();setFocus(null);setView(route.view);setCityId(route.city);setSelected(route.place);setFilter(route.collection);setDay(Math.min(route.day,(tripRef.current?.days.length??1)-1));setDraftOpen(false);setLanguage(getSavedLanguage(new URLSearchParams(window.location.search).get('lang')??undefined));};
    window.addEventListener('popstate',restore);setReady(true);
    return()=>{window.removeEventListener('popstate',restore);planning.current?.abort();};
  },[]);
  useEffect(()=>{const controller=new AbortController();void currentTrip(controller.signal).then(state=>{if(controller.signal.aborted)return;setAccess(state.access);if(state.trip){setTrip(state.trip);tripRef.current=state.trip;setInput(state.trip.input);try{localStorage.setItem(TRIP_KEY,JSON.stringify(state.trip));}catch{setStored(false);}}}).catch(()=>{});return()=>controller.abort();},[]);
  const refreshAccess=()=>{void readAccess().then(setAccess).catch(()=>{});};
  useEffect(()=>{
    if(!ready)return;
    const url=journeyUrl(new URL(window.location.href),{view,city:cityId,place:selected,collection:filter,day},allPlaces);
    if(window.location.pathname+window.location.search!==url)window.history.replaceState(window.history.state,'',url);
  },[view,cityId,selected,filter,day,ready]);
  useEffect(()=>{if(!ready)return;try{localStorage.setItem(preferenceKey,JSON.stringify(input));}catch{}},[input,ready]);
  useEffect(()=>{
    if(!location.position){setFocus(current=>current?.id==='tourist-location'?null:current);return;}
    const point=location.position;setSelected(null);setFocus({...point,id:'tourist-location',name:v('gps')});
    const nearest=[...CITIES].sort((a,b)=>distanceKm(point,a)-distanceKm(point,b))[0];
    if(distanceKm(point,nearest)<100)setCityId(nearest.id);
  },[location.position?.lat,location.position?.lng]);
  useEffect(()=>{if(draftOpen)draftDialog.current?.showModal();else draftDialog.current?.close();},[draftOpen]);

  useEffect(()=>{if(ready)window.scrollTo({top:0,behavior:'auto'});},[view,ready]);

  const go=(next:JourneyView,overrides?:{city?:string;place?:string|null})=>{
    if(next!=='plan')planning.current?.abort();
    const dayCity=view==='itinerary'&&(next==='map'||next==='guide')&&currentDay&&CITIES.some(city=>city.id===currentDay.city)?currentDay.city:cityId;
    const nextCity=overrides?.city??dayCity;
    let nextPlace=overrides?.place!==undefined?overrides.place:selected;
    if(nextCity!==cityId){
      if(overrides?.city)location.clear();
      setCityId(nextCity);setFocus(null);setNearby([]);
      if(overrides?.place===undefined)nextPlace=next==='guide'?null:firstPlace(nextCity);
    }else if(next==='map'&&nextPlace&&!allPlaces.some(p=>p.id===nextPlace&&p.city===nextCity)&&!drafts.some(d=>d.id===nextPlace&&d.city===nextCity)){
      nextPlace=firstPlace(nextCity);
    }else if(next==='guide'&&view==='itinerary'&&overrides?.place===undefined){
      nextPlace=null;setFocus(null);
    }
    if(nextPlace!==selected)setSelected(nextPlace);
    if(next!==view){const url=journeyUrl(new URL(window.location.href),{view:next,city:nextCity,place:nextPlace,collection:filter,day},allPlaces);window.history.pushState(window.history.state,'',url);}
    if(view==='guide'&&next!=='guide')setVoiceOpen(voiceActive&&next!=='snap');
    if(next==='snap'||next==='auth')setVoiceOpen(false);
    setView(next);setError('');requestAnimationFrame(()=>{main.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});});
  };
  const changeCity=(id:string)=>{location.clear();setCityId(id);setFocus(null);setNearby([]);setSelected(allPlaces.find(place=>place.city===id)?.id??null);};
  const showPlace=(place:VoicePlace)=>{
    const targetCity=place.cityId&&CITIES.some(city=>city.id===place.cityId)?place.cityId:cityId;
    const targetId=allPlaces.some(known=>known.id===place.id)?place.id:null;
    if(view!=='map')go('map',{city:targetCity,place:targetId});
    setCityId(targetCity);setSelected(targetId);setFocus(place);setNearby(current=>uniquePlaces([...current,place]));
  };
  const talk=(place?:Place|VoicePlace)=>{
    if(!access){refreshAccess();return;}setVoicePurpose(view==='plan'?'plan':'guide');
    if(place){if('city'in place)setCityId(place.city);setSelected(place.id);setFocus('city'in place?{id:place.id,name:local(place.name,language),lat:place.lat,lng:place.lng}:place);}
    else if(view==='itinerary'&&currentDay&&CITIES.some(city=>city.id===currentDay.city)){setCityId(currentDay.city);setFocus(null);setSelected(null);}
    setVoiceOpen(true);
  };
  const requireRegistration=(feature:'plans'|'photos'|'voice')=>{setGate(feature);setAuthIntent(feature==='plans');setAuthMode('register');setVoiceOpen(false);go('auth');refreshAccess();};
  const acceptTrip=(result:Trip,navigate=true)=>{
    const startCity=result.days[0]?.city==='custom'?cityId:result.days[0]?.city??cityId;
    setTrip(result);tripRef.current=result;setInput(result.input);setDay(0);setCityId(startCity);setSelected(result.days[0]?.slots.find(slot=>slot.placeId)?.placeId??null);setFocus(null);
    try{localStorage.setItem(TRIP_KEY,JSON.stringify(result));setStored(true);}catch{setStored(false);}
    setGate(null);setAuthIntent(false);refreshAccess();if(navigate)go('itinerary',{city:startCity,place:result.days[0]?.slots.find(slot=>slot.placeId)?.placeId??null});
  };
  const build=async(action:'create'|'revise'='create',instruction='',excludePlaceId?:string)=>{
    if(planning.current)return;if(!access){setError(c('planError'));refreshAccess();return;}const controller=new AbortController();planning.current=controller;setPending(true);setError('');
    try{const result=await composeTrip(action==='revise'&&trip?trip.input:input,{language,instruction,action:action==='revise'&&trip?.revision?'revise':'create',excludePlaceId},controller.signal);if(controller.signal.aborted)return;
      acceptTrip(result);setEditInstruction('');
    }catch(error){if(!controller.signal.aborted){if(registrationRequired(error))requireRegistration('plans');else setError(c('planError'));}}finally{if(planning.current===controller){planning.current=null;setPending(false);}}
  };
  const voiceTrip=(raw:unknown)=>{try{acceptTrip(parseComposedTrip(raw),false);}catch{setError(c('planError'));}};
  const planByVoice=()=>{if(!access){refreshAccess();return;}setVoicePurpose('plan');setVoiceOpen(true);};
  const download=()=>{if(!trip)return;const url=URL.createObjectURL(new Blob(['\uFEFF',tripText(trip,language,CITIES,allPlaces)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`smartguide-${language}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setDownloaded(true);};
  const saveDraft=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const data=new FormData(event.currentTarget);const draft:Discovery={id:createLocalId('discovery'),city:cityId,name:String(data.get('name')).trim(),story:String(data.get('story')).trim(),source:String(data.get('source')).trim(),kind:data.get('kind') as Discovery['kind'],lat:Number(data.get('lat')),lng:Number(data.get('lng')),createdAt:new Date().toISOString()};
    if(!draft.name||!draft.story||!draft.source||draft.lat<37||draft.lat>46||draft.lng<55||draft.lng>74||![draft.lat,draft.lng].every(Number.isFinite)){setError(c('draftInvalid'));return;}
    if(drafts.length>=50){setError(c('draftLimit'));return;}
    try{const next=[draft,...drafts];localStorage.setItem(DISCOVERY_KEY,JSON.stringify(next));setDrafts(next);setSelected(draft.id);setFocus(null);setDraftOpen(false);setError('');}catch{setError(c('storageError'));}
  };
  const removeDraft=(id:string)=>{try{const next=drafts.filter(value=>value.id!==id);localStorage.setItem(DISCOVERY_KEY,JSON.stringify(next));setDrafts(next);setSelected(null);}catch{setError(c('storageError'));}};

  const prepareTrip=()=>void build();
  const featured=location.position?nearby[0]:allPlaces.find(place=>place.id===currentDay?.slots.find(slot=>slot.placeId)?.placeId);
  const featuredName=featured?('city'in featured?local(featured.name,language):featured.name):h('nearby');
  return <div className="tourist-app hub-app" data-view={view} data-keyboard-open={keyboardOpen}>
    <header className="hub-header"><div className="hub-header-inner"><button type="button" className="hub-brand" onClick={()=>go(trip?'itinerary':'plan')} aria-label="SmartGuide"><span className="hub-brand-icon"><Compass size={23}/></span><span><strong>SmartGuide</strong><small>GPS · {h('cities')}</small></span></button>
      <div className="hub-header-actions">{view==='plan'||view==='auth'?<button type="button" className="hub-icon-button" aria-label={`Live — ${v('open')}`} onClick={()=>talk()}><AudioLines size={19}/></button>:<button type="button" className={`hub-icon-button ${location.position?'is-located':''}`} onClick={location.toggle} aria-label={v(location.position?'locationOff':'location')} aria-pressed={!!location.position}>{location.locating?<Loader2 className="animate-spin" size={19}/>:<Navigation size={19}/>}</button>}<LanguageSwitcher value={language} onChange={lang=>{setLanguage(lang);updateLanguage(lang);}}/><button type="button" className="hub-account-button" aria-label={a(account?'account':'login')} onClick={()=>{setAuthIntent(false);setAuthMode('login');go('auth');}}>{account?account.name.slice(0,1).toUpperCase():<UserRound size={18}/>}</button></div>
    </div></header>
    <main ref={main} tabIndex={-1} className={`hub-main hub-view-${view}`}>
      {view==='plan'&&<><TrialStatus access={access} language={language}/><HubOnboarding input={input} onChange={setInput} language={language} pending={pending||!access} error={error} onGenerate={prepareTrip} onVoice={planByVoice} onSaved={trip?()=>go('itinerary'):undefined}/></>}
      {view==='itinerary'&&(!trip?<section className="hub-empty"><Route size={46}/><h1>{h('noTrip')}</h1><p>{h('noTripHint')}</p><button className="hub-button" onClick={()=>go('plan')}>{c('plan')}<ArrowRight size={18}/></button></section>:<section className="hub-roadmap hub-screen">
        <TrialStatus access={access} language={language}/><div className="hub-page-title"><span className="hub-eyebrow">{trip.generation?.source==='groq'?p('aiPlan'):h('personal')}</span><div className="hub-title-row"><h1>{h('yourJourney')}</h1><button className="hub-icon-button" type="button" aria-label={c('edit')} onClick={()=>go('plan')}><Pencil size={19}/></button></div><p>{trip.input.cities.map(cityName).join(' · ')||trip.input.customCity} · {tripDays(trip.days.length,language)}</p></div>
        {trip.summary&&<p className="hub-notice" role="status">{trip.summary}</p>}
        <div className="hub-trip-summary"><div><span>{h('destinations')}</span><strong>{trip.input.cities.length||1}</strong></div><div><span>{c('total')}</span><strong className="hub-mono">{money(trip.total,language)}</strong></div><div><span>{c('reserve')}</span><strong className="hub-mono">{money(trip.reserve,language)}</strong></div></div>
        {trip.shortfall>0&&<p className="hub-error">{c('shortfall')}: {money(trip.shortfall,language)}</p>}
        <div className="hub-nearby-hero"><div className="hub-hero-meta"><Navigation size={17}/><span>{location.position?v('gps'):cityName(currentDay?.city??cityId)}</span></div><h2>{featuredName}</h2><p>{featured&&'city'in featured?local(featured.story,language).split(/(?<=[.!?])\s/)[0]:h('gpsHint')}</p><div className="hub-actions"><button className="hub-button hub-button-terra" type="button" onClick={()=>talk(featured)}><AudioLines size={18}/>Live · {h('guide')}</button><button className="hub-button hub-button-glass" onClick={()=>go('snap')}><Camera size={18}/>Snap &amp; Ask</button></div></div>
        <div className="hub-section-heading"><h2>{h('roadmap')}</h2><span className="hub-mono">{stored?h('saved'):c('storageError')}</span></div>
        {trip.generation?.source==='local-fallback'&&<p className="hub-notice">{c(trip.generation.fallbackReason==='no-catalog-places'?'basicPlan':'fallbackPlan')}</p>}
        <div className="hub-day-selector"><button className="hub-icon-button" disabled={day<=0} aria-label={c('previousDay')} onClick={()=>setDay(value=>value-1)}><ChevronLeft/></button><select aria-label={c('chooseDay')} value={Math.min(day,trip.days.length-1)} onChange={event=>setDay(Number(event.target.value))}>{trip.days.map((value,index)=><option key={value.number} value={index}>{c('day')} {value.number} · {cityName(value.city)}</option>)}</select><button className="hub-icon-button" disabled={day>=trip.days.length-1} aria-label={c('nextDay')} onClick={()=>setDay(value=>value+1)}><ChevronRight/></button></div>
        <ol className="hub-timeline">{currentDay?.slots.map((slot,index)=>{const place=allPlaces.find(value=>value.id===slot.placeId);const Icon=slot.kind==='visit'?Landmark:['breakfast','lunch','dinner'].includes(slot.kind)?Utensils:slot.kind==='explore'?Compass:slot.kind==='stay'?MapPin:Route;return <li key={`${slot.time}-${index}`} className={place?'hub-visit':''}><div className="hub-timeline-time"><span>{slot.time}</span><i/></div><article className="hub-stop-card">
          {place?.guideSlug&&<img className="hub-stop-image" src={`/landmarks/${place.guideSlug}.webp`} alt={local(place.name,language)} loading="lazy"/>}
          <div className="hub-stop-content"><div className="hub-stop-heading"><Icon size={19}/><h3>{place?local(place.name,language):c(slot.kind==='visit'?'explore':slot.kind)}</h3><span>{money(slot.cost,language)}</span></div><div className="hub-stop-meta"><span>{slot.time}–{slot.end}</span>{place&&<span>{cityName(place.city)}</span>}</div>
            {place?<><p lang={place.story[language]?language:'en'}>{local(place.story,language)}{(!place.story[language]||place.storyLanguage==='en'&&language!=='en')&&<small className="hub-language-note">English</small>}</p><div className="hub-actions"><button className="hub-button" onClick={()=>talk(place)}><AudioLines size={17}/>{h('listen')}</button><button className="hub-button hub-button-light" onClick={()=>go('map',{city:place.city,place:place.id})}><MapIcon size={17}/>{c('navMap')}</button><button className="hub-button hub-button-light" disabled={pending} onClick={()=>void build('revise',`${p('remove')}: ${local(place.name,language)}`,place.id)}><X size={16}/>{p('remove')}</button></div>{place.estimatedAdmission&&<small className="hub-hint">{p('admissionUnknown')}</small>}</>:slot.kind==='explore'?<p>{c('exploreHint')}</p>:slot.kind==='transfer'?<p>{cityName(slot.from!)} → {cityName(slot.to!)}. {c('transferHint')}</p>:null}
          </div></article></li>;})}</ol>
        <section className="hub-card hub-edit-plan"><h2>{p('edit')}</h2><form onSubmit={event=>{event.preventDefault();void build('revise',editInstruction);}}><label className="hub-field">{p('instruction')}<textarea value={editInstruction} onChange={event=>setEditInstruction(event.target.value)} placeholder={p('placeholder')} required maxLength={1000} rows={3}/></label><div className="hub-actions"><button className="hub-button" disabled={pending||!editInstruction.trim()}>{pending?<Loader2 className="animate-spin" size={17}/>:<Pencil size={17}/>} {p(pending?'preparing':'apply')}</button><button className="hub-button hub-button-light" type="button" onClick={planByVoice}><AudioLines size={17}/>{p('voice')}</button></div></form>{error&&<p role="alert" className="hub-error">{error}</p>}</section>
        <details className="hub-card hub-budget-details"><summary><Wallet size={18}/>{c('breakdown')}<ChevronDown size={17} className="hub-disclosure-icon"/></summary><dl>{Object.entries(tripBreakdown(trip)).map(([key,value])=><div key={key}><dt>{c(key as keyof ReturnType<typeof tripBreakdown>)}</dt><dd>{money(value,language)}</dd></div>)}</dl></details>
        <div className="hub-actions"><button className="hub-button hub-button-light" onClick={download}><Download size={17}/>{c(downloaded?'tripDownloaded':'exportTrip')}</button><button className="hub-button hub-button-light" onClick={()=>go('plan')}>{c('edit')}</button></div><p className="hub-hint">{c('estimates')}</p>{!stored&&<p role="status" className="hub-error">{c('storageError')}</p>}
      </section>)}
      {view==='map'&&<section className="hub-map-screen hub-screen"><div className="hub-page-title"><div className="hub-title-row"><h1>{h('gpsMap')}</h1><button type="button" className="hub-icon-button" aria-label={c('add')} onClick={()=>{setError('');setDraftOpen(true);}}><Plus size={22}/></button></div><p>{h('gpsHint')}</p></div>
        <div className="hub-map-toolbar"><select className="hub-city-select" aria-label={c('cities')} value={cityId} onChange={event=>changeCity(event.target.value)}>{CITIES.map(city=><option key={city.id} value={city.id}>{local(city.name,language)}</option>)}</select><button className="hub-button hub-button-light" aria-pressed={!!location.position} onClick={location.toggle}>{location.locating?<Loader2 className="animate-spin" size={17}/>:<Navigation size={17}/>} {v(location.locating?'locating':location.position?'locationOff':'location')}</button></div>
        {location.error&&<p role="status" className="hub-error">{v('geoError')}</p>}
        <div className="hub-choices hub-map-filters">{(['all','landmark','discovery'] as const).map(value=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setFocus(null);setSelected(cityPlaces.find(place=>matchesPlaceFilter(place,value))?.id??null);}}>{c(value)}</button>)}</div>
        <div className="hub-map-layout"><DiscoveryMap city={city} places={places} drafts={drafts.filter(draft=>draft.city===cityId)} selected={selected} onSelect={id=>{setSelected(id);setFocus(null);}} language={language} onOpenVoice={()=>talk()} extraPlaces={filter==='all'?publicExtras:[]} onSelectExtra={showPlace} focus={focus} touristLocation={location.position}/>
          <aside className="hub-selected-place hub-card">{activeName?<><span className="hub-eyebrow">{activeDraft?h('savedFinds'):cityName(cityId)}</span><h2>{activeName}</h2>{activeStory&&<p lang={activeKnown&&!activeKnown.story[language]?'en':language}>{activeStory}{activeKnown&&(!activeKnown.story[language]||activeKnown.storyLanguage==='en'&&language!=='en')&&<small className="hub-language-note">English</small>}</p>}{activeKnown&&<div className="hub-stop-meta"><span><Clock3 size={15}/>{activeKnown.minutes} min</span><span>{activeKnown.estimatedAdmission?p('admissionUnknown'):activeKnown.admission?`${c('admission')}: ${money(activeKnown.admission,language)}`:c('free')}</span></div>}
            {activeDraft?<button className="hub-button hub-button-light" onClick={()=>removeDraft(activeDraft.id)}><Trash2 size={17}/>{c('remove')}</button>:<button className="hub-button" onClick={()=>talk(activeKnown??activeExtra??undefined)}><AudioLines size={18}/>{h('ask')}</button>}</>:<><Compass size={28}/><h2>{cityName(cityId)}</h2><p>{h('noPlaces')}</p><button className="hub-button" onClick={()=>talk()}><AudioLines size={17}/>{h('guide')}</button></>}</aside>
        </div>
        <div className="hub-section-heading"><h2>{v('nearby')}</h2>{location.position&&<span className="hub-gps-dot">GPS</span>}</div><div className="hub-nearby-list">{uniquePlaces([...places.map(place=>({id:place.id,name:local(place.name,language),lat:place.lat,lng:place.lng})),...(filter==='all'?publicExtras:[])]).map(place=>{const km=location.position?distanceKm(location.position,place):undefined;return <button key={place.id} onClick={()=>{setSelected(place.id);setFocus(place);}}><span className="hub-list-icon"><MapPin size={20}/></span><span><strong>{place.name}</strong><small>{km===undefined?cityName(cityId):`≈ ${km<1?Math.round(km*1000)+' m':km.toFixed(1)+' km'}`}</small></span><ChevronRight size={18}/></button>;})}</div>{location.position&&<p className="hub-hint">{h('straightLine')} · ±{Math.round(location.position.accuracy??0)} m</p>}{error&&<p role="alert" className="hub-error">{error}</p>}
      </section>}
      {view==='snap'&&<HubSnap language={language} cityId={cityId} onCityChange={changeCity} position={location.position} onPlace={showPlace} liveOpen={voiceOpen} onRegistrationRequired={()=>requireRegistration('photos')} onUsage={refreshAccess} access={access}/>}
      {view==='auth'&&<><HubAuth language={language} account={account} initialMode={authMode} building={pending} summary={authIntent?`${input.cities.map(cityName).join(' · ')||input.customCity} · ${tripDays(input.days,language)} · $${input.budget} USD`:''} onAccount={user=>{setAccount(user);refreshAccess();if(user){const feature=gate;setGate(null);setAuthIntent(false);if(feature==='plans')void build();else{void currentTrip().then(state=>{setAccess(state.access);if(state.trip)acceptTrip(state.trip,false);}).catch(()=>{});if(feature==='photos')go('snap');else if(feature==='voice')go('guide');} }else{setAuthMode('login');try{localStorage.removeItem(TRIP_KEY);}catch{}void currentTrip().then(state=>{setTrip(state.trip);tripRef.current=state.trip;setAccess(state.access);if(state.trip)try{localStorage.setItem(TRIP_KEY,JSON.stringify(state.trip));}catch{}}).catch(()=>{});}}} onContinue={()=>{setGate(null);setAuthIntent(false);go(trip?'itinerary':'plan');}} trialExhausted={!!gate}/>{gate&&<button className="hub-auth-guest" onClick={()=>{setGate(null);setAuthIntent(false);go(trip?'itinerary':'plan');}}>{p('back')}</button>}</>}{view==='auth'&&error&&<p role="alert" className="hub-error">{error}</p>}
      {view==='pass'&&<HubPass language={language} access={access} onExplore={()=>go(trip?'itinerary':'plan')}/>}
      {view==='guide'&&<TrialStatus access={access} language={language}/>}{view==='guide'&&<div className="hub-page-title hub-guide-heading"><span className="hub-eyebrow">SmartGuide · Live</span><h1>{focus&&focus.id!=='tourist-location'?focus.name:activeKnown?local(activeKnown.name,language):cityName(cityId)}</h1><p>{v('intro')}</p></div>}
      <MapVoiceAssistant open={voiceOpen||view==='guide'} embedded={view==='guide'} mapVisible={view==='map'||view==='itinerary'} onClose={()=>{if(view==='guide')go(trip?'itinerary':'plan');setVoiceOpen(false);}} city={city} cities={CITIES} onCityChange={changeCity} language={language} location={location.position} locating={location.locating} geoError={location.error} onLocate={location.toggle} focusPlace={focus?.id==='tourist-location'?null:focus??(activeKnown?{id:activeKnown.id,name:local(activeKnown.name,language),lat:activeKnown.lat,lng:activeKnown.lng}:null)} onPlaces={setNearby} onFocus={showPlace} onActiveChange={setVoiceActive} tripPreferences={trip?.input??input} purpose={voicePurpose} onTrip={voiceTrip} onRegistrationRequired={requireRegistration} onUsage={refreshAccess} onViewTrip={()=>go('itinerary')}/>
      <footer className="hub-footer"><span>SmartGuide · Oʻzbekiston</span><a href="/credits.html">{h('credits')}</a></footer>
    </main>
    {view!=='plan'&&view!=='auth'&&<nav className="hub-nav" aria-label={c('navigation')}>
      <button aria-current={view==='itinerary'?'page':undefined} onClick={()=>go(trip?'itinerary':'plan')}><Route/><span>{h('roadmap')}</span></button>
      <button aria-current={view==='map'?'page':undefined} onClick={()=>go('map')}><MapIcon/><span>{c('navMap')}</span></button>
      <button className="hub-nav-snap" aria-current={view==='snap'?'page':undefined} aria-label="Snap & Ask" onClick={()=>go('snap')}><span><Camera/></span><small>Snap</small></button>
      <button aria-current={view==='guide'?'page':undefined} aria-label={`Live · ${h('guide')}`} onClick={()=>go('guide')}><AudioLines/><span>{h('guide')}</span></button>
      <button aria-current={view==='pass'?'page':undefined} onClick={()=>go('pass')}><Ticket/><span>Pass</span></button>
    </nav>}
    <dialog ref={draftDialog} className="hub-draft-dialog" onCancel={()=>setDraftOpen(false)}><button className="hub-icon-button hub-dialog-close" onClick={()=>setDraftOpen(false)} aria-label={v('close')}><X/></button><h2>{c('add')}</h2><p>{c('unverified')}</p><form onSubmit={saveDraft}>
      <label className="hub-field">{c('name')}<input name="name" maxLength={120} required/></label><label className="hub-field">{c('story')}<textarea name="story" maxLength={1800} rows={4} required/></label><label className="hub-field">{c('reference')}<input name="source" maxLength={500} required/></label><label className="hub-field">{c('storyType')}<select name="kind">{(['fact','legend','personal'] as const).map(key=><option key={key} value={key}>{c(key)}</option>)}</select></label>
      <div className="hub-coordinate-fields"><label className="hub-field">{c('latitude')}<input type="number" step="any" min="37" max="46" name="lat" defaultValue={location.position?.lat??city.lat} required/></label><label className="hub-field">{c('longitude')}<input type="number" step="any" min="55" max="74" name="lng" defaultValue={location.position?.lng??city.lng} required/></label></div>{error&&<p role="alert" className="hub-error">{error}</p>}<button className="hub-button" type="submit"><Check size={18}/>{c('add')}</button>
    </form></dialog>
  </div>;
}
