import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSnapResult } from '../src/lib/snap-api';
import { readJourneyNavigation, journeyUrl } from '../src/lib/journey-navigation';
import { CITIES, PLACES } from '../src/lib/places';

test('Snap rejects fabricated response shapes and preserves explicit uncertainty',()=>{
  const valid={answer:'The photograph is not clear enough to identify confidently.',photo:{status:'unknown',observation:'A tiled wall'},nearby:[],focusPlace:null,sources:[],webRecordsAdded:0};
  assert.equal(parseSnapResult(valid).photo?.status,'unknown');
  for(const patch of [{answer:''},{answer:42},{photo:{status:'verified',observation:'Not a certainty'}},{nearby:[{id:'x',name:'X',lat:200,lng:66}]},{nearby:[{id:'x',name:'X',lat:39,lng:66,facts:[{}]}]}])assert.throws(()=>parseSnapResult({...valid,...patch}));
});

test('all Stitch hub sections survive URL restoration without inventing a paid state',()=>{
  for(const view of ['plan','itinerary','map','snap','guide','pass','auth'] as const){
    const route=readJourneyNavigation(`view=${view}&city=samarkand`,CITIES,PLACES);
    assert.equal(route.view,view);
    const url=journeyUrl(new URL('https://example.test/?lang=ru'),route,PLACES);
    assert.equal(readJourneyNavigation(url.split('?')[1],CITIES,PLACES).view,view);
    assert.ok(!url.includes('paid'));
  }
});
