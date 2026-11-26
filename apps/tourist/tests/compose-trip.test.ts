import test from 'node:test';
import assert from 'node:assert/strict';
import { CITIES, PLACES } from '../src/lib/places';
import { generateTrip, readTrip, TRIP_KEY, type Place, type TripInput } from '../src/lib/journey';
import { composeTrip, currentTrip, parseComposedTrip } from '../src/lib/trip-api';
import { parseAccessState, readAccess, registrationRequired } from '../src/lib/access-api';
import { ApiError } from '../src/lib/http';

const input:TripInput={cities:['nukus'],days:1,budget:60,interests:['history'],accommodation:false,customCity:''};
const sourcePlace:Place={id:'wiki-savitsky',city:'nukus',name:{en:'Savitsky Museum',ru:'Музей Савицкого',uz:'Savitskiy muzeyi'},
  story:{en:'A public source record.',ru:'Запись публичного каталога.',uz:'Ochiq manba qaydi.'},lat:42.466,lng:59.612,
  interests:['history'],category:'landmark',admission:0,minutes:60,source:'https://en.wikipedia.org/wiki/Nukus_Museum_of_Art'};
const response=()=>({trip:{...generateTrip(input,CITIES,[sourcePlace]),places:[sourcePlace],summary:'Музей и свободное время в Нукусе.'},source:'groq',modelUsed:'test-model',fallbackReason:null,revision:2});
const access={registered:false,remaining:{plans:0,photos:2,voiceSeconds:175},limits:{plans:1,photos:3,voiceSeconds:180}};

test('composed and restored plans preserve sourced dynamic stops, exact costs and changed preferences',()=>{
  const data=response();
  const trip=parseComposedTrip(data);
  assert.equal(trip.input.cities[0],'nukus');
  assert.equal(trip.days[0].slots.find(slot=>slot.kind==='visit')?.placeId,'wiki-savitsky');
  assert.equal(trip.places?.[0].source,sourcePlace.source);assert.equal(trip.revision,2);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>key===TRIP_KEY?JSON.stringify(trip):null}});
  assert.deepEqual(readTrip(CITIES,PLACES),trip);
  const cheaper={...data,trip:{...data.trip,input:{...input,budget:30}}};
  assert.equal(parseComposedTrip(cheaper).input.budget,30);
});

test('unsafe dynamic source records and invalid compositions cannot become saved map stops',()=>{
  for(const patch of [{source:'javascript:alert(1)'},{source:'http://example.test/'},{source:'https://name:password@example.test/'},
    {city:'invented'},{lat:100},{lng:NaN},{admission:-1},{minutes:1000},{name:{en:'x'}},{story:{en:'',ru:'x',uz:'x'}},{id:'<script>'}]){
    const data=response();data.trip.places=[{...sourcePlace,...patch} as Place];assert.throws(()=>parseComposedTrip(data));
  }
  const duplicated=response();duplicated.trip.places=[sourcePlace,sourcePlace];assert.throws(()=>parseComposedTrip(duplicated));
  const incorrectMoney=response();incorrectMoney.trip.total++;assert.throws(()=>parseComposedTrip(incorrectMoney));
  const missing=response();missing.trip.places=[];assert.throws(()=>parseComposedTrip(missing));
  for(const patch of [{source:'local-fallback'},{revision:-1},{modelUsed:''},{fallbackReason:'provider-down'}])assert.throws(()=>parseComposedTrip({...response(),...patch}));
});

test('compose and current trip use same-origin cookies and return actual server revision',async()=>{
  const original=globalThis.fetch;let called=0;
  globalThis.fetch=(async(url:string,init?:RequestInit)=>{
    called++;assert.equal(init?.credentials,'include');
    if(url==='/api/trips/compose'){
      assert.equal(init?.method,'POST');
      assert.deepEqual(JSON.parse(String(init.body)),{preferences:input,language:'ru',instruction:'Убери музей',action:'revise',excludePlaceId:'wiki-savitsky'});
      return Response.json(response());
    }
    if(url==='/api/trips/current'){assert.equal(init?.cache,'no-store');return Response.json({workspace:response(),revision:7,access});}
    if(url==='/api/access')return Response.json(access);
    throw new Error('Unexpected route');
  }) as typeof fetch;
  try{
    assert.equal((await composeTrip(input,{language:'ru',instruction:'Убери музей',action:'revise',excludePlaceId:'wiki-savitsky'})).revision,2);
    const current=await currentTrip();assert.equal(current.trip?.revision,7);assert.equal(current.access.remaining?.voiceSeconds,175);
    assert.deepEqual(await readAccess(),access);assert.equal(called,3);
  }finally{globalThis.fetch=original;}
});

test('trial responses are bounded and registration is requested for server 402 only',()=>{
  assert.deepEqual(parseAccessState(access),access);
  assert.equal(parseAccessState({...access,registered:true,remaining:null}).remaining,null);
  for(const patch of [{registered:true},{remaining:null},{remaining:{...access.remaining,photos:4}},{remaining:{...access.remaining,voiceSeconds:-1}},{remaining:{...access.remaining,plans:0.5}},{limits:{plans:99,photos:3,voiceSeconds:180}}])assert.throws(()=>parseAccessState({...access,...patch}));
  assert.ok(registrationRequired(new ApiError('REGISTRATION_REQUIRED',402)));
  assert.ok(!registrationRequired(new ApiError('AI_UNAVAILABLE',503)));
});
