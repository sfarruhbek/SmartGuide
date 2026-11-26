'use client';
import { useState } from 'react';
import { Check, Ticket, MapPin, AudioLines, Camera, ArrowRight } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { hubCopy } from '@/lib/hub-copy';
import { TrialStatus } from './TrialStatus';
import type { AccessState } from '@/lib/access-api';

export function HubPass({language,onExplore,access}:{language:SupportedLanguage;onExplore:()=>void;access:AccessState|null}) {
  const h=hubCopy(language),[selected,setSelected]=useState<string|null>(null);
  return <section className="hub-pass hub-screen"><TrialStatus access={access} language={language}/><div className="hub-page-title"><span className="hub-eyebrow">{h('passHint')}</span><h1>Trip Pass</h1><p>{h('passFeatures')}</p></div>
    <div className="hub-access-banner"><Check size={20}/><div><strong>{h('currentAccess')}</strong><span>{h('free')}</span></div></div>
    <div className="hub-pass-grid">{[{name:'Silk Road Pass',price:'12.99',label:h('tenDays'),featured:true},{name:'City Pass',price:'4.99',label:h('cityPass'),featured:false}].map(pass=><article key={pass.name} className={`hub-pass-card ${pass.featured?'hub-pass-featured':''}`}>
      <div className="hub-pass-top"><span className="hub-pill">{pass.featured?h('recommended'):h('planned')}</span><Ticket size={23}/></div>
      <h2>{pass.name}</h2><p>{pass.label}</p><div className="hub-pass-price">${pass.price}<small>USD</small></div>
      <ul><li><AudioLines size={18}/>{h('guide')}</li><li><Camera size={18}/>Snap &amp; Ask</li><li><MapPin size={18}/>{h('gpsMap')}</li></ul>
      <button type="button" className={`hub-button ${pass.featured?'':'hub-button-light'}`} onClick={()=>setSelected(pass.name)} aria-expanded={selected===pass.name}>{h('select')}<ArrowRight size={17}/></button>
      {selected===pass.name&&<p role="status" className="hub-pass-notice">{h('passUnavailable')}</p>}
    </article>)}</div>
    <div className="hub-card"><h2>{h('voucher')}</h2><p>{h('voucherHint')}</p><div className="hub-voucher"><input aria-label={h('voucher')} placeholder="KHIVA-2026" disabled/><Ticket size={20}/></div></div>
    <p className="hub-hint">{h('passUnavailable')}</p><button type="button" className="hub-button" onClick={onExplore}>{h('keepExploring')}<ArrowRight size={17}/></button>
  </section>;
}
