'use client';
import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Volume2, ArrowRight, ScanLine } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { CITIES } from '@/lib/places';
import { local } from '@/lib/journey';
import { hubCopy } from '@/lib/hub-copy';
import { compressImageToBase64 } from '@/lib/image-utils';
import { explainPhoto, type SnapResult } from '@/lib/snap-api';
import { requestJson } from '@/lib/http';
import { getApiBaseUrl } from '@/lib/api';
import type { VoicePlace, VoicePosition } from '@/lib/live-voice';
import { registrationRequired, type AccessState } from '@/lib/access-api';
import { TrialStatus } from './TrialStatus';

export function HubSnap({language,cityId,onCityChange,position,onPlace,liveOpen,onRegistrationRequired,onUsage,access}:{language:SupportedLanguage;cityId:string;onCityChange:(id:string)=>void;position:VoicePosition|null;onPlace:(place:VoicePlace)=>void;liveOpen:boolean;onRegistrationRequired:()=>void;onUsage:()=>void;access:AccessState|null}) {
  const h=hubCopy(language),file=useRef<HTMLInputElement>(null),audio=useRef<HTMLAudioElement>(null);
  const controller=useRef<AbortController|null>(null),speechController=useRef<AbortController|null>(null);
  const [photo,setPhoto]=useState<{base64:string;mimeType:string;previewDataUrl:string}|null>(null);
  const [result,setResult]=useState<SnapResult|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [speech,setSpeech]=useState<string|null>(null),[speaking,setSpeaking]=useState(false);
  useEffect(()=>{controller.current?.abort();speechController.current?.abort();setResult(null);setSpeech(null);setError('');setBusy(false);setSpeaking(false);},[language,cityId]);
  useEffect(()=>()=>{controller.current?.abort();speechController.current?.abort();},[]);
  useEffect(()=>{if(liveOpen)audio.current?.pause();},[liveOpen]);
  const ask=async(image:NonNullable<typeof photo>,question:string)=>{
    controller.current?.abort();speechController.current?.abort();audio.current?.pause();setSpeech(null);
    const pending=new AbortController();controller.current=pending;setBusy(true);setError('');setResult(null);
    try{const value=await explainPhoto({cityId,language,locationSource:position?'gps':'map',...(position?{location:position}:{})},image,question,pending.signal);if(!pending.signal.aborted)setResult(value);}
    catch(error){if(!pending.signal.aborted){if(registrationRequired(error))onRegistrationRequired();else setError(h('photoError'));}}
    finally{if(controller.current===pending){setBusy(false);controller.current=null;onUsage();}}
  };
  const choose=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const image=event.target.files?.[0];event.target.value='';if(!image)return;
    setError('');try{const compressed=await compressImageToBase64(image);setPhoto(compressed);void ask(compressed,h('photoQuestion'));}catch{setError(h('photoError'));}
  };
  const listen=async()=>{
    if(!result)return;setSpeaking(true);setError('');const pending=new AbortController();speechController.current=pending;
    try{const value=await requestJson<{audioBase64:string;audioMimeType:string}>(`${getApiBaseUrl()}/api/audio/speech`,{method:'POST',headers:{'Content-Type':'application/json'},signal:pending.signal,body:JSON.stringify({text:result.answer.slice(0,1400),language})},35000);
      if(!pending.signal.aborted&&typeof value.audioBase64==='string'&&value.audioMimeType==='audio/wav')setSpeech(`data:audio/wav;base64,${value.audioBase64}`);
    }catch{if(!pending.signal.aborted)setError(h('listeningError'));}finally{if(speechController.current===pending)setSpeaking(false);}
  };
  return <section className="hub-snap hub-screen"><TrialStatus access={access} language={language}/><div className="hub-page-title"><span className="hub-eyebrow">Snap &amp; Ask</span><h1>{h('photoTitle')}</h1><p>{h('photoHint')}</p></div>
    <select className="hub-city-select" aria-label={h('cities')} value={cityId} onChange={event=>onCityChange(event.target.value)}>{CITIES.map(city=><option key={city.id} value={city.id}>{local(city.name,language)}</option>)}</select>
    <div className={`hub-viewfinder ${photo?'has-photo':''}`}>
      {photo?<img src={photo.previewDataUrl} alt={h('photoQuestion')}/>:<div className="hub-camera-empty"><ScanLine size={52}/><p>{h('explain')}</p></div>}
      <span className="hub-viewfinder-corners" aria-hidden="true"/>
      {busy&&<div className="hub-photo-processing" role="status"><Loader2 className="animate-spin"/>{h('identifying')}</div>}
      <button type="button" className="hub-button" onClick={()=>file.current?.click()}><Camera size={19}/>{h(photo?'retake':'capture')}</button>
    </div><input ref={file} type="file" accept="image/*" onChange={choose} className="sr-only" aria-label={h('capture')}/>
    {photo&&<div className="hub-choices">{(['photoQuestion','patterns','sign'] as const).map(key=><button type="button" disabled={busy} key={key} onClick={()=>void ask(photo,h(key))}>{h(key)}</button>)}</div>}
    {error&&<p role="alert" className="hub-error">{error}</p>}
    {result&&<article className="hub-card hub-photo-answer" aria-live="polite"><span className="hub-eyebrow">SmartGuide · {h(result.photo?.status==='possible-match'?'possible':'uncertain')}</span><p>{result.answer}</p>
      {speech?<audio ref={audio} controls autoPlay src={speech}/>:<button type="button" className="hub-button" disabled={speaking||liveOpen} onClick={()=>void listen()}>{speaking?<Loader2 className="animate-spin" size={18}/>:<Volume2 size={18}/>} {h('listen')}</button>}
      {result.focusPlace&&<button type="button" className="hub-button hub-button-light" onClick={()=>onPlace(result.focusPlace!)}>{h('gpsMap')}<ArrowRight size={17}/></button>}
    </article>}
    {!photo&&<div className="hub-photo-examples"><ImagePlus size={18}/><div className="hub-chips"><span>{h('photoQuestion')}</span><span>{h('patterns')}</span><span>{h('sign')}</span></div></div>}
    <p className="hub-hint">{h('photoPrivacy')}</p>
  </section>;
}
