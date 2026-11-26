import type { SupportedLanguage } from '@smartguide/shared';
import type { AccessState } from '@/lib/access-api';
import { planningCopy } from '@/lib/planning-copy';
export function TrialStatus({access,language}:{access:AccessState|null;language:SupportedLanguage}){
  const p=planningCopy(language);if(access?.registered)return null;
  return <div className="hub-trial"><strong>{p('trial')}</strong><p>{access?.remaining?`${p('remaining')}: ${access.remaining.plans} ${p('plans')} · ${Math.floor(access.remaining.voiceSeconds/60)}:${String(access.remaining.voiceSeconds%60).padStart(2,'0')} Live · ${access.remaining.photos} ${p('photos')}`:p('trialHint')}</p></div>;
}
