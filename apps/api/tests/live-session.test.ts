import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { WebSocket } from 'ws';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { LiveConnectParameters, Session } from '@google/genai';
import express from 'express';

test('Live WebSocket requires a short-lived one-use grant and the configured browser origin',async()=>{
  const temp=await mkdtemp(path.join(os.tmpdir(),'smartguide-live-test-'));process.env.ACCESS_STORE_FILE=path.join(temp,'access.json');process.env.AUTH_STORE_FILE=path.join(temp,'accounts.json');
  process.env.NODE_ENV='production';process.env.GROQ_API_KEYS='test-key';process.env.GEMINI_API_KEY='server-only-test-key';
  process.env.LANDMARK_STORE='json';process.env.CORS_ORIGIN='http://localhost:3000';
  const {createApp}=await import('../src/app.js');const {attachLiveVoice}=await import('../src/explore/live.js');
  const {pool}=await import('../src/db/index.js');
  const server=createServer(createApp());let connections=0;
  const relay=attachLiveVoice(server,async ws=>{connections++;ws.close(1000,'Test complete');});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  const session=async(body:unknown)=>fetch(base+'/api/explore/live/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const connect=(token?:string,origin='http://localhost:3000')=>new Promise<boolean>(resolve=>{
    const ws=new WebSocket(base.replace('http:','ws:')+'/api/explore/live',token?['smartguide-live',token]:['smartguide-live'],{origin});let opened=false;
    ws.on('open',()=>{opened=true;});ws.on('error',()=>resolve(false));ws.on('close',()=>resolve(opened));
  });
  try{
    const context={cityId:'samarkand',language:'ru',locationSource:'map'};
    assert.equal((await session({...context,imageBase64:'abc'})).status,400);
    assert.equal((await session({...context,cityId:'invalid'})).status,400);
    assert.equal((await fetch(base+'/api/explore/live/session',{method:'POST',headers:{'Content-Type':'application/json','Sec-Fetch-Site':'cross-site'},body:JSON.stringify(context)})).status,403);
    const response=await session(context);assert.equal(response.status,200);
    const grant=await response.json();assert.match(grant.token,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(grant).includes('server-only-test-key'));
    assert.equal(await connect(),false);
    assert.equal(await connect(grant.token,'https://unrelated.example'),false);
    assert.equal(await connect(grant.token),true);
    assert.equal(await connect(grant.token),false);
    assert.equal(connections,1);
  }finally{relay.close();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();assert.ok(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-live-test-'));await rm(temp,{recursive:true,force:true});}
});

test('Live session router rejects an unrelated Origin and non-JSON before creating a visitor',async()=>{
  const {liveVoiceRouter}=await import('../src/explore/live.js');
  const app=express();app.use(express.json());app.use('/api/explore/live',liveVoiceRouter);
  const server=createServer(app);server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');const url=`http://127.0.0.1:${address.port}/api/explore/live/session`;
  try{
    const rejected=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:JSON.stringify(context)});
    assert.equal(rejected.status,403);assert.equal(rejected.headers.get('set-cookie'),null);
    const text=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'});assert.equal(text.status,415);
  }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

class FakeSocket extends EventEmitter {
  readyState=WebSocket.OPEN;bufferedAmount=0;messages:Record<string,unknown>[]=[];
  send(text:string){const value=JSON.parse(text);this.messages.push(value);this.emit('sent',value);}
  close(){if(this.readyState!==WebSocket.CLOSED){this.readyState=WebSocket.CLOSED;this.emit('close');}}
  ping(){}
}
const context={cityId:'khiva',language:'ru' as const,locationSource:'map' as const,question:'What is nearby?',history:[]};
const preferences={cities:['khiva'],days:2,budget:100,interests:['history' as const],accommodation:true,customCity:''};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const makeConnection=()=>{
  let options:LiveConnectParameters;const responses:unknown[]=[];
  const session={sendRealtimeInput(){},sendToolResponse(value:unknown){responses.push(value);},close(){}} as unknown as Session;
  return {session,responses,get options(){return options;},connect:async(value:LiveConnectParameters)=>{options=value;value.callbacks.onmessage({setupComplete:{}});return session;}};
};

test('Live trial expiry asks for registration, registered sessions do not, and leases close',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  for(const registered of [false,true]){
    const ws=new FakeSocket(),connection=makeConnection();let closes=0;
    await serveVoice(ws as unknown as WebSocket,context,{key:registered?'account:test':'guest:test',registered},{connect:connection.connect,openVoice:async()=>({durationMs:10,close:async()=>{closes++;}})});
    assert.ok(ws.messages.some(value=>value.type==='ready'));
    await new Promise(resolve=>setTimeout(resolve,30));
    assert.equal(ws.messages.some(value=>value.type==='registrationRequired'),!registered);
    if(registered)ws.close();await tick();assert.equal(closes,1);
  }
});

test('Live storage/concurrent errors do not falsely report an exhausted trial',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');const {AccessError}=await import('../src/access/store.js');
  for(const error of [new AccessError(409,'VOICE_ALREADY_ACTIVE'),new Error('Disk unavailable')]){
    const ws=new FakeSocket(),connection=makeConnection();
    await serveVoice(ws as unknown as WebSocket,context,{key:'guest:test',registered:false},{connect:connection.connect,openVoice:async()=>{throw error;}});
    assert.ok(!ws.messages.some(value=>value.type==='registrationRequired'));
    assert.ok(ws.messages.some(value=>value.type==='error'));
    assert.equal(ws.readyState,WebSocket.CLOSED);
  }
});

test('Live trip tool saves collected preferences and emits the real returned itinerary',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  const connection=makeConnection(),ws=new FakeSocket();let received:unknown;
  const result={trip:{input:preferences,summary:'Two days in Khiva',days:[],total:2300},source:'groq',modelUsed:'test',fallbackReason:null,revision:1};
  await serveVoice(ws as unknown as WebSocket,{...context,purpose:'plan'},{key:'guest:plan',registered:false},{
    connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),
    workspaceState:(async()=>({workspace:null})) as never,
    compose:(async(_visitor:unknown,input:unknown)=>{received=input;return result;}) as never,
  });
  const tool=connection.options.config?.tools?.[0];assert.ok(JSON.stringify(tool).includes('manage_trip'));
  connection.options.callbacks.onmessage({toolCall:{functionCalls:[{id:'trip-1',name:'manage_trip',args:{instruction:'Два дня в Хиве, сто долларов',preferences}}]}});
  await tick();await tick();
  assert.deepEqual(received,{preferences,language:'ru',instruction:'Два дня в Хиве, сто долларов',action:'create'});
  assert.deepEqual(ws.messages.find(value=>value.type==='tripUpdated')?.result,result);
  assert.ok(JSON.stringify(connection.responses).includes('"saved":true'));
  ws.close();
});

test('Live manage_trip normalizes Russian/Uzbek/capitalized cities and missing optional fields instead of rejecting',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  const {normalizeVoicePreferences}=await import('../src/planner/voice-preferences.js');
  const normalized=normalizeVoicePreferences({cities:['Самарканд','Бухаре','Чимган'],days:'4',budget:'$350',interests:['культура','еда']});
  assert.equal(normalized.ok,true);
  if(normalized.ok){
    assert.deepEqual(normalized.data,{cities:['samarkand','bukhara'],days:4,budget:350,interests:['local','food'],accommodation:true,customCity:'Чимган'});
  }
  const connection=makeConnection(),ws=new FakeSocket();let received:unknown;
  const expectedPrefs={cities:['samarkand','bukhara'],days:4,budget:300,interests:['history','local'],accommodation:true,customCity:''};
  const result={trip:{input:expectedPrefs,summary:'4 дня в Самарканде и Бухаре',days:[],total:18000},source:'groq',modelUsed:'test',fallbackReason:null,revision:1};
  await serveVoice(ws as unknown as WebSocket,{...context,purpose:'plan'},{key:'guest:ru-plan',registered:false},{
    connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),
    workspaceState:(async()=>({workspace:null})) as never,
    compose:(async(_visitor:unknown,input:unknown)=>{received=input;return result;}) as never,
  });
  connection.options.callbacks.onmessage({toolCall:{functionCalls:[{id:'trip-ru',name:'manage_trip',args:{
    instruction:'Четыре дня в Самарканде и Бухаре, бюджет 300 долларов',
    preferences:{cities:['Самарканд','Бухара'],days:4,budget:300},
  }}]}});
  await tick();await tick();
  assert.deepEqual(received,{preferences:expectedPrefs,language:'ru',instruction:'Четыре дня в Самарканде и Бухаре, бюджет 300 долларов',action:'create'});
  assert.deepEqual(ws.messages.find(value=>value.type==='tripUpdated')?.result,result);
  ws.close();
});

test('Live focused placeId injects verified facts and opens immediately with a story about that place',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  const sentInputs:unknown[]=[];
  const connection=makeConnection();
  (connection.session as unknown as {sendRealtimeInput:(v:unknown)=>void}).sendRealtimeInput=(v)=>{sentInputs.push(v);};
  const ws=new FakeSocket();
  await serveVoice(ws as unknown as WebSocket,{...context,cityId:'samarkand',placeId:'ishratkhana',purpose:'guide'},{key:'guest:focus-place',registered:false},{
    connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),
  });
  const sys=String(connection.options.config?.systemInstruction??'');
  assert.ok(sys.includes('Ishratkhana Mausoleum'));
  assert.ok(sys.includes('1464'));
  assert.ok(sentInputs.some(input=>JSON.stringify(input).includes('Ishratkhana Mausoleum')&&JSON.stringify(input).includes('Do NOT talk about creating or changing their trip plan')));
  ws.emit('message',Buffer.from(JSON.stringify({type:'context',cityId:'samarkand',placeId:'osm-123',placeName:'Самаркандский бумажный цех Конигил',locationSource:'map',focusNow:true})));
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.ok(sentInputs.some(input=>JSON.stringify(input).includes('Самаркандский бумажный цех Конигил')&&JSON.stringify(input).includes('Do not talk about changing the trip plan')));
  ws.close();
});

test('Live focused placeName fallback narrates dynamic/OSM places without talking about trip planning',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  const sentInputs:unknown[]=[];
  const connection=makeConnection();
  (connection.session as unknown as {sendRealtimeInput:(v:unknown)=>void}).sendRealtimeInput=(v)=>{sentInputs.push(v);};
  const ws=new FakeSocket();
  await serveVoice(ws as unknown as WebSocket,{...context,cityId:'bukhara',placeId:'osm-custom-99',placeName:'Чайхана у Ляби-Хауза',purpose:'guide'},{key:'guest:focus-name',registered:false},{
    connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),
  });
  const sys=String(connection.options.config?.systemInstruction??'');
  assert.ok(sys.includes('Чайхана у Ляби-Хауза'));
  assert.ok(sentInputs.some(input=>JSON.stringify(input).includes('Чайхана у Ляби-Хауза')&&JSON.stringify(input).includes('Do NOT talk about creating or changing their trip plan')));
  ws.close();
});

test('Live refunds a photo reservation if the visitor disconnects before delivery',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  const connection=makeConnection(),ws=new FakeSocket();let resolveReservation!:(refund:()=>Promise<void>)=>void,refunds=0;
  await serveVoice(ws as unknown as WebSocket,context,{key:'guest:photo',registered:false},{connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),reservePhoto:async()=>new Promise(resolve=>{resolveReservation=resolve;})});
  ws.emit('message',Buffer.from(JSON.stringify({type:'photo',data:'YWJjZA==',mimeType:'image/jpeg'})));
  ws.close();resolveReservation(async()=>{refunds++;});await tick();
  assert.equal(refunds,1);assert.ok(!ws.messages.some(value=>value.type==='photoAccepted'));
});

test('Live cancelled or disconnected trip tools cannot publish a late itinerary',async()=>{
  const {serveVoice}=await import('../src/explore/live.js');
  for(const reason of ['cancel','disconnect']){
    const connection=makeConnection(),ws=new FakeSocket();let signal:AbortSignal|undefined,finish!:()=>void;
    await serveVoice(ws as unknown as WebSocket,{...context,tripPreferences:preferences},{key:'guest:cancel',registered:false},{
      connect:connection.connect,openVoice:async()=>({durationMs:180000,close:async()=>{}}),workspaceState:(async()=>({workspace:null})) as never,
      compose:(async(_visitor:unknown,_input:unknown,options:{signal:AbortSignal})=>{signal=options.signal;await new Promise<void>(resolve=>{finish=resolve;});return {trip:{input:preferences,summary:'Late result',days:[],total:2300}};}) as never,
    });
    connection.options.callbacks.onmessage({toolCall:{functionCalls:[{id:'cancel-trip',name:'manage_trip',args:{instruction:'Prepare my trip'}}]}});
    await tick();assert.ok(signal);
    if(reason==='cancel')connection.options.callbacks.onmessage({toolCallCancellation:{ids:['cancel-trip']}});else ws.close();
    assert.equal(signal.aborted,true);finish();await tick();await tick();
    assert.ok(!ws.messages.some(value=>value.type==='tripUpdated'));assert.equal(connection.responses.length,0);ws.close();
  }
});
