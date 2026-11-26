import test from 'node:test';
import assert from 'node:assert/strict';
import { allExplorePlaces, nearbyPlaces } from '../src/explore/catalog.js';
import { exploreRequestSchema, parseExploreAnswer } from '../src/explore/chat.js';
import { lookupWikipedia } from '../src/explore/web-source.js';
import { tourismTopics } from '../src/explore/topics.js';

test('national context has all 16 city areas, non-Khiva places and near distances',async()=>{
  const places=await allExplorePlaces();
  // Runtime web cache may add areas without a curated cityId.
  assert.equal(new Set(places.filter(p=>p.kind==='area'&&p.cityId).map(p=>p.cityId)).size,16);
  assert.ok(places.some(p=>p.cityId==='nukus'&&p.kind==='place'));
  assert.ok(places.some(p=>p.cityId==='andijan'&&p.kind==='place'));
  const near=nearbyPlaces(places,{lat:39.65,lng:66.97});
  assert.ok(near.some(p=>p.id==='registan'));
  assert.ok(!near.some(p=>p.cityId==='khiva'));
  assert.deepEqual(nearbyPlaces(places,{lat:0,lng:0}),[]);
});
test('map context and image validation reject invalid GPS, cities and excessive history',()=>{
  const valid={cityId:'samarkand',question:'Что рядом?',language:'ru'};
  assert.ok(exploreRequestSchema.safeParse(valid).success);
  for(const patch of [{cityId:'missing'},{locationSource:'gps'},{location:{lat:95,lng:65}},{imageBase64:'not base64!'},
    {history:Array.from({length:9},()=>({role:'user',text:'x'}))}])assert.ok(!exploreRequestSchema.safeParse({...valid,...patch}).success);
});
test('source IDs are validated for both places and tourist objects',()=>{
  assert.ok(tourismTopics.some(p=>p.id==='topic-palov'));
  assert.equal(parseExploreAnswer('{"answer":"A rice dish","citedPlaceIds":["topic-palov"],"focusPlaceId":null}',tourismTopics).answer,'A rice dish');
  assert.throws(()=>parseExploreAnswer('{"answer":"x","citedPlaceIds":["fake"],"focusPlaceId":null}',tourismTopics));
});
test('Wikipedia lookup saves only attributed public text and bounded coordinates',async()=>{
  let requested='';
  const fetcher=(async(url:URL)=>{requested=String(url);return Response.json({query:{pages:[
    {pageid:10,title:'Museum in Uzbekistan',description:'Museum in Uzbekistan',extract:'A museum in Uzbekistan with public collections.',coordinates:[{lat:42.46,lon:59.61}]},
    {pageid:20,title:'Out of scope',extract:'Uzbekistan',coordinates:[{lat:0,lon:0}]},
    {pageid:30,title:'A person',description:'Footballer born in Uzbekistan',extract:'A person in Uzbekistan.',coordinates:[{lat:41,lon:60}]},
  ]}});}) as typeof fetch;
  const places=await lookupWikipedia({position:{lat:42.46023456,lng:59.61024356}},fetcher);
  assert.equal(places.length,1);assert.equal(places[0].id,'wiki-10');assert.equal(places[0].provenance,'web-cache');
  assert.ok(places[0].sources[0].license?.includes('CC BY-SA'));
  assert.ok(requested.includes('42.460'));assert.ok(!requested.includes('46023456'));
});
