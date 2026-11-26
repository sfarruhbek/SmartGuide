import { requestJson } from './http';
export interface Account {id:string;login:string;name:string;createdAt:string}
const parse=(raw:unknown):Account|null=>{
  const user=(raw as {user?:unknown})?.user;
  if(user===null)return null;
  if(!user||typeof user!=='object')throw new Error('Invalid account response');
  const value=user as Account;if(!['id','login','name','createdAt'].every(key=>typeof value[key as keyof Account]==='string'))throw new Error('Invalid account response');return {id:value.id,login:value.login,name:value.name,createdAt:value.createdAt};
};
// Same-origin proxy keeps the HttpOnly cookie on the app host. No browser token storage.
export async function currentAccount(){return parse(await requestJson('/api/auth/session',{credentials:'include',cache:'no-store'}));}
export async function authenticate(mode:'register'|'login',input:{login:string;password:string;name?:string},signal:AbortSignal){
  return parse(await requestJson(`/api/auth/${mode}`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal},20000));
}
export async function signOut(){await requestJson('/api/auth/logout',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});}
