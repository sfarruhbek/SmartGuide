'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Camera, Loader2, MapPin, Mic, MicOff, PhoneOff, Volume2, X, Navigation } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { local, type City, type TripInput } from '@/lib/journey';
import { LiveVoiceClient, parseVoiceReference, type VoicePlace, type VoicePosition, type VoiceReference, type VoiceStatus } from '@/lib/live-voice';
import { getApiBaseUrl } from '@/lib/api';
import { requestJson } from '@/lib/http';
import { compressImageToBase64 } from '@/lib/image-utils';
import { voiceCopy } from '@/lib/voice-copy';
import { appendLocalReaction, type LocalReaction } from '@/lib/local-reactions';
import { planningCopy } from '@/lib/planning-copy';

export function MapVoiceAssistant({open,embedded=false,mapVisible,onClose,city,cities,onCityChange,language,location,locating,geoError,onLocate,focusPlace,onPlaces,onFocus,onActiveChange,tripPreferences,purpose='guide',onTrip,onRegistrationRequired,onUsage,onViewTrip}:{
  open:boolean;onClose:()=>void;city:City;language:SupportedLanguage;location:VoicePosition|null;
  embedded?:boolean;
  onActiveChange?:(active:boolean)=>void;
  mapVisible:boolean;cities:City[];onCityChange:(id:string)=>void;locating:boolean;geoError:boolean;onLocate:()=>void;
  focusPlace:VoicePlace|null;
  onPlaces:(places:VoicePlace[])=>void;onFocus:(place:VoicePlace)=>void;
  tripPreferences?:TripInput;purpose?:'plan'|'guide';onTrip?:(result:unknown)=>void;onRegistrationRequired?:(feature:'plans'|'photos'|'voice')=>void;onUsage?:()=>void;onViewTrip?:()=>void;
}){
  const copy=voiceCopy(language),p=planningCopy(language),id=useId(),dialog=useRef<HTMLDialogElement>(null),file=useRef<HTMLInputElement>(null);
  const actions=useRef({onTrip,onRegistrationRequired,onUsage});actions.current={onTrip,onRegistrationRequired,onUsage};
  const client=useRef<LiveVoiceClient|null>(null),lastRole=useRef('');
  const [status,setStatus]=useState<VoiceStatus>('idle'),[error,setError]=useState(''),[muted,setMuted]=useState(false);
  const [lookingUp,setLookingUp]=useState(false);
  const [tripUpdated,setTripUpdated]=useState(false),[seconds,setSeconds]=useState<number|null>(null);
  const [heard,setHeard]=useState(''),[answer,setAnswer]=useState('');
  const [reaction,setReaction]=useState<LocalReaction|null>(null),[reactionError,setReactionError]=useState(false);
  const [photo,setPhoto]=useState<string|null>(null),[photoStatus,setPhotoStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [references,setReferences]=useState<VoiceReference>({nearby:[],sources:[],focusPlace:null,webRecordsAdded:0});
  const connected=['listening','speaking','muted'].includes(status);
  const active=connected||status==='connecting';
  useEffect(()=>{onActiveChange?.(active);},[active,onActiveChange]);
  const context={cityId:city.id,language,placeId:focusPlace?.id,locationSource:location?'gps' as const:'map' as const,...(location?{location}:{}),tripPreferences,purpose};
  const stop=()=>{client.current?.stop();client.current=null;setStatus('ended');setMuted(false);setLookingUp(false);actions.current.onUsage?.();};
  useEffect(()=>{if(!active||seconds===null)return;const timer=setInterval(()=>setSeconds(value=>value===null?null:Math.max(0,value-1)),1000);return()=>clearInterval(timer);},[active,seconds===null]);
  useEffect(()=>{
    if(open){if(!dialog.current?.open)dialog.current?.show();}
    else{dialog.current?.close();client.current?.stop();client.current=null;setStatus('idle');setPhotoStatus('idle');}
    return()=>{};
  },[open]);
  useEffect(()=>()=>{client.current?.stop();},[]);
  useEffect(()=>{client.current?.updateContext(context);},[city.id,location?.lat,location?.lng,location?.accuracy,focusPlace?.id]);
  useEffect(()=>{if(active)stop();},[language]);
  useEffect(()=>{
    if(!open&&!mapVisible)return;
    const controller=new AbortController();
    const query=new URLSearchParams({cityId:city.id,...(location?{lat:String(location.lat),lng:String(location.lng)}:{})});
    requestJson<{places:VoicePlace[]}>(`${getApiBaseUrl()}/api/explore/places?${query}`,{signal:controller.signal}).then(data=>{
      const parsed=parseVoiceReference({nearby:data.places,focusPlace:null,sources:[],webRecordsAdded:0});
      if(!controller.signal.aborted){setReferences(current=>({...current,nearby:parsed.nearby}));onPlaces(parsed.nearby);}
    }).catch(()=>{});
    return()=>controller.abort();
  },[open,mapVisible,city.id,location?.lat,location?.lng]);
  const start=()=>{
    if(client.current)return;
    setError('');setHeard('');setAnswer('');setMuted(false);lastRole.current='';
    setReaction(null);setReactionError(false);setTripUpdated(false);setSeconds(null);
    const connection=new LiveVoiceClient({status:setStatus,error:setError,lookup:setLookingUp,photoAccepted:()=>setPhotoStatus('sent'),
      remaining:setSeconds,trip(result){actions.current.onTrip?.(result);setTripUpdated(true);},registrationRequired(feature){actions.current.onRegistrationRequired?.(feature);},
      transcript(role,text){
        const changed=lastRole.current!==role;lastRole.current=role;
        if(role==='user'){setHeard(old=>(changed?text:old+text).slice(-3000));if(changed){setAnswer('');setReaction(null);setReactionError(false);}}
        else setAnswer(old=>(changed?text:old+text).slice(-5000));
      },references(data){setReferences(data);onPlaces([...new Map([...data.nearby,...(data.focusPlace?[data.focusPlace]:[])].map(place=>[place.id,place])).values()]);},
    });
    client.current=connection;
    void connection.start(context).finally(()=>{ /* Connection stays active until the user ends it. */ });
  };
  const upload=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const image=event.target.files?.[0];event.target.value='';
    if(!image||!client.current||!connected)return;
    const connection=client.current;
    setPhotoStatus('sending');
    try{const compressed=await compressImageToBase64(image);if(client.current!==connection||!dialog.current?.open)return;setPhoto(compressed.previewDataUrl);connection.sendPhoto(compressed);}
    catch{setPhotoStatus('error');}
  };
  const react=(value:LocalReaction)=>{
    try{localStorage.setItem('smartguide_reactions_v1',appendLocalReaction(localStorage.getItem('smartguide_reactions_v1'),value,city.id,focusPlace?.id));setReaction(value);setReactionError(false);}
    catch{setReactionError(true);}
  };
  return <dialog id="smartguide-live" ref={dialog} className={`map-voice-dialog ${embedded?'hub-live-inline':''}`} role={embedded?'region':'dialog'} aria-labelledby={`${id}-title`} aria-describedby={`${id}-intro`}
    onKeyDown={event=>{if(event.key==='Escape')onClose();}} onCancel={onClose}>
    <header className="voice-header"><div><span className="voice-eyebrow">SmartGuide · Live</span><h2 id={`${id}-title`}>{copy('title')}</h2></div>
      <button type="button" className="voice-close" aria-label={copy('close')} onClick={onClose}><X/></button></header>
    <div className="voice-body">
      <p id={`${id}-intro`} className="voice-intro">{copy('intro')}</p>
      {purpose==='plan'&&<p className="voice-hint">{p('voiceHint')}</p>}
      {seconds!==null&&<p className="hub-hint" role="timer">Live · {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</p>}
      {tripUpdated&&<button className="hub-button" type="button" onClick={onViewTrip}>{p('continueSaved')}</button>}
      <div className="voice-location-controls">
        <button type="button" className="journey-outline" onClick={onLocate} aria-pressed={!!location}>
          {locating?<Loader2 className="animate-spin" size={16}/>:<Navigation size={16}/>}{copy(locating?'locating':location?'locationOff':'location')}
        </button>
        {!location&&<select aria-label={copy('map')} value={city.id} onChange={event=>onCityChange(event.target.value)}>{cities.map(value=><option key={value.id} value={value.id}>{local(value.name,language)}</option>)}</select>}
      </div>
      {geoError&&<p className="journey-error" role="status">{copy('geoError')}</p>}
      <div className="voice-context"><MapPin size={15}/><span>{location?copy('gps'):`${local(city.name,language)} · ${copy('map')}`}
        {location&&<small> ±{Math.round(location.accuracy??0)} m</small>}</span></div>
      {!embedded&&focusPlace&&<p className="voice-focus-name">{focusPlace.name}</p>}
      <div className="voice-session-state"><div className={`voice-orb voice-${status}`} aria-hidden="true"><Volume2/><i/><i/><i/></div>
      <p className="voice-state" role="status">{copy(status)}</p></div>
      {lookingUp&&<p className="voice-lookup" role="status"><Loader2 className="animate-spin" size={14}/>{copy('lookup')}</p>}
      {error&&<p className="journey-error" role="alert">{copy(error==='MIC_PERMISSION'?'micPermission':error==='SECURE_CONTEXT_REQUIRED'?'https':'unavailable')}</p>}
      <div className="voice-main-actions">{active?<>
        <button type="button" className="voice-action" disabled={!connected} onClick={()=>setMuted(client.current?.toggleMute()??false)} aria-pressed={muted} aria-label={copy(muted?'unmute':'mute')}>{muted?<MicOff/>:<Mic/>}</button>
        <button type="button" className="voice-end" onClick={stop}><PhoneOff/>{copy('stop')}</button>
      </>:<button type="button" className="journey-primary" onClick={()=>{client.current?.stop();client.current=null;start();}}><Mic/>{copy('start')}</button>}</div>
      <div className="voice-secondary-actions">
        <button type="button" className="journey-outline" disabled={!connected||photoStatus==='sending'} onClick={()=>file.current?.click()}><Camera size={16}/>{copy('photo')}</button></div>
      <input ref={file} className="sr-only" type="file" accept="image/*" tabIndex={-1} onChange={upload}/>
      {!connected&&<p className="voice-hint">{copy('photoHint')}</p>}
      {photo&&<figure className="voice-photo"><img src={photo} alt={copy('photo')}/><figcaption role="status">{copy(photoStatus==='sending'?'photoSending':photoStatus==='error'?'photoError':'photoAttached')}</figcaption></figure>}
      {(heard||answer)&&<details className="voice-transcript" open={embedded||undefined}><summary>{copy('answer')}</summary>{heard&&<p><small>{copy('heard')}</small>{heard}</p>}{answer&&<p><small>{copy('answer')}</small>{answer}</p>}</details>}
      {answer&&<div className="voice-feedback"><p>{copy('helpful')}</p><div>{(['interesting','ordinary'] as const).map(value=><button type="button" key={value} aria-pressed={reaction===value} onClick={()=>react(value)}>{copy(value)}</button>)}</div>{(reaction||reactionError)&&<small role="status">{copy(reactionError?'reactionError':'reactionSaved')}</small>}</div>}
      {!!references.nearby.length&&<section className="voice-nearby"><h3>{copy('nearby')}</h3>{references.nearby.slice(0,5).map(place=><button type="button" key={place.id} onClick={()=>onFocus(place)} title={copy('showMap')}><span>{place.name}</span><small>{place.distanceKm!==undefined?`≈ ${place.distanceKm} km`:<MapPin size={14}/>}</small></button>)}</section>}
      <p className="voice-privacy">{copy('privacy')}</p>
    </div>
  </dialog>;
}
