import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { z } from 'zod';

const storePath=process.env.AUTH_STORE_FILE?path.resolve(process.env.AUTH_STORE_FILE):fileURLToPath(new URL('../../data/auth/accounts.json',import.meta.url));
const userSchema=z.object({id:z.string(),login:z.string(),name:z.string(),salt:z.string().regex(/^[a-f0-9]{32}$/),hash:z.string().regex(/^[a-f0-9]{128}$/),createdAt:z.string()});
const storeSchema=z.object({users:z.array(userSchema).max(5000),sessions:z.array(z.object({hash:z.string(),userId:z.string(),expiresAt:z.number()})).max(20000)});
type Store=z.infer<typeof storeSchema>;
export interface Account {id:string;login:string;name:string;createdAt:string}
export class AccountError extends Error {constructor(public status:number,public code:string){super(code);}}
const publicAccount=(user:z.infer<typeof userSchema>):Account=>({id:user.id,login:user.login,name:user.name,createdAt:user.createdAt});
const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex');
const passwordHash=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:131072,r:8,p:1,maxmem:256*1024*1024},(error,key)=>error?reject(error):resolve(key)));
let queue:Promise<unknown>=Promise.resolve();
function exclusive<T>(action:()=>Promise<T>):Promise<T>{const next=queue.then(action,action);queue=next.catch(()=>undefined);return next;}
async function read():Promise<Store>{
  try{return storeSchema.parse(JSON.parse(await fs.readFile(storePath,'utf8')));}
  catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {users:[],sessions:[]};throw error;}
}
async function save(data:Store){
  await fs.mkdir(path.dirname(storePath),{recursive:true,mode:0o700});
  const temp=storePath+'.'+randomBytes(6).toString('hex')+'.tmp';
  await fs.writeFile(temp,JSON.stringify(data),{mode:0o600});await fs.rename(temp,storePath);
}
function session(data:Store,userId:string,previous?:string){
  data.sessions=data.sessions.filter(value=>value.expiresAt>Date.now()&&(!previous||value.hash!==hashToken(previous)));
  if(data.sessions.length>=20000)throw new AccountError(503,'AUTH_UNAVAILABLE');
  const token=randomBytes(32).toString('hex');data.sessions.push({hash:hashToken(token),userId,expiresAt:Date.now()+7*86400000});return token;
}
export function registerAccount(login:string,password:string,name:string,previous?:string){return exclusive(async()=>{
  const data=await read();if(data.users.some(user=>user.login===login.toLowerCase()))throw new AccountError(409,'ACCOUNT_EXISTS');
  if(data.users.length>=5000)throw new AccountError(503,'AUTH_UNAVAILABLE');
  const salt=randomBytes(16).toString('hex'),hash=(await passwordHash(password,salt)).toString('hex');
  const user={id:randomUUID(),login:login.toLowerCase(),name:name||login,salt,hash,createdAt:new Date().toISOString()};
  data.users.push(user);const token=session(data,user.id,previous);await save(data);return {user:publicAccount(user),token};
});}
export function loginAccount(login:string,password:string,previous?:string){return exclusive(async()=>{
  const data=await read(),user=data.users.find(value=>value.login===login.toLowerCase());
  const actual=await passwordHash(password,user?.salt??'00000000000000000000000000000000');
  const expected=user?Buffer.from(user.hash,'hex'):Buffer.alloc(64);
  if(!timingSafeEqual(actual,expected)||!user)throw new AccountError(401,'INVALID_CREDENTIALS');
  const token=session(data,user.id,previous);await save(data);return {user:publicAccount(user),token};
});}
export async function accountForToken(token?:string){
  if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
  const data=await read(),active=data.sessions.find(value=>value.hash===hashToken(token)&&value.expiresAt>Date.now());
  const user=active?data.users.find(value=>value.id===active.userId):undefined;return user?publicAccount(user):null;
}
export function logoutAccount(token?:string){return exclusive(async()=>{if(!token)return;const data=await read();data.sessions=data.sessions.filter(value=>value.hash!==hashToken(token));await save(data);});}
