import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { catalog } from '../src/planner/catalog.js';
import { generateTrip, type TripInput } from '../src/planner/trip.js';

const preferences:TripInput={cities:['khiva','bukhara'],days:4,budget:200,interests:['history','local'],accommodation:true,customCity:''};
const khiva=catalog.places.filter(p=>p.city==='khiva'),bukhara=catalog.places.filter(p=>p.city==='bukhara');
const directory=await mkdtemp(path.join(os.tmpdir(),'smartguide-compose-'));
process.env.ACCESS_STORE_FILE=path.join(directory,'access.json');process.env.AUTH_STORE_FILE=path.join(directory,'accounts.json');
process.env.GROQ_API_KEYS='test-key';process.env.GROQ_MODELS='test-model';
after(async()=>{const resolved=path.resolve(directory);assert.ok(resolved.startsWith(path.resolve(os.tmpdir())+path.sep+'smartguide-compose-'));await rm(resolved,{recursive:true,force:true});});
const proposal=()=>({preferences,excludedIds:[],days:[{number:1,city:'khiva',placeIds:[khiva[0].id]},{number:2,city:'khiva',placeIds:[khiva[1].id]},{number:3,city:'bukhara',placeIds:[]},{number:4,city:'bukhara',placeIds:[bukhara[0].id]}],summary:'A custom trip created for these preferences.'});

test('interactive AI proposals enforce city order, transfer days, distinct catalog stops and removals',async()=>{
  const {parseTravelProposal}=await import('../src/planner/interactive.js');
  const valid=proposal();assert.deepEqual(parseTravelProposal(JSON.stringify(valid),catalog.places,[]),valid);
  const trip=generateTrip(preferences,catalog.cities,catalog.places,false,[],valid.days.map(day=>day.placeIds));
  assert.deepEqual(trip.days.map(day=>day.slots.flatMap(slot=>slot.placeId?[slot.placeId]:[])),valid.days.map(day=>day.placeIds));
  for(const mutate of [
    (value:ReturnType<typeof proposal>)=>{value.days[0].placeIds=['invented'];},
    (value:ReturnType<typeof proposal>)=>{value.days[0].placeIds=[bukhara[0].id];},
    (value:ReturnType<typeof proposal>)=>{value.days[1].placeIds=[khiva[0].id];},
    (value:ReturnType<typeof proposal>)=>{value.days[2].placeIds=[bukhara[1].id];},
    (value:ReturnType<typeof proposal>)=>{value.days[0].number=2;},
    (value:ReturnType<typeof proposal>)=>{value.days.pop();},
    (value:ReturnType<typeof proposal>)=>{value.excludedIds=[khiva[0].id];},
    (value:ReturnType<typeof proposal>)=>{value.excludedIds=['invented'];},
  ]){const value=proposal();mutate(value);assert.throws(()=>parseTravelProposal(JSON.stringify(value),catalog.places,[]));}
  assert.throws(()=>parseTravelProposal(JSON.stringify(valid),catalog.places,[khiva[0].id]));
  valid.excludedIds=[khiva[0].id];valid.days[0].placeIds=[];
  assert.doesNotThrow(()=>parseTravelProposal(JSON.stringify(valid),catalog.places,[khiva[0].id]));
  assert.throws(()=>parseTravelProposal(JSON.stringify({...valid,price:1}),catalog.places,[]));
  assert.doesNotThrow(()=>parseTravelProposal(JSON.stringify(valid),catalog.places,[],preferences));
  assert.throws(()=>parseTravelProposal(JSON.stringify({...valid,preferences:{...preferences,budget:500}}),catalog.places,[],preferences));
});

test('interactive requests save actual AI changes, preserve removals and refund unsuccessful generation',async()=>{
  const nativeFetch=globalThis.fetch;
  try{
    const {composeTravel}=await import('../src/planner/interactive.js');
    const {accessState,workspaceState}=await import('../src/access/store.js');
    let fail=false,calls=0;
    globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{
      assert.ok(String(url).startsWith('https://api.groq.com/'));calls++;
      if(fail)return Response.json({}, {status:503});
      const request=JSON.parse(String(init?.body)),input=JSON.parse(request.messages[1].content),result=proposal();
      result.preferences={...preferences,budget:input.instruction.includes('cheaper')?120:200};
      result.excludedIds=input.requiredExcluded;
      for(const day of result.days)day.placeIds=day.placeIds.filter((id:string)=>!result.excludedIds.includes(id));
      result.summary=input.instruction;
      return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(result)}}]});
    }) as typeof fetch;
    const visitor={key:'guest:compose-qa',registered:false};
    const initial=await composeTravel(visitor,{preferences,language:'en',instruction:'Create my custom trip',action:'create'});
    assert.equal(initial.source,'groq');assert.equal(initial.modelUsed,'test-model');assert.equal(initial.revision,1);
    assert.equal((await accessState(visitor)).remaining?.plans,0);
    const edited=await composeTravel(visitor,{preferences,language:'en',instruction:'Make it cheaper and remove this place',action:'revise',excludePlaceId:khiva[0].id});
    assert.equal(edited.trip.input.budget,120);assert.equal(edited.revision,2);
    assert.ok(!edited.trip.days.flatMap(day=>day.slots).some(slot=>slot.placeId===khiva[0].id));
    const again=await composeTravel(visitor,{preferences:edited.trip.input,language:'en',instruction:'Keep this itinerary',action:'revise'});
    assert.ok(again.excludedIds.includes(khiva[0].id));assert.equal(again.revision,3);
    const before=calls;await assert.rejects(composeTravel(visitor,{preferences,language:'en',instruction:'Another trip',action:'create'}),{status:402});assert.equal(calls,before);
    const cancelledVisitor={key:'guest:compose-cancelled-qa',registered:false},controller=new AbortController();
    const mockFetch=globalThis.fetch;
    globalThis.fetch=(async(url:string|URL|Request,init?:RequestInit)=>{const response=await mockFetch(url,init);controller.abort();return response;}) as typeof fetch;
    await assert.rejects(composeTravel(cancelledVisitor,{preferences,language:'en',instruction:'Create',action:'create'},{signal:controller.signal}),{name:'AbortError'});
    assert.equal((await accessState(cancelledVisitor)).remaining?.plans,1);assert.equal((await workspaceState(cancelledVisitor)).workspace,null);
    globalThis.fetch=mockFetch;
    const failedVisitor={key:'guest:compose-failure-qa',registered:false};fail=true;
    await assert.rejects(composeTravel(failedVisitor,{preferences,language:'en',instruction:'Generate',action:'create'}));
    assert.equal((await accessState(failedVisitor)).remaining?.plans,1);
    assert.equal((await workspaceState(failedVisitor)).workspace,null);
  }finally{
    globalThis.fetch=nativeFetch;
  }
});
