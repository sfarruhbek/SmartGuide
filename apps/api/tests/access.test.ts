import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { once } from 'node:events';

test('server trial survives reconnects, enforces independent limits and adopts a guest trip on registration',async(t)=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'smartguide-access-'));
  process.env.ACCESS_STORE_FILE=path.join(directory,'access.json');
  process.env.AUTH_STORE_FILE=path.join(directory,'accounts.json');
  process.env.NODE_ENV='production';process.env.CORS_ORIGIN='http://localhost:3000';
  const access=await import('../src/access/store.js');
  const {authRouter}=await import('../src/routes/auth.routes.js');
  const {accessRouter}=await import('../src/routes/access.routes.js');
  const app=express();app.use(express.json());app.use('/api/access',accessRouter);app.use('/api/auth',authRouter);
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  const originalNow=Date.now;let clock=originalNow();
  try{
    const initial=await fetch(base+'/api/access');assert.equal(initial.status,200);
    assert.equal(initial.headers.get('cache-control'),'no-store');
    assert.deepEqual((await initial.json()).remaining,{plans:1,photos:3,voiceSeconds:180});
    const cookie=initial.headers.get('set-cookie')!;assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Lax/);
    const pair=cookie.split(';')[0],token=pair.split('=')[1];
    const req={headers:{cookie:pair}} as express.Request;
    const res={cookie:()=>{throw new Error('Existing trial cookie must not be replaced');}} as unknown as express.Response;
    const visitor=await access.resolveVisitor(req,res);
    assert.equal(visitor.registered,false);assert.ok(!visitor.key.includes(token));

    await t.test('one plan is atomic; failed work refunds once; photos have an independent cap',async()=>{
      const reservations=await Promise.allSettled([access.reserveUse(visitor,'plans'),access.reserveUse(visitor,'plans')]);
      assert.equal(reservations.filter(r=>r.status==='fulfilled').length,1);
      const failure=reservations.find(r=>r.status==='rejected') as PromiseRejectedResult;
      assert.equal(failure.reason.status,402);assert.equal(failure.reason.code,'REGISTRATION_REQUIRED');
      const refund=(reservations.find(r=>r.status==='fulfilled') as PromiseFulfilledResult<()=>Promise<void>>).value;
      await refund();await refund();assert.equal((await access.accessState(visitor)).remaining?.plans,1);
      await access.reserveUse(visitor,'plans');
      for(let i=0;i<3;i++)await access.reserveUse(visitor,'photos');
      await assert.rejects(access.reserveUse(visitor,'photos'),{status:402,code:'REGISTRATION_REQUIRED'});
      const restored=await fetch(base+'/api/access',{headers:{Cookie:pair}});
      assert.equal(restored.headers.get('set-cookie'),null);
      assert.deepEqual((await restored.json()).remaining,{plans:0,photos:0,voiceSeconds:180});
    });

    await t.test('voice consumes accumulated wall time across reconnects and rejects simultaneous trial calls',async()=>{
      Date.now=()=>clock;
      const first=await access.openVoice(visitor);assert.equal(first.durationMs,180000);
      await assert.rejects(access.openVoice(visitor),{status:409,code:'VOICE_ALREADY_ACTIVE'});
      clock+=65000;assert.equal((await access.accessState(visitor)).remaining?.voiceSeconds,115);
      await first.close();await first.close();
      const second=await access.openVoice(visitor);assert.equal(second.durationMs,115000);
      clock+=35000;await second.close();
      const third=await access.openVoice(visitor);assert.equal(third.durationMs,80000);
      clock+=80001;
      await assert.rejects(access.checkVoice(visitor),{status:402,code:'REGISTRATION_REQUIRED'});
      await third.close();
      assert.equal((await access.accessState(visitor)).remaining?.voiceSeconds,0);
      await assert.rejects(access.openVoice(visitor),{status:402,code:'REGISTRATION_REQUIRED'});
      Date.now=originalNow;
    });

    await t.test('photo follow-ups reuse a hashed slot and concurrent failures refund only their own reservations',async()=>{
      const photos={key:'guest:photos-only',registered:false};
      const [first,second]=await Promise.all([access.reservePhoto(photos,'same-image-base64'),access.reservePhoto(photos,'same-image-base64')]);
      assert.equal((await access.accessState(photos)).remaining?.photos,2);
      await Promise.all([first(),first()]);
      assert.equal((await access.accessState(photos)).remaining?.photos,2);
      await second();assert.equal((await access.accessState(photos)).remaining?.photos,3);
      await access.reservePhoto(photos,'image-a');await access.reservePhoto(photos,'image-b');await access.reservePhoto(photos,'image-c');
      await access.reservePhoto(photos,'image-a');
      assert.equal((await access.accessState(photos)).remaining?.photos,0);
      await assert.rejects(access.reservePhoto(photos,'image-d'),{status:402,code:'REGISTRATION_REQUIRED'});
      const raw=await readFile(process.env.ACCESS_STORE_FILE!,'utf8');
      assert.ok(!raw.includes('same-image-base64'));assert.ok(!raw.includes('image-a'));
    });

    await t.test('workspace compare-and-swap rejects stale edits and registration keeps the current guest plan',async()=>{
      const workspace={trip:{input:{cities:['khiva']},summary:'Existing guest plan'}};
      assert.equal(await access.saveWorkspace(visitor,workspace,0),1);
      await assert.rejects(access.saveWorkspace(visitor,{trip:'stale'},0),{status:409,code:'TRIP_CHANGED'});
      assert.deepEqual((await access.workspaceState(visitor)).workspace,workspace);
      const registered=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json',Cookie:pair,Origin:'http://localhost:3000'},body:JSON.stringify({name:'Trial QA',login:'trial_qa',password:'Trial_QA_2026_password'})});
      assert.equal(registered.status,201);const user=(await registered.json()).user;
      const account={key:'account:'+user.id,registered:true};
      assert.deepEqual((await access.workspaceState(account)).workspace,workspace);
      assert.equal((await access.workspaceState(account)).revision,1);
      for(let i=0;i<4;i++){await access.reserveUse(account,'plans');await access.reserveUse(account,'photos');}
      assert.equal((await access.accessState(account)).remaining,null);
      const voice=await access.openVoice(account);assert.equal(voice.durationMs,600000);await voice.close();
      await access.saveWorkspace(account,{trip:'Account edited plan'},1);
      await access.adoptGuestWorkspace(req,user.id);
      assert.deepEqual((await access.workspaceState(account)).workspace,{trip:'Account edited plan'});
      assert.ok(!(await readFile(process.env.ACCESS_STORE_FILE!,'utf8')).includes(token));
    });
  }finally{
    Date.now=originalNow;server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));
    const resolved=path.resolve(directory);assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-access-'));await rm(resolved,{recursive:true,force:true});
  }
});
