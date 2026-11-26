import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { WebSocket } from 'ws';
import { generateSpeech } from '../src/ai/providers.js';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const args=process.argv.slice(2).filter(arg=>!arg.startsWith('--'));
const base=args[0]??'http://127.0.0.1:4001';
const sharp=createRequire(import.meta.url)('sharp') as (path:string)=>{jpeg:()=>{toBuffer:()=>Promise<Buffer>}};
const photoBytes=args[1]?readFileSync(args[1]):await sharp(fileURLToPath(new URL('../../tourist/public/cities/samarkand.webp',import.meta.url))).jpeg().toBuffer();
let inputPcm:Buffer|null=null;
if(process.argv.includes('--audio')){
  const wav=Buffer.from((await generateSpeech('Что интересного рядом в Самарканде? Расскажи кратко.','ru')).value.audioBase64,'base64');
  const rate=wav.readUInt32LE(24);let offset=12,dataStart=0,dataSize=0;
  while(offset+8<=wav.length){const name=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4);if(name==='data'){dataStart=offset+8;dataSize=size;break;}offset+=8+size+(size%2);}
  assert.ok(dataStart);const samples=Math.floor(dataSize/2*16000/rate);inputPcm=Buffer.alloc(samples*2);
  for(let i=0;i<samples;i++)inputPcm.writeInt16LE(wav.readInt16LE(dataStart+Math.floor(i*rate/16000)*2),i*2);
}
const context={cityId:'samarkand',language:'ru',locationSource:'map'};
const grantResponse=await fetch(base+'/api/explore/live/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(context)});
assert.equal(grantResponse.status,200);const grant=await grantResponse.json() as {token:string};
const url=new URL(base);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.pathname='/api/explore/live';
const ws=new WebSocket(url,['smartguide-live',grant.token]);
let model='',audioBytes=0,sourceEvents=0,photoAccepted=false,phase='welcome',interrupted=false;
let photoAudioStart=0,photoTranscriptStart=0;
const transcripts:string[]=[];
let userTranscriptChars=0;
let resolveTest:()=>void=()=>{},rejectTest:(error:Error)=>void=()=>{};
const done=new Promise<void>((resolve,reject)=>{resolveTest=resolve;rejectTest=reject;});
const deadline=setTimeout(()=>rejectTest(new Error('Live check timed out')),150_000);
const send=(value:unknown)=>ws.send(JSON.stringify(value));
ws.on('error',()=>rejectTest(new Error('WebSocket failed')));
ws.on('message',raw=>{
  const data=JSON.parse(raw.toString());
  if(process.argv.includes('--verbose')&&!['audio','transcript'].includes(data.type))console.log(JSON.stringify({event:data.type,phase,code:data.code}));
  if(data.type==='error')rejectTest(new Error('Live service error'));
  if(data.type==='ready')model=data.model;
  if(data.type==='audio'){
    audioBytes+=Buffer.from(data.data,'base64').length;
    if(phase==='photo'&&photoAccepted&&audioBytes-photoAudioStart>48000&&transcripts.join('').length-photoTranscriptStart>20){phase='finished';resolveTest();}
  }
  if(data.type==='transcript'&&data.role==='assistant')transcripts.push(data.text);
  if(data.type==='transcript'&&data.role==='user')userTranscriptChars+=data.text.length;
  if(data.type==='interrupted')interrupted=true;
  if(data.type==='context'){
    sourceEvents++;
    assert.ok(Array.isArray(data.sources));
  }
  if(data.type==='photoAccepted')photoAccepted=true;
  if(data.type==='turnComplete'&&phase==='welcome'){
    phase='nearby';
    if(inputPcm){void(async()=>{for(let i=0;i<inputPcm!.length;i+=3200){send({type:'audio',data:inputPcm!.subarray(i,i+3200).toString('base64')});await new Promise(r=>setTimeout(r,100));}send({type:'mute'});})();}
    else send({type:'text',text:'Я в Самарканде. Какие исторические места есть рядом? Используй местные источники и расскажи кратко.'});
  }else if(data.type==='turnComplete'&&phase==='nearby'&&sourceEvents>0){
    phase='photo';photoAudioStart=audioBytes;photoTranscriptStart=transcripts.join('').length;send({type:'photo',data:photoBytes.toString('base64'),mimeType:'image/jpeg'});
  }else if(data.type==='turnComplete'&&phase==='photo'&&photoAccepted&&audioBytes>photoAudioStart&&transcripts.join('').length>photoTranscriptStart){
    phase='finished';resolveTest();
  }
});
try{
  await done;assert.ok(model);assert.ok(audioBytes>1000);assert.ok(sourceEvents>0);
  const report={checkedAt:new Date().toISOString(),model,audioBytes,sourceEvents,photoAccepted,interrupted,assistantTranscriptChars:transcripts.join('').length,
    inputAudioBytes:inputPcm?.length??0,userTranscriptChars,scope:'Real API WebSocket relay, Gemini streamed audio, photo and Groq tourism tool. Physical browser microphone/speaker check remains manual.'};
  if(process.argv.includes('--report'))writeFileSync(new URL('../../../documentation/LIVE_VOICE_CHECK_2026-11-26.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}catch{console.error(JSON.stringify({error:'Live voice check failed',phase,model,audioBytes,sourceEvents,photoAccepted,assistantTranscriptChars:transcripts.join('').length}));process.exitCode=1;}
finally{clearTimeout(deadline);ws.close();}
