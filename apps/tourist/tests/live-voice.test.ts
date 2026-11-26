import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { decodePcm, encodePcm, parseVoiceReference } from '../src/lib/live-voice';

test('voice PCM preserves little-endian samples and rejects malformed chunks',()=>{
  const samples=new Int16Array([-32768,-1000,0,1000,32767]);
  const decoded=decodePcm(encodePcm(samples.buffer));
  assert.equal(decoded.length,5);assert.equal(decoded[0],-1);assert.equal(decoded[2],0);
  assert.ok(Math.abs(decoded[3]-1000/32768)<.000001);
  assert.throws(()=>decodePcm(btoa('x')));
});
test('microphone worklet downsamples 48 kHz to 16 kHz in bounded 100 ms chunks',()=>{
  let Processor:any;const chunks:ArrayBuffer[]=[];
  class Worklet {port={postMessage:(buffer:ArrayBuffer)=>chunks.push(buffer)};}
  runInNewContext(readFileSync(new URL('../public/voice-capture-v1.js',import.meta.url),'utf8'),{
    sampleRate:48000,AudioWorkletProcessor:Worklet,registerProcessor:(_name:string,constructor:any)=>{Processor=constructor;},
  });
  const capture=new Processor();
  const output=[new Float32Array(128).fill(1)];
  for(let i=0;i<75;i++)capture.process([[new Float32Array(128).fill(.5)]],[output]);
  assert.equal(chunks.length,2);assert.equal(chunks[0].byteLength,3200);
  const pcm=new DataView(chunks[0]);assert.ok(Math.abs(pcm.getInt16(0,true)-16384)<=1);
  assert.ok(output[0].every(sample=>sample===0));
});
test('voice references accept sourced places and reject unsafe source URLs or invalid coordinates',()=>{
  const reference={nearby:[{id:'registan',name:'Registan',lat:39.65,lng:66.97}],focusPlace:null,
    sources:[{placeId:'registan',name:'Registan',provenance:'local-catalog',links:[{title:'Source',url:'https://uzbekistan.travel/'}]}],webRecordsAdded:0};
  assert.deepEqual(parseVoiceReference(reference),reference);
  assert.throws(()=>parseVoiceReference({...reference,nearby:[{...reference.nearby[0],lat:100}]}));
  assert.throws(()=>parseVoiceReference({...reference,sources:[{...reference.sources[0],links:[{title:'Unsafe',url:'javascript:alert(1)'}]}]}));
});
