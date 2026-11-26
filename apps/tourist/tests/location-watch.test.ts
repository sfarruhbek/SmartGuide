import test from 'node:test';
import assert from 'node:assert/strict';
import { startLocationWatch } from '../src/lib/location-watch';

const position = (lat=39.65) => ({coords:{latitude:lat,longitude:66.97,accuracy:15}} as GeolocationPosition);

test('stopping GPS clears its native watch and ignores already queued callbacks',()=>{
  let success!:PositionCallback;
  let failure!:PositionErrorCallback;
  const cleared:number[]=[];
  const points:unknown[]=[];
  let errors=0;
  const stop=startLocationWatch({watchPosition(onSuccess,onError,options){success=onSuccess;failure=onError!;assert.equal(options?.enableHighAccuracy,true);return 42;},clearWatch(id){cleared.push(id);}},p=>points.push(p),()=>errors++);
  success(position());
  assert.deepEqual(points,[{lat:39.65,lng:66.97,accuracy:15}]);
  stop();stop();
  success(position(41));failure({} as GeolocationPositionError);
  assert.deepEqual(cleared,[42]);assert.equal(points.length,1);assert.equal(errors,0);
});

test('invalid GPS and browser permission failures stop the watch instead of publishing a location',()=>{
  let success!:PositionCallback;
  let failure!:PositionErrorCallback;
  const cleared:number[]=[];let errors=0;
  startLocationWatch({watchPosition(onSuccess,onError){success=onSuccess;failure=onError!;return 7;},clearWatch(id){cleared.push(id);}},()=>assert.fail('Invalid GPS was published'),()=>errors++);
  success(position(95));failure({} as GeolocationPositionError);
  assert.deepEqual(cleared,[7]);assert.equal(errors,1);
  startLocationWatch({watchPosition(){throw new Error('Permission unavailable');},clearWatch(){assert.fail('No watch was created');}},()=>assert.fail(),()=>errors++);
  assert.equal(errors,2);
});
