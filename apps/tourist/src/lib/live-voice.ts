import type { SupportedLanguage } from '@smartguide/shared';
import { getApiBaseUrl } from './api';
import { requestJson } from './http';
import { ApiError } from './http';
import type { TripInput } from './journey';

export type VoiceStatus='idle'|'connecting'|'listening'|'speaking'|'muted'|'error'|'ended';
export interface VoicePosition {lat:number;lng:number;accuracy?:number}
export interface VoiceContext {cityId:string;language:SupportedLanguage;locationSource:'gps'|'map';location?:VoicePosition;placeId?:string;tripPreferences?:TripInput;purpose?:'plan'|'guide'}
export interface VoicePlace {id:string;name:string;lat:number;lng:number;distanceKm?:number;kind?:'place'|'area';cityId?:string;facts?:string[]}
export interface VoiceSource {placeId:string;name:string;provenance:string;links:{title:string;url:string;license?:string}[]}
export interface VoiceReference {nearby:VoicePlace[];focusPlace:VoicePlace|null;sources:VoiceSource[];webRecordsAdded:number}

export function decodePcm(data:string):Float32Array<ArrayBuffer> {
  const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
  if(!bytes.length||bytes.length%2||bytes.length>400_000)throw new Error('Invalid PCM');
  const view=new DataView(bytes.buffer),output=new Float32Array(bytes.length/2);
  for(let i=0;i<output.length;i++)output[i]=view.getInt16(i*2,true)/32768;
  return output;
}
export const encodePcm=(buffer:ArrayBuffer)=>{
  const bytes=new Uint8Array(buffer);let raw='';for(const byte of bytes)raw+=String.fromCharCode(byte);return btoa(raw);
};
const isPlace=(p:unknown):p is VoicePlace=>{
  if(!p||typeof p!=='object')return false;
  const v=p as VoicePlace;return typeof v.id==='string'&&typeof v.name==='string'&&Number.isFinite(v.lat)&&Number.isFinite(v.lng)&&Math.abs(v.lat)<=90&&Math.abs(v.lng)<=180&&
    (v.facts===undefined||(Array.isArray(v.facts)&&v.facts.length<=20&&v.facts.every(f=>typeof f==='string'&&f.length<=5000)));
};
export function parseVoiceReference(raw:unknown):VoiceReference {
  if(!raw||typeof raw!=='object')throw new Error('Invalid voice context');
  const value=raw as VoiceReference;
  if(!Array.isArray(value.nearby)||value.nearby.length>30||!value.nearby.every(isPlace)||
     (value.focusPlace!==null&&!isPlace(value.focusPlace))||!Array.isArray(value.sources)||value.sources.length>16)throw new Error('Invalid voice context');
  for(const source of value.sources){
    if(typeof source.name!=='string'||!Array.isArray(source.links)||source.links.length>4||!source.links.every(link=>{
      try{return typeof link.title==='string'&&new URL(link.url).protocol==='https:';}catch{return false;}
    }))throw new Error('Invalid source links');
  }
  return value;
}

export class LiveVoiceClient {
  private socket:WebSocket|null=null;
  private media:MediaStream|null=null;
  private audio:AudioContext|null=null;
  private capture:AudioWorkletNode|null=null;
  private nodes=new Set<AudioBufferSourceNode>();
  private nextAudio=0;
  private muted=false;
  private stopped=false;
  private ready=false;
  private timer:ReturnType<typeof setTimeout>|undefined;
  constructor(private callbacks:{status:(status:VoiceStatus)=>void;transcript:(role:'user'|'assistant',text:string)=>void;references:(data:VoiceReference)=>void;photoAccepted:()=>void;lookup:(busy:boolean)=>void;error:(code:string)=>void;trip?:(result:unknown)=>void;registrationRequired?:(feature:'plans'|'photos'|'voice')=>void;remaining?:(seconds:number)=>void}){}
  async start(context:VoiceContext){
    try{
      if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('SECURE_CONTEXT_REQUIRED');
      this.callbacks.status('connecting');
      this.audio=new AudioContext();await this.audio.resume();
      this.media=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      if(this.stopped){this.release();return;}
      const grant=await requestJson<{token:string;path:string}>('/api/explore/live/session',{
        method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(context),
      });
      if(this.stopped)return;
      if(!/^[a-f0-9]{64}$/.test(grant.token))throw new Error('LIVE_UNAVAILABLE');
      const url=new URL(getApiBaseUrl()||window.location.origin,window.location.origin);
      url.protocol=url.protocol==='https:'?'wss:':'ws:';url.pathname='/api/explore/live';url.search='';url.hash='';
      const socket=new WebSocket(url,['smartguide-live',grant.token]);this.socket=socket;
      this.timer=setTimeout(()=>this.fail('LIVE_UNAVAILABLE'),30_000);
      socket.onmessage=event=>{void this.handle(event.data).catch(()=>{if(!this.stopped)this.fail('LIVE_UNAVAILABLE');});};
      socket.onerror=()=>this.fail('LIVE_UNAVAILABLE');
      socket.onclose=()=>{if(!this.stopped){this.stop();this.callbacks.status('ended');}};
    }catch(error){
      if(error instanceof ApiError&&error.status===402){this.stop();this.callbacks.registrationRequired?.('voice');return;}
      const code=error instanceof DOMException&&(error.name==='NotAllowedError'||error.name==='PermissionDeniedError')?'MIC_PERMISSION':error instanceof Error&&error.message==='SECURE_CONTEXT_REQUIRED'?'SECURE_CONTEXT_REQUIRED':'LIVE_UNAVAILABLE';
      if(!this.stopped)this.fail(code);
    }
  }
  private async handle(raw:string){
    if(this.stopped)return;
    const data=JSON.parse(raw) as Record<string,unknown>;
    if(data.type==='ready'){
      clearTimeout(this.timer);this.ready=true;
      if(typeof data.remainingSeconds==='number')this.callbacks.remaining?.(data.remainingSeconds);
      await this.setupMicrophone();if(this.stopped)return;
      this.callbacks.status('listening');
    }else if(data.type==='audio'&&typeof data.data==='string'){
      if(!this.audio)return;
      const samples=decodePcm(data.data),rate=typeof data.mimeType==='string'?Number(/rate=(\d+)/.exec(data.mimeType)?.[1]??24000):24000;
      if(![16000,22050,24000,44100,48000].includes(rate))return;
      const buffer=this.audio.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);
      const node=this.audio.createBufferSource();node.buffer=buffer;node.connect(this.audio.destination);
      this.nextAudio=Math.max(this.nextAudio,this.audio.currentTime+.04);
      if(this.nextAudio-this.audio.currentTime>60){this.flushAudio();return;}
      node.start(this.nextAudio);this.nextAudio+=buffer.duration;this.nodes.add(node);this.callbacks.status('speaking');
      node.onended=()=>{this.nodes.delete(node);node.disconnect();if(!this.nodes.size&&!this.stopped)this.callbacks.status(this.muted?'muted':'listening');};
    }else if(data.type==='interrupted'){
      this.flushAudio();this.callbacks.status(this.muted?'muted':'listening');
    }else if(data.type==='transcript'&&(data.role==='user'||data.role==='assistant')&&typeof data.text==='string')this.callbacks.transcript(data.role,data.text.slice(0,2000));
    else if(data.type==='context')this.callbacks.references(parseVoiceReference(data));
    else if(data.type==='photoAccepted')this.callbacks.photoAccepted();
    else if(data.type==='lookingUp')this.callbacks.lookup(true);
    else if(data.type==='lookupComplete')this.callbacks.lookup(false);
    else if(data.type==='tripUpdated')this.callbacks.trip?.(data.result);
    else if(data.type==='registrationRequired'){if(data.feature==='plans'||data.feature==='photos'||data.feature==='voice'){this.stop();this.callbacks.registrationRequired?.(data.feature);}}
    else if(data.type==='error')this.fail('LIVE_UNAVAILABLE');
  }
  private async setupMicrophone(){
    if(!this.audio||!this.media)return;
    await this.audio.audioWorklet.addModule('/voice-capture-v1.js');
    if(this.stopped)return;
    this.capture=new AudioWorkletNode(this.audio,'smartguide-capture');
    this.capture.port.onmessage=event=>{if(!this.muted&&this.ready&&!this.stopped)this.send({type:'audio',data:encodePcm(event.data)});};
    const source=this.audio.createMediaStreamSource(this.media);source.connect(this.capture);this.capture.connect(this.audio.destination);
  }
  updateContext(context:VoiceContext){this.send({type:'context',cityId:context.cityId,location:context.location??null,locationSource:context.locationSource,placeId:context.placeId??null});}
  toggleMute(){
    this.muted=!this.muted;
    for(const track of this.media?.getAudioTracks()??[])track.enabled=!this.muted;
    if(this.muted)this.send({type:'mute'});
    this.callbacks.status(this.muted?'muted':'listening');return this.muted;
  }
  sendPhoto(photo:{base64:string;mimeType:string}){if(!this.ready||this.socket?.readyState!==WebSocket.OPEN)throw new Error('Not connected');this.send({type:'photo',data:photo.base64,mimeType:photo.mimeType});}
  private send(message:unknown){if(this.socket?.readyState===WebSocket.OPEN&&this.socket.bufferedAmount<400_000)this.socket.send(JSON.stringify(message));}
  private flushAudio(){for(const node of this.nodes){node.onended=null;try{node.stop();}catch{}node.disconnect();}this.nodes.clear();this.nextAudio=0;}
  private fail(code:string){this.stop();this.callbacks.status('error');this.callbacks.error(code);}
  private release(){this.capture?.disconnect();this.capture=null;for(const track of this.media?.getTracks()??[])track.stop();this.media=null;this.flushAudio();void this.audio?.close().catch(()=>{});this.audio=null;}
  stop(){this.stopped=true;this.ready=false;clearTimeout(this.timer);this.socket?.close();this.socket=null;this.release();}
}
