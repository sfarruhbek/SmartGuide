'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, LogOut, UserRound } from 'lucide-react';
import type { SupportedLanguage } from '@smartguide/shared';
import { authCopy } from '@/lib/auth-copy';
import { authenticate, signOut, type Account } from '@/lib/auth-api';
import { ApiError } from '@/lib/http';
import { hubCopy } from '@/lib/hub-copy';
import { planningCopy } from '@/lib/planning-copy';

export function HubAuth({language,account,summary,onAccount,onContinue,building,initialMode='register',trialExhausted=false}:{language:SupportedLanguage;account:Account|null;summary:string;onAccount:(user:Account|null)=>void;onContinue:()=>void;building:boolean;initialMode?:'register'|'login';trialExhausted?:boolean}) {
  const a=authCopy(language),h=hubCopy(language),p=planningCopy(language),[mode,setMode]=useState<'register'|'login'>(initialMode);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[show,setShow]=useState(false);
  const controller=useRef<AbortController|null>(null);
  useEffect(()=>()=>controller.current?.abort(),[]);
  useEffect(()=>{setMode(initialMode);setError('');},[initialMode]);
  const submit=async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();const form=event.currentTarget,data=new FormData(form),password=String(data.get('password'));
    if(mode==='register'&&password!==String(data.get('confirm'))){setError(a('mismatch'));return;}
    const pending=new AbortController();controller.current=pending;setBusy(true);setError('');
    try{const user=await authenticate(mode,{login:String(data.get('login')).trim(),password,...(mode==='register'?{name:String(data.get('name')).trim()}:{})},pending.signal);if(!pending.signal.aborted){form.reset();onAccount(user);}}
    catch(error){if(!pending.signal.aborted)setError(a(error instanceof ApiError?(error.status===409?'exists':error.status===401?'invalid':error.status===429?'limit':'error'):'error'));}
    finally{if(controller.current===pending){controller.current=null;setBusy(false);}}
  };
  const logout=async()=>{setBusy(true);setError('');try{await signOut();onAccount(null);}catch{setError(a('error'));}finally{setBusy(false);}};
  return <section className="hub-auth hub-screen"><div className="hub-auth-emblem"><UserRound size={27}/></div><div className="hub-page-title"><span className="hub-eyebrow">SmartGuide · {a(account?'account':mode)}</span><h1>{account?account.name:trialExhausted?p('registerTitle'):a(mode==='login'?'loginTitle':'title')}</h1>{(account||summary||trialExhausted)&&<p>{account?account.login:trialExhausted?p('limitHint'):a('hint')}</p>}</div>
    {summary&&<div className="hub-memory"><span>{h('preferences')}</span><p>{summary}</p></div>}
    {account?<div className="hub-card hub-auth-profile"><p>{a('devicePlan')}</p><button className="hub-button" disabled={building} onClick={onContinue}>{building?<Loader2 className="animate-spin" size={18}/>:<ArrowRight size={18}/>} {h('keepExploring')}</button><button className="hub-button hub-button-light" disabled={busy||building} onClick={()=>void logout()}><LogOut size={17}/>{a('logout')}</button></div>:<>
      <div className="hub-auth-tabs" role="tablist" aria-label={a('account')}>{(['register','login'] as const).map(value=><button key={value} role="tab" aria-selected={mode===value} onClick={()=>{setMode(value);setError('');}} disabled={busy}>{a(value)}</button>)}</div>
      <form className="hub-auth-form hub-card" onSubmit={submit} key={mode}><fieldset disabled={busy}>
        {mode==='register'&&<label className="hub-field">{a('name')}<input name="name" required maxLength={80} autoComplete="name"/></label>}
        <label className="hub-field">{a('username')}<input name="login" required minLength={3} maxLength={80} pattern={"[A-Za-z0-9_.@+\\-]+"} autoComplete="username" autoCapitalize="none" spellCheck={false}/></label>
        <label className="hub-field">{a('password')}<span className="hub-password-input"><input name="password" type={show?'text':'password'} required minLength={8} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'}/><button type="button" aria-label={a(show?'hide':'show')} onClick={()=>setShow(value=>!value)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></span>{mode==='register'&&<small>{a('passwordHint')}</small>}</label>
        {mode==='register'&&<label className="hub-field">{a('confirm')}<input name="confirm" type={show?'text':'password'} required minLength={8} maxLength={128} autoComplete="new-password"/></label>}
        {error&&<p className="hub-error" role="alert">{error}</p>}<button type="submit" className="hub-button">{busy?<Loader2 className="animate-spin" size={18}/>:<LockKeyhole size={17}/>} {a(mode)}<ArrowRight size={17}/></button>
      </fieldset></form>{!trialExhausted&&<button type="button" className="hub-auth-guest" disabled={busy||building} onClick={onContinue}>{a('guest')}<ArrowRight size={16}/></button>}
    </>}{account&&error&&<p role="alert" className="hub-error">{error}</p>}
  </section>;
}
