import { Router, type Request, type RequestHandler } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { AccountError, accountForToken, registerAccount, loginAccount, logoutAccount } from '../auth/store.js';
import { adoptGuestWorkspace } from '../access/store.js';
const cookieName='smartguide_session';
const token=(req:Request)=>req.headers.cookie?.split(';').map(value=>value.trim()).find(value=>value.startsWith(cookieName+'='))?.slice(cookieName.length+1);
const credentials=z.object({login:z.string().trim().min(3).max(80).regex(/^[A-Za-z0-9_.@+-]+$/),password:z.string().min(8).max(128)}).strict();
const registration=credentials.extend({name:z.string().trim().min(1).max(80)});
const attempts=new Map<string,{count:number;expires:number}>();let active=0;
const limit:RequestHandler=(req,res,next)=>{
  const now=Date.now();for(const [key,value]of attempts)if(value.expires<now)attempts.delete(key);
  const ip=req.ip??'unknown',bucket=attempts.get(ip)??{count:0,expires:now+10*60000};
  if(bucket.count>=20||active>=env.AUTH_MAX_CONCURRENT||attempts.size>=10000){res.setHeader('Retry-After','60');res.status(429).json({error:'AUTH_RATE_LIMIT'});return;}
  bucket.count++;attempts.set(ip,bucket);active++;let released=false;const release=()=>{if(!released){released=true;active--;}};res.once('finish',release);res.once('close',release);next();
};
export const authRouter=Router();
authRouter.use((req,res,next)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){
    if((req.headers.origin&&!env.corsOrigins.includes(req.headers.origin))||req.headers['sec-fetch-site']==='cross-site'){res.status(403).json({error:'AUTH_ORIGIN_REJECTED'});return;}
    if(!req.is('application/json')){res.status(415).json({error:'AUTH_JSON_REQUIRED'});return;}
  }next();
});
const cookieOptions={httpOnly:true,sameSite:'lax' as const,secure:env.NODE_ENV==='production',path:'/api',maxAge:7*86400000};
authRouter.get('/session',async(req,res)=>{try{res.json({user:await accountForToken(token(req))});}catch{res.status(503).json({error:'AUTH_UNAVAILABLE'});}});
for(const mode of ['register','login'] as const)authRouter.post('/'+mode,limit,async(req,res)=>{
  const parsed=(mode==='register'?registration:credentials).safeParse(req.body);
  if(!parsed.success){res.status(400).json({error:'INVALID_ACCOUNT_INPUT'});return;}
  try{const data=parsed.data;const result=mode==='register'?await registerAccount(data.login,data.password,'name'in data?String(data.name):data.login,token(req)):await loginAccount(data.login,data.password,token(req));
    await adoptGuestWorkspace(req,result.user.id);
    res.cookie(cookieName,result.token,cookieOptions);res.status(mode==='register'?201:200).json({user:result.user});
  }catch(error){res.status(error instanceof AccountError?error.status:503).json({error:error instanceof AccountError?error.code:'AUTH_UNAVAILABLE'});}
});
authRouter.post('/logout',async(req,res)=>{try{await logoutAccount(token(req));res.clearCookie(cookieName,{...cookieOptions,maxAge:undefined});res.json({user:null});}catch{res.status(503).json({error:'AUTH_UNAVAILABLE'});}});
