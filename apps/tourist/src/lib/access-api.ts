import { ApiError, requestJson } from './http';

export interface AccessState {
  registered: boolean;
  remaining: null | {plans:number;photos:number;voiceSeconds:number};
  limits: {plans:number;photos:number;voiceSeconds:number};
}

export function parseAccessState(raw:unknown):AccessState {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid access response');
  const value=raw as AccessState;
  const bounded=(record:unknown,maximum:{plans:number;photos:number;voiceSeconds:number}) => {
    if (!record || typeof record !== 'object') return false;
    const r=record as Record<string,unknown>;
    return (['plans','photos','voiceSeconds'] as const).every(key=>typeof r[key]==='number'&&Number.isSafeInteger(r[key])&&(r[key] as number)>=0&&(r[key] as number)<=maximum[key]);
  };
  if (typeof value.registered!=='boolean' || !bounded(value.limits,{plans:1,photos:3,voiceSeconds:180}) ||
      value.limits.plans!==1 || value.limits.photos!==3 || value.limits.voiceSeconds!==180 ||
      (value.registered ? value.remaining!==null : !bounded(value.remaining,value.limits))) throw new Error('Invalid access response');
  return {registered:value.registered,remaining:value.remaining===null?null:{plans:value.remaining.plans,photos:value.remaining.photos,voiceSeconds:value.remaining.voiceSeconds},limits:{plans:1,photos:3,voiceSeconds:180}};
}

export async function readAccess(signal?:AbortSignal):Promise<AccessState> {
  return parseAccessState(await requestJson('/api/access',{credentials:'include',cache:'no-store',signal}));
}

export const registrationRequired=(error:unknown):boolean=>error instanceof ApiError&&error.status===402;
