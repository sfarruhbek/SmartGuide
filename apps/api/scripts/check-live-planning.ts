import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { WebSocket } from 'ws';

// One real guest session: Gemini Live invokes Groq to create and revise a trip.
// Text commands exercise the Live tools, not a physical microphone or speech input.
const base=(process.argv.slice(2).find(arg=>!arg.startsWith('--'))??'http://127.0.0.1:4001').replace(/\/$/,'');
const began=Date.now(),cookies=new Map<string,string>();
const preferences={cities:['bukhara'],days:2,budget:100,interests:['history','local'],accommodation:true,customCity:''};
type Result={source:string;modelUsed:string;revision:number;excludedIds:string[];trip:{summary:string;input:typeof preferences;days:{slots:{placeId?:string}[]}[];places:{id:string;name:{ru?:string;en:string}}[];total:number}};
let socket:WebSocket|undefined,phase='initialize',model='',audioBytes=0,transcriptChars=0,toolLookups=0;
let created:Result|undefined,revised:Result|undefined,removedId='',removedName='';
const remaining=()=>Math.max(1,115000-(Date.now()-began));
async function request(path:string,body?:unknown){
  const response=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),Origin:'http://localhost:3000',...(cookies.size?{Cookie:[...cookies].map(([k,v])=>k+'='+v).join('; ')}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(remaining())});
  for(const cookie of response.headers.getSetCookie()){const pair=cookie.split(';')[0],index=pair.indexOf('=');if(index>0)cookies.set(pair.slice(0,index),pair.slice(index+1));}
  assert.equal(response.status,200,'API request failed');return response.json();
}
try{
  const initial=await request('/api/trips/current');assert.equal(initial.workspace,null);assert.equal(initial.access.registered,false);
  const grant=await request('/api/explore/live/session',{cityId:'bukhara',language:'ru',locationSource:'map',purpose:'plan',tripPreferences:preferences});
  assert.match(grant.token,/^[a-f0-9]{64}$/);
  const url=new URL(base);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.pathname='/api/explore/live';url.search='';url.hash='';
  phase='welcome';socket=new WebSocket(url,['smartguide-live',grant.token],{origin:'http://localhost:3000',handshakeTimeout:Math.min(20000,remaining())});
  const send=(text:string)=>socket!.send(JSON.stringify({type:'text',text}));
  await new Promise<void>((resolve,reject)=>{
    const deadline=setTimeout(()=>reject(new Error('Live planning deadline')),remaining());
    const finish=(error?:Error)=>{clearTimeout(deadline);if(error)reject(error);else resolve();};
    socket!.on('error',()=>finish(new Error('WebSocket unavailable')));
    socket!.on('close',()=>{if(phase!=='complete')finish(new Error('Live ended before trip revision'));});
    socket!.on('message',raw=>{
      try{
        const data=JSON.parse(raw.toString());
        if(data.type==='error'||data.type==='registrationRequired')throw new Error('Live operation unavailable');
        if(data.type==='ready'){assert.equal(typeof data.model,'string');model=data.model;}
        if(data.type==='audio')audioBytes+=Buffer.from(data.data,'base64').length;
        if(data.type==='transcript'&&data.role==='assistant')transcriptChars+=String(data.text).length;
        if(data.type==='lookingUp')toolLookups++;
        if(data.type==='tripUpdated'){
          const value=data.result as Result;assert.equal(value.source,'groq');assert.ok(value.modelUsed);assert.ok(Number.isSafeInteger(value.revision));
          assert.ok(Array.isArray(value.trip.days));assert.equal(value.trip.input.days,2);assert.deepEqual(value.trip.input.cities,['bukhara']);
          if(phase==='create'){
            created=value;removedId=value.trip.days.flatMap(day=>day.slots).find(slot=>slot.placeId)?.placeId??'';assert.ok(removedId,'Created itinerary has no removable stop');
            const place=value.trip.places.find(place=>place.id===removedId);assert.ok(place);removedName=place.name.ru??place.name.en;phase='created';
          }else if(phase==='revise'){
            assert.ok(created);assert.ok(value.revision>created.revision);assert.ok(!value.trip.days.some(day=>day.slots.some(slot=>slot.placeId===removedId)),'Removed stop is still in itinerary');
            assert.ok(value.excludedIds.includes(removedId));revised=value;phase='revised';
          }
        }
        if(data.type==='turnComplete'&&phase==='welcome'){
          phase='create';send('Составь и сохрани мой план: только Бухара, 2 дня, общий бюджет 100 долларов на одного, интересы история и местная культура, проживание включить. Других пожеланий нет. Используй создание маршрута сейчас.');
        }else if(data.type==='turnComplete'&&phase==='created'){
          phase='revise';send(`Измени текущий сохранённый план: убери ${removedName}, ID ${removedId}. Это место мне не нравится. Исключи его из обоих дней и предложи другое из каталога. Сохрани остальные пожелания: только Бухара, 2 дня, 100 долларов, история и местная культура, с проживанием. Сохрани изменённый маршрут.`);
        }else if(data.type==='turnComplete'&&phase==='revised'){
          phase='complete';finish();
        }
      }catch{finish(new Error('Live planning assertion failed'));}
    });
  });
  assert.ok(created&&revised&&model);assert.ok(audioBytes>1000);
  const saved=await request('/api/trips/current');assert.equal(saved.revision,revised.revision);assert.ok(!saved.workspace.trip.days.some((day:Result['trip']['days'][number])=>day.slots.some(slot=>slot.placeId===removedId)));
  assert.equal(saved.access.remaining.plans,0);
  const report={checkedAt:new Date().toISOString(),model,audioBytes,assistantTranscriptChars:transcriptChars,toolLookups,elapsedMs:Date.now()-began,
    created:{source:created.source,model:created.modelUsed,revision:created.revision,days:created.trip.days.length,totalUsd:created.trip.total/100,summary:created.trip.summary},
    revised:{source:revised.source,model:revised.modelUsed,revision:revised.revision,removedPlaceId:removedId,removedFromAllDays:true,totalUsd:revised.trip.total/100,summary:revised.trip.summary},
    persistedRevision:saved.revision,guestPlansRemaining:saved.access.remaining.plans,
    scope:'Real API WebSocket, Gemini Live audio replies and manage_trip tool invoking Groq for creation and revision. Input commands were text over the Live protocol; physical microphone, speech recognition and current browser UI were not tested.'};
  if(process.argv.includes('--report'))writeFileSync(new URL('../../../documentation/LIVE_PLANNING_CHECK_2026-11-26.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}catch{
  console.error(JSON.stringify({error:'Live planning check failed',phase,model,audioBytes,assistantTranscriptChars:transcriptChars,toolLookups,createdRevision:created?.revision,revisedRevision:revised?.revision,elapsedMs:Date.now()-began}));process.exitCode=1;
}finally{socket?.close();const timeout=setTimeout(()=>socket?.terminate(),1000);timeout.unref();}
