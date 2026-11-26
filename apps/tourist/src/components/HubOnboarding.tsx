'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Landmark, Palette, Utensils, Leaf, Heart, Loader2 } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { CITIES } from '@/lib/places';
import { local, type TripInput, type Interest } from '@/lib/journey';
import { journeyCopy } from '@/lib/journey-copy';
import { hubCopy, tripDays } from '@/lib/hub-copy';
import { planningCopy } from '@/lib/planning-copy';

export function HubOnboarding({input,onChange,language,pending,error,onGenerate,onVoice,onSaved}:{input:TripInput;onChange:(input:TripInput)=>void;language:SupportedLanguage;pending:boolean;error:string;onGenerate:()=>void;onVoice:()=>void;onSaved?:()=>void}) {
  const [step,setStep]=useState(0);
  const h=hubCopy(language),c=journeyCopy(language),p=planningCopy(language);
  const update=(patch:Partial<TripInput>)=>onChange({...input,...patch});
  const toggleCity=(id:string)=>{
    const cities=input.cities.includes(id)?input.cities.filter(value=>value!==id):[...input.cities,id];
    update({cities,days:Math.max(input.days,cities.length),customCity:''});
  };
  const interestIcons={history:Landmark,local:Palette,food:Utensils,nature:Leaf,sacred:Heart};
  return <section className="hub-onboarding">
    <div className="hub-page-title hub-onboarding-intro"><span className="hub-eyebrow">SmartGuide · {h('personal')}</span><p>{h('welcomeHint')}</p></div>
    <div className="hub-planning-choice"><button className="hub-button" type="button" onClick={onVoice}>{p('voice')}<ArrowRight size={17}/></button><p>{p('voiceHint')}</p>{onSaved&&<button className="hub-auth-guest" type="button" onClick={onSaved}>{p('continueSaved')}<ArrowRight size={16}/></button>}<span>{p('manual')}</span></div>
    <div className="hub-memory"><div><Sparkles size={16}/><span>{h('preferences')}</span><small>{step+1} / 3</small></div>
      <div className="hub-chips">{input.cities.map(id=><span key={id}>{local(CITIES.find(city=>city.id===id)!.name,language)}</span>)}
        {input.customCity&&<span>{input.customCity}</span>}<span>{tripDays(input.days,language)}</span><span className="hub-mono">${input.budget} USD</span></div>
    </div>
    <form onSubmit={event=>{event.preventDefault();if(step<2)setStep(step+1);else onGenerate();}}>
      <fieldset disabled={pending} className="hub-flashcard">
        <div className="hub-flashcard-title"><span className="hub-ai-icon"><Sparkles size={20}/></span><div><span>SmartGuide</span><h1>{h(step===0?'where':step===1?'interests':'budgetTitle')}</h1></div></div>
        {step===0?<><p>{h('whereHint')}</p><div className="hub-choices">{[...input.cities.map(id=>CITIES.find(city=>city.id===id)).filter((city):city is NonNullable<typeof city>=>Boolean(city)),...CITIES.filter((city,index)=>index<4&&!input.cities.includes(city.id))].map(city=><button type="button" key={city.id} aria-pressed={input.cities.includes(city.id)} onClick={()=>toggleCity(city.id)}>{input.cities.includes(city.id)&&<span className="hub-choice-order">{input.cities.indexOf(city.id)+1}</span>}{local(city.name,language)}</button>)}</div>
          <select className="hub-city-select" aria-label={c('cities')} value="" onChange={event=>{if(event.target.value)toggleCity(event.target.value);}}><option value="">+ {h('cities')}</option>{CITIES.filter(city=>!input.cities.includes(city.id)).map(city=><option key={city.id} value={city.id}>{local(city.name,language)}</option>)}</select>
          <details className="hub-custom-city"><summary>{c('other')}</summary><label className="hub-field">{c('other')}<input value={input.customCity} maxLength={100} onChange={event=>update({customCity:event.target.value,cities:event.target.value?[]:input.cities})}/></label></details>
          <label className="hub-field">{c('days')}<input required type="number" min={Math.max(1,input.cities.length)} max={14} value={input.days} onChange={event=>update({days:Number(event.target.value)})}/></label>
        </>:step===1?<div className="hub-interest-choices">{(Object.keys(interestIcons) as Interest[]).map(interest=>{const Icon=interestIcons[interest];return <button key={interest} type="button" aria-pressed={input.interests.includes(interest)} onClick={()=>update({interests:input.interests.includes(interest)?input.interests.filter(value=>value!==interest):[...input.interests,interest]})}><Icon size={22}/><span>{c(interest)}</span>{input.interests.includes(interest)&&<Check size={17}/>}</button>;})}</div>:<>
          <label className="hub-field hub-budget-field">{c('budget')}<span><span>$</span><input required type="number" min="1" max="1000000" step="0.01" value={input.budget} onChange={event=>update({budget:Number(event.target.value)})}/><small>USD</small></span></label>
          <label className="hub-check"><input type="checkbox" checked={input.accommodation} onChange={event=>update({accommodation:event.target.checked})}/>{c('accommodation')}</label>
          <p className="hub-hint">{c('budgetHint')}</p><div className="hub-choices">{input.interests.map(value=><span key={value}>{c(value)}</span>)}</div>
        </>}
        {error&&<p role="alert" className="hub-error">{error}</p>}
        <div className="hub-form-actions">{step>0&&<button type="button" className="hub-button hub-button-light" onClick={()=>setStep(step-1)}><ArrowLeft size={17}/>{h('back')}</button>}
          <button type="submit" className="hub-button" disabled={pending||(!input.cities.length&&!input.customCity.trim())||!input.interests.length}>{pending?<Loader2 className="animate-spin" size={18}/>:step===2?<Sparkles size={18}/>:null}{pending?c('generating'):step===2?p('generate'):h('next')}{!pending&&<ArrowRight size={17}/>}</button></div>
      </fieldset>
    </form><p className="hub-hint hub-guest-note">{h('guest')}</p>
  </section>;
}
