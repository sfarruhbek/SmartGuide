import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { WebSocket } from 'ws';

test('Live WebSocket requires a short-lived one-use grant and the configured browser origin',async()=>{
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
    const response=await session(context);assert.equal(response.status,200);
    const grant=await response.json();assert.match(grant.token,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(grant).includes('server-only-test-key'));
    assert.equal(await connect(),false);
    assert.equal(await connect(grant.token,'https://unrelated.example'),false);
    assert.equal(await connect(grant.token),true);
    assert.equal(await connect(grant.token),false);
    assert.equal(connections,1);
  }finally{relay.close();server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();}
});
