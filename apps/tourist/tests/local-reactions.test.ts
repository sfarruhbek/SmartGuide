import test from 'node:test';
import assert from 'node:assert/strict';
import { appendLocalReaction } from '../src/lib/local-reactions';
test('local reactions retain bounded public context without transcripts, photos or GPS',()=>{
  const previous=JSON.stringify(Array.from({length:80},()=>({reaction:'interesting',cityId:'khiva',createdAt:'2026-11-26',answer:'private transcript',lat:41,imageBase64:'private photo'})));
  const result=JSON.parse(appendLocalReaction(previous,'ordinary','samarkand','registan'));
  assert.equal(result.length,50);assert.equal(result.at(-1).reaction,'ordinary');
  assert.ok(!JSON.stringify(result).includes('private'));assert.ok(result.every((item:Record<string,unknown>)=>!('lat'in item)));
  assert.equal(JSON.parse(appendLocalReaction('invalid','interesting','bukhara')).length,1);
});
