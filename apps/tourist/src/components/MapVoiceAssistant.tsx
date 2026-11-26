'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Camera, Loader2, MapPin, Mic, MicOff, PhoneOff, Volume2, X, Navigation } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { local, type City } from '@/lib/journey';
import { LiveVoiceClient, parseVoiceReference, type VoicePlace, type VoicePosition, type VoiceReference, type VoiceStatus } from '@/lib/live-voice';
import { getApiBaseUrl } from '@/lib/api';
import { requestJson } from '@/lib/http';
import { compressImageToBase64 } from '@/lib/image-utils';
import { voiceCopy } from '@/lib/voice-copy';

export function MapVoiceAssistant({open,onClose,city,language,location,focusPlace,onLocation,onPlaces,onFocus}:{
  open:boolean;onClose:()=>void;city:City;language:SupportedLanguage;location:VoicePosition|null;
  focusPlace:VoicePlace|null;
  onLocation:(position:VoicePosition|null)=>void;onPlaces:(places:VoicePlace[])=>void;onFocus:(place:VoicePlace)=>void;
}){
  const copy=voiceCopy(language),id=useId(),dialog=useRef<HTMLDialogElement>(null),file=useRef<HTMLInputElement>(null);
  const client=useRef<LiveVoiceClient|null>(null),watch=useRef<number|null>(null),lastRole=useRef('');
  const [status,setStatus]=useState<VoiceStatus>('idle'),[error,setError]=useState(''),[muted,setMuted]=useState(false);
  const [locating,setLocating]=useState(false),[geoError,setGeoError]=useState(false),[lookingUp,setLookingUp]=useState(false);
  const [heard,setHeard]=useState(''),[answer,setAnswer]=useState('');
  const [photo,setPhoto]=useState<string|null>(null),[photoStatus,setPhotoStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [references,setReferences]=useState<VoiceReference>({nearby:[],sources:[],focusPlace:null,webRecordsAdded:0});
  const connected=['listening','speaking','muted'].includes(status);
  const active=connected||status==='connecting';
  const context={cityId:city.id,language,placeId:focusPlace?.id,locationSource:location?'gps' as const:'map' as const,...(location?{location}:{})};
  const stop=()=>{client.current?.stop();client.current=null;setStatus('ended');setMuted(false);setLookingUp(false);};
  const stopLocation=()=>{if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null;setLocating(false);onLocation(null);};
  useEffect(()=>{
    if(open){if(!dialog.current?.open)dialog.current?.show();}
    else{dialog.current?.close();client.current?.stop();client.current=null;setStatus('idle');setPhotoStatus('idle');stopLocation();}
    return()=>{};
  },[open]);
  useEffect(()=>()=>{client.current?.stop();if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);},[]);
  useEffect(()=>{if(watch.current!==null)stopLocation();},[city.id]);
  useEffect(()=>{client.current?.updateContext(context);},[city.id,location?.lat,location?.lng,location?.accuracy,focusPlace?.id]);
  useEffect(()=>{if(active)stop();},[language]);
  useEffect(()=>{
    if(!open)return;
    const controller=new AbortController();
    const query=new URLSearchParams({cityId:city.id,...(location?{lat:String(location.lat),lng:String(location.lng)}:{})});
    requestJson<{places:VoicePlace[]}>(`${getApiBaseUrl()}/api/explore/places?${query}`,{signal:controller.signal}).then(data=>{
      const parsed=parseVoiceReference({nearby:data.places,focusPlace:null,sources:[],webRecordsAdded:0});
      if(!controller.signal.aborted){setReferences(current=>({...current,nearby:parsed.nearby}));onPlaces(parsed.nearby);}
    }).catch(()=>{});
    return()=>controller.abort();
  },[open,city.id,location?.lat,location?.lng]);
  const start=()=>{
    if(client.current)return;
    setError('');setHeard('');setAnswer('');setMuted(false);lastRole.current='';
    const connection=new LiveVoiceClient({status:setStatus,error:setError,lookup:setLookingUp,photoAccepted:()=>setPhotoStatus('sent'),
      transcript(role,text){
        const changed=lastRole.current!==role;lastRole.current=role;
        if(role==='user'){setHeard(old=>(changed?text:old+text).slice(-3000));if(changed)setAnswer('');}
        else setAnswer(old=>(changed?text:old+text).slice(-5000));
      },references(data){setReferences(data);onPlaces([...new Map([...data.nearby,...(data.focusPlace?[data.focusPlace]:[])].map(place=>[place.id,place])).values()]);},
    });
    client.current=connection;
    void connection.start(context).finally(()=>{ /* Connection stays active until the user ends it. */ });
  };
  const locate=()=>{
    if(location||watch.current!==null){stopLocation();return;}
    if(!navigator.geolocation){setGeoError(true);return;}
    setGeoError(false);setLocating(true);
    let lastUpdate=0;
    watch.current=navigator.geolocation.watchPosition(position=>{
      setLocating(false);setGeoError(false);
      if(Date.now()-lastUpdate<5000)return;lastUpdate=Date.now();
      const point={lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy};
      onLocation(point);onFocus({...point,id:'tourist-location',name:copy('gps')});
    },()=>{setLocating(false);setGeoError(true);if(watch.current!==null)navigator.geolocation.clearWatch(watch.current);watch.current=null;},
      {enableHighAccuracy:true,timeout:10000,maximumAge:30000});
  };
  const upload=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const image=event.target.files?.[0];event.target.value='';
    if(!image||!client.current||!connected)return;
    const connection=client.current;
    setPhotoStatus('sending');
    try{const compressed=await compressImageToBase64(image);if(client.current!==connection||!dialog.current?.open)return;setPhoto(compressed.previewDataUrl);connection.sendPhoto(compressed);}
    catch{setPhotoStatus('error');}
  };
  return <dialog ref={dialog} className="map-voice-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-intro`}
    onKeyDown={event=>{if(event.key==='Escape')onClose();}} onCancel={onClose}>
    <header className="voice-header"><div><span className="voice-eyebrow">SmartGuide · Live</span><h2 id={`${id}-title`}>{copy('title')}</h2></div>
      <button type="button" className="voice-close" aria-label={copy('close')} onClick={onClose}><X/></button></header>
    <div className="voice-body">
      <p id={`${id}-intro`} className="voice-intro">{copy('intro')}</p>
      <div className="voice-context"><MapPin size={15}/><span>{location?copy('gps'):`${local(city.name,language)} · ${copy('map')}`}
        {location&&<small> ±{Math.round(location.accuracy??0)} m</small>}</span></div>
      {focusPlace&&<p className="voice-focus-name">{focusPlace.name}</p>}
      <div className={`voice-orb voice-${status}`} aria-hidden="true"><Volume2/><i/><i/><i/></div>
      <p className="voice-state" role="status">{copy(status)}</p>
      {lookingUp&&<p className="voice-lookup" role="status"><Loader2 className="animate-spin" size={14}/>{copy('lookup')}</p>}
      {error&&<p className="journey-error" role="alert">{copy(error==='MIC_PERMISSION'?'micPermission':error==='SECURE_CONTEXT_REQUIRED'?'https':'unavailable')}</p>}
      <div className="voice-main-actions">{active?<>
        <button type="button" className="voice-action" disabled={!connected} onClick={()=>setMuted(client.current?.toggleMute()??false)} aria-pressed={muted} aria-label={copy(muted?'unmute':'mute')}>{muted?<MicOff/>:<Mic/>}</button>
        <button type="button" className="voice-end" onClick={stop}><PhoneOff/>{copy('stop')}</button>
      </>:<button type="button" className="journey-primary" onClick={()=>{client.current?.stop();client.current=null;start();}}><Mic/>{copy('start')}</button>}</div>
      <div className="voice-secondary-actions"><button type="button" className="journey-outline" onClick={locate}>{locating?<Loader2 className="animate-spin" size={16}/>:<Navigation size={16}/>}{copy(locating?'locating':location?'locationOff':'location')}</button>
        <button type="button" className="journey-outline" disabled={!connected||photoStatus==='sending'} onClick={()=>file.current?.click()}><Camera size={16}/>{copy('photo')}</button></div>
      <input ref={file} className="sr-only" type="file" accept="image/*" capture="environment" tabIndex={-1} onChange={upload}/>
      {!connected&&<p className="voice-hint">{copy('photoHint')}</p>}
      {geoError&&<p className="journey-error" role="status">{copy('geoError')}</p>}
      {photo&&<figure className="voice-photo"><img src={photo} alt={copy('photo')}/><figcaption role="status">{copy(photoStatus==='sending'?'photoSending':photoStatus==='error'?'photoError':'photoAttached')}</figcaption></figure>}
      {(heard||answer)&&<details className="voice-transcript"><summary>{copy('answer')}</summary>{heard&&<p><small>{copy('heard')}</small>{heard}</p>}{answer&&<p><small>{copy('answer')}</small>{answer}</p>}</details>}
      {!!references.nearby.length&&<section className="voice-nearby"><h3>{copy('nearby')}</h3>{references.nearby.slice(0,5).map(place=><button type="button" key={place.id} onClick={()=>onFocus(place)} title={copy('showMap')}><span>{place.name}</span><small>{place.distanceKm!==undefined?`≈ ${place.distanceKm} km`:<MapPin size={14}/>}</small></button>)}</section>}
      {!!references.sources.length&&<details className="voice-sources"><summary>{copy('source')}</summary>{references.sources.map(source=><div key={source.placeId}>{source.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.title}</a>)}</div>)}</details>}
      <p className="voice-privacy">{copy('privacy')}</p>
    </div>
  </dialog>;
}
