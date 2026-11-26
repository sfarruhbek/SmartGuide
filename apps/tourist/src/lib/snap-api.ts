import type { VoiceReference, VoiceContext } from './live-voice';
import { parseVoiceReference } from './live-voice';
import { requestJson } from './http';
export interface SnapResult extends VoiceReference {answer:string;photo:{status:'possible-match'|'unknown';observation:string}|null}
export function parseSnapResult(raw:unknown):SnapResult {
  const reference=parseVoiceReference(raw),value=raw as SnapResult;
  if(typeof value.answer!=='string'||!value.answer.trim()||value.answer.length>5000||
    (value.photo!==null&&(!value.photo||!['possible-match','unknown'].includes(value.photo.status)||typeof value.photo.observation!=='string')))throw new Error('Invalid photo response');
  return {...reference,answer:value.answer,photo:value.photo};
}
export async function explainPhoto(context:VoiceContext,photo:{base64:string;mimeType:string},question:string,signal:AbortSignal) {
  return parseSnapResult(await requestJson<unknown>('/api/explore/identify',{
    method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},signal,
    body:JSON.stringify({cityId:context.cityId,language:context.language,location:context.location,locationSource:context.locationSource,question,imageBase64:photo.base64,imageMimeType:photo.mimeType}),
  },65000));
}
