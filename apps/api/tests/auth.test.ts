import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { once } from 'node:events';

test('accounts hash passwords, rotate HttpOnly sessions, reject cross-site login and log out',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'smartguide-auth-'));
  const file=path.join(directory,'accounts.json');process.env.AUTH_STORE_FILE=file;process.env.NODE_ENV='production';process.env.CORS_ORIGIN='http://localhost:3000';
  const {authRouter}=await import('../src/routes/auth.routes.js');
  const app=express();app.use(express.json());app.use('/api/auth',authRouter);const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}/api/auth`;
  const post=(route:string,body:unknown,headers:Record<string,string>={})=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
  const credentials={login:'Tourist_QA',password:'A_test_password_2026'};
  try{
    assert.equal((await post('/register',{...credentials,name:'QA Tourist'},{Origin:'https://unrelated.example'})).status,403);
    assert.equal((await post('/register',{...credentials,password:'short',name:'QA'})).status,400);
    const registered=await post('/register',{...credentials,name:'QA Tourist'});assert.equal(registered.status,201);
    const publicData=await registered.json();assert.equal(publicData.user.login,'tourist_qa');assert.ok(!JSON.stringify(publicData).includes('hash'));
    const cookie=registered.headers.get('set-cookie')!;assert.match(cookie,/HttpOnly/i);assert.match(cookie,/Secure/i);assert.match(cookie,/SameSite=Lax/i);
    const pair=cookie.split(';')[0];const token=pair.split('=')[1];
    assert.equal((await (await fetch(base+'/session',{headers:{Cookie:pair}})).json()).user.name,'QA Tourist');
    assert.equal((await post('/login',{...credentials,password:'wrong_password'})).status,401);
    const login=await post('/login',credentials,{Cookie:pair});assert.equal(login.status,200);const next=login.headers.get('set-cookie')!.split(';')[0];assert.notEqual(next,pair);
    assert.equal((await (await fetch(base+'/session',{headers:{Cookie:pair}})).json()).user,null);
    const stored=await readFile(file,'utf8');assert.ok(!stored.includes(credentials.password));assert.ok(!stored.includes(token));
    assert.equal((await post('/logout',{}, {Cookie:next})).status,200);
    assert.equal((await (await fetch(base+'/session',{headers:{Cookie:next}})).json()).user,null);
    for(let i=0;i<21;i++)await post('/login',{});
    assert.equal((await post('/login',{})).status,429);
  }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));
    const resolved=path.resolve(directory);assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-auth-'));await rm(resolved,{recursive:true,force:true});}
});
