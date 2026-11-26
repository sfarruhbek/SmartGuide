import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { accountForToken } from '../auth/store.js';
import { env } from '../config/env.js';

export const TRIAL={plans:1,photos:3,voiceMs:180000} as const;
export type Visitor={key:string;registered:boolean};
type Entry={key:string;expires:number;plans:number;photos:number;photoRecords?:{hash:string;reservations:number}[];voiceMs:number;lease?:{id:string;started:number;duration:number};workspace?:unknown;revision:number};
const schema=z.object({entries:z.array(z.object({key:z.string(),expires:z.number(),plans:z.number().int().nonnegative(),photos:z.number().int().nonnegative(),photoRecords:z.array(z.object({hash:z.string().regex(/^[a-f0-9]{64}$/),reservations:z.number().int().positive()})).max(3).optional(),voiceMs:z.number().nonnegative(),lease:z.object({id:z.string(),started:z.number(),duration:z.number()}).optional(),workspace:z.unknown().optional(),revision:z.number().int().nonnegative()})).max(10000)});
const storePath=process.env.ACCESS_STORE_FILE?path.resolve(process.env.ACCESS_STORE_FILE):fileURLToPath(new URL('../../data/auth/access.json',import.meta.url));
let queue:Promise<unknown>=Promise.resolve();
export class AccessError extends Error{constructor(public status:number,public code:string){super(code);}}
export const readCookie=(req:Request,name:string)=>req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1);
const digest=(token:string)=>createHash('sha256').update(token).digest('hex');
async function transaction<T>(visitor:Visitor,action:(entry:Entry)=>T):Promise<T>{
  const pending=queue.then(async()=>{
    let entries:Entry[]=[];
    try{entries=schema.parse(JSON.parse(await fs.readFile(storePath,'utf8'))).entries;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    entries=entries.filter(e=>e.expires>Date.now());
    let entry=entries.find(e=>e.key===visitor.key);
    if(!entry){if(entries.length>=10000)throw new AccessError(503,'ACCESS_UNAVAILABLE');entry={key:visitor.key,expires:Date.now()+30*86400000,plans:0,photos:0,voiceMs:0,revision:0};entries.push(entry);}
    if(entry.lease&&Date.now()>=entry.lease.started+entry.lease.duration){entry.voiceMs+=entry.lease.duration;delete entry.lease;}
    const result=action(entry);
    await fs.mkdir(path.dirname(storePath),{recursive:true,mode:0o700});
    const temp=storePath+'.'+randomBytes(6).toString('hex')+'.tmp';
    await fs.writeFile(temp,JSON.stringify({entries}),{mode:0o600});await fs.rename(temp,storePath);
    return result;
  });queue=pending.catch(()=>undefined);return pending;
}
export async function resolveVisitor(req:Request,res:Response):Promise<Visitor>{
  const account=await accountForToken(readCookie(req,'smartguide_session'));
  if(account)return {key:'account:'+account.id,registered:true};
  let token=readCookie(req,'smartguide_trial');
  if(!token||!/^[a-f0-9]{64}$/.test(token)){
    token=randomBytes(32).toString('hex');
    res.cookie('smartguide_trial',token,{httpOnly:true,sameSite:'lax',secure:env.NODE_ENV==='production',path:'/api',maxAge:30*86400000});
  }
  return {key:'guest:'+digest(token),registered:false};
}
const snapshot=(e:Entry,visitor:Visitor)=>({registered:visitor.registered,remaining:visitor.registered?null:{plans:Math.max(0,TRIAL.plans-e.plans),photos:Math.max(0,TRIAL.photos-e.photos),voiceSeconds:Math.max(0,Math.ceil((TRIAL.voiceMs-e.voiceMs-(e.lease?Math.min(e.lease.duration,Date.now()-e.lease.started):0))/1000))},limits:{plans:1,photos:3,voiceSeconds:180}});
export const accessState=(visitor:Visitor)=>transaction(visitor,e=>snapshot(e,visitor));
export const workspaceState=(visitor:Visitor)=>transaction(visitor,e=>({workspace:e.workspace??null,revision:e.revision,access:snapshot(e,visitor)}));
export async function reserveUse(visitor:Visitor,feature:'plans'|'photos'){
  if(visitor.registered)return async()=>{};
  await transaction(visitor,e=>{if(e[feature]>=TRIAL[feature])throw new AccessError(402,'REGISTRATION_REQUIRED');e[feature]++;});
  let refund:Promise<void>|undefined;return ()=>refund??=(transaction(visitor,e=>{e[feature]=Math.max(0,e[feature]-1);}).catch(error=>{refund=undefined;throw error;}));
}
/** Counts distinct encoded images, not follow-up questions about the same image.
 * Only a SHA-256 digest is retained. A failed concurrent attempt cannot refund
 * another request's successful reservation of the same photo. */
export async function reservePhoto(visitor:Visitor,imageBase64:string){
  if(visitor.registered)return async()=>{};
  const hash=digest(imageBase64);
  await transaction(visitor,e=>{
    const records=e.photoRecords??=[];
    const existing=records.find(record=>record.hash===hash);
    if(existing){existing.reservations++;return;}
    if(e.photos>=TRIAL.photos)throw new AccessError(402,'REGISTRATION_REQUIRED');
    e.photos++;records.push({hash,reservations:1});
  });
  let refund:Promise<void>|undefined;
  return ()=>refund??=(transaction(visitor,e=>{
    const record=e.photoRecords?.find(record=>record.hash===hash);if(!record)return;
    if(--record.reservations===0){e.photoRecords=e.photoRecords?.filter(record=>record.hash!==hash);e.photos=Math.max(0,e.photos-1);}
  }).catch(error=>{refund=undefined;throw error;}));
}
export const saveWorkspace=(visitor:Visitor,workspace:unknown,revision:number,signal?:AbortSignal)=>transaction(visitor,e=>{signal?.throwIfAborted();if(e.revision!==revision)throw new AccessError(409,'TRIP_CHANGED');e.workspace=workspace;e.revision++;return e.revision;});
export async function adoptGuestWorkspace(req:Request,accountId:string){
  const token=readCookie(req,'smartguide_trial');if(!token||!/^[a-f0-9]{64}$/.test(token))return;
  const guest=await workspaceState({key:'guest:'+digest(token),registered:false});
  if(!guest.workspace)return;
  await transaction({key:'account:'+accountId,registered:true},e=>{if(!e.workspace){e.workspace=guest.workspace;e.revision=guest.revision;}});
}
export async function openVoice(visitor:Visitor){
  if(visitor.registered)return {durationMs:600000,close:async()=>{}};
  const lease=await transaction(visitor,e=>{
    if(e.lease)throw new AccessError(409,'VOICE_ALREADY_ACTIVE');
    const duration=TRIAL.voiceMs-e.voiceMs;if(duration<=0)throw new AccessError(402,'REGISTRATION_REQUIRED');
    return e.lease={id:randomBytes(12).toString('hex'),started:Date.now(),duration};
  });
  return {durationMs:lease.duration,close:()=>transaction(visitor,e=>{if(e.lease?.id===lease.id){e.voiceMs+=Math.min(lease.duration,Math.max(0,Date.now()-lease.started));delete e.lease;}})};
}
export async function checkVoice(visitor:Visitor){const state=await accessState(visitor);if(state.remaining&&state.remaining.voiceSeconds<=0)throw new AccessError(402,'REGISTRATION_REQUIRED');return state;}
