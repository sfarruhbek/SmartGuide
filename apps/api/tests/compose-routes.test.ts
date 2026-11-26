import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { catalog } from '../src/planner/catalog.js';

test('HTTP compose/current/access use a persistent trial cookie; revisions and registration keep the actual plan',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'smartguide-compose-http-'));
  process.env.ACCESS_STORE_FILE=path.join(temp,'access.json');process.env.AUTH_STORE_FILE=path.join(temp,'accounts.json');
  process.env.NODE_ENV='development';process.env.CORS_ORIGIN='http://localhost:3000';
  process.env.LANDMARK_STORE='json';process.env.GROQ_API_KEYS='test-key';process.env.GROQ_MODELS='test-model';
  const {createApp}=await import('../src/app.js'),{pool}=await import('../src/db/index.js');
  const server=createServer(createApp());server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  const nativeFetch=globalThis.fetch;let providerCalls=0;
  globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
    if(String(url).startsWith(base))return nativeFetch(url,init);
    assert.ok(String(url).startsWith('https://api.groq.com/'));providerCalls++;
    const request=JSON.parse(String(init?.body)),input=JSON.parse(request.messages[1].content);
    const selected=catalog.places.filter(place=>place.city==='khiva').map(place=>place.id);
    const preferences={...input.preferences,...(input.instruction.includes('cheaper')?{budget:30}:{})};
    const excludedIds=input.requiredExcluded;
    const proposal={preferences,excludedIds,days:[{number:1,city:'khiva',placeIds:selected.slice(0,2).filter(id=>!excludedIds.includes(id))},{number:2,city:'khiva',placeIds:selected.slice(2,4).filter(id=>!excludedIds.includes(id))}],summary:input.instruction||'Your personal itinerary is ready.'};
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(proposal)}}]});
  }) as typeof fetch;
  const input={cities:['khiva'],days:2,budget:200,interests:['history'],accommodation:true,customCity:''};
  let cookie='';
  const post=(route:string,body:unknown,extra:Record<string,string>={})=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:3000',...(cookie?{Cookie:cookie}:{}),...extra},body:JSON.stringify(body)});
  const get=(route:string)=>fetch(base+route,{headers:cookie?{Cookie:cookie}:{}});
  try{
    const empty=await get('/api/trips/current');assert.equal(empty.status,200);
    assert.equal(empty.headers.get('cache-control'),'no-store');
    const trialCookie=empty.headers.get('set-cookie')!;assert.match(trialCookie,/HttpOnly/);
    cookie=trialCookie.split(';')[0];
    const emptyState=await empty.json();assert.equal(emptyState.workspace,null);assert.equal(emptyState.revision,0);
    assert.deepEqual(emptyState.access.remaining,{plans:1,photos:3,voiceSeconds:180});

    for(const route of ['/api/trips/compose','/api/trips/generate']){
      const body=route.endsWith('compose')?{preferences:input,language:'en'}:input;
      assert.equal((await post(route,body,{Origin:'https://unrelated.example'})).status,403);
      assert.equal((await post(route,body,{'Sec-Fetch-Site':'cross-site'})).status,403);
      const text=await nativeFetch(base+route,{method:'POST',headers:{Cookie:cookie,Origin:'http://localhost:3000','Content-Type':'text/plain'},body:'{}'});
      assert.equal(text.status,415);
    }
    assert.equal(providerCalls,0);
    const invalid=await post('/api/trips/compose',{preferences:{...input,budget:-1},language:'en'});assert.equal(invalid.status,400);
    assert.equal((await (await get('/api/access')).json()).remaining.plans,1);

    const createdResponse=await post('/api/trips/compose',{preferences:input,language:'en',instruction:'',action:'create'});
    assert.equal(createdResponse.status,200);assert.equal(createdResponse.headers.get('cache-control'),'no-store');
    const created=await createdResponse.json();assert.equal(created.source,'groq');assert.equal(created.modelUsed,'test-model');assert.equal(created.revision,1);
    assert.deepEqual(created.trip.input,input);assert.equal((await (await get('/api/access')).json()).remaining.plans,0);
    assert.equal(created.trip.total,created.trip.days.reduce((sum:number,day:{total:number})=>sum+day.total,0)+created.trip.reserve);

    const excluded=created.trip.days.flatMap((day:{slots:{placeId?:string}[]})=>day.slots).find((slot:{placeId?:string})=>slot.placeId).placeId;
    const editedResponse=await post('/api/trips/compose',{preferences:input,language:'en',instruction:'Make this cheaper and remove the selected stop',excludePlaceId:excluded,action:'revise'});
    assert.equal(editedResponse.status,200);const edited=await editedResponse.json();
    assert.equal(edited.revision,2);assert.equal(edited.trip.input.budget,30);assert.ok(edited.trip.total<created.trip.total);
    assert.ok(!edited.trip.days.flatMap((day:{slots:{placeId?:string}[]})=>day.slots).some((slot:{placeId?:string})=>slot.placeId===excluded));
    assert.equal(edited.trip.shortfall,Math.max(0,edited.trip.total-3000));
    const restored=await (await get('/api/trips/current')).json();assert.equal(restored.revision,2);assert.deepEqual(restored.workspace.trip,edited.trip);
    const before=providerCalls;
    const limited=await post('/api/trips/compose',{preferences:input,language:'en',action:'create'});
    assert.equal(limited.status,402);assert.equal((await limited.json()).error,'REGISTRATION_REQUIRED');assert.equal(providerCalls,before);
    assert.equal((await post('/api/trips/generate',input)).status,402);assert.equal(providerCalls,before);

    const registration=await post('/api/auth/register',{login:'trial_http_qa',password:'QA_Trial_Password_2026',name:'HTTP Trial QA'});
    assert.equal(registration.status,201);const sessionCookie=registration.headers.get('set-cookie')!.split(';')[0];
    cookie+='; '+sessionCookie;
    const registeredState=await (await get('/api/access')).json();assert.equal(registeredState.registered,true);assert.equal(registeredState.remaining,null);
    const adopted=await (await get('/api/trips/current')).json();assert.deepEqual(adopted.workspace.trip,edited.trip);assert.equal(adopted.revision,2);
    assert.equal((await post('/api/trips/compose',{preferences:input,language:'en',action:'create'})).status,200);
    assert.equal((await post('/api/trips/compose',{preferences:input,language:'en',action:'create'})).status,200);
    assert.equal((await (await get('/api/trips/current')).json()).revision,4);
    const accessFile=await readFile(process.env.ACCESS_STORE_FILE!,'utf8');
    assert.ok(!accessFile.includes(trialCookie.split(';')[0].split('=')[1]));assert.ok(!accessFile.includes(sessionCookie.split('=')[1]));
  }finally{
    globalThis.fetch=nativeFetch;server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();
    assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-compose-http-'));await rm(temp,{recursive:true,force:true});
  }
});
