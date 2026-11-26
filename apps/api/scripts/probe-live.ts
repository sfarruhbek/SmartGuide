import { GoogleGenAI, Modality } from '@google/genai';
import { env } from '../src/config/env.js';

const client=new GoogleGenAI({apiKey:env.GEMINI_API_KEY,httpOptions:{apiVersion:'v1beta'}});
for(const model of ['gemini-3.8-live','gemini-3.1-flash-live-preview','gemini-2.5-flash-native-audio-latest']){
  let audioBytes=0;
  let finish:()=>void=()=>{};
  const done=new Promise<void>(resolve=>{finish=resolve;});
  const timer=setTimeout(finish,12000);
  let connection:Awaited<ReturnType<typeof client.live.connect>>|undefined;
  let closedCode:number|undefined;
  try{
    connection=await client.live.connect({model,config:{responseModalities:[Modality.AUDIO],outputAudioTranscription:{},
      speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}},systemInstruction:'Speak Russian. Be concise.'},
      callbacks:{onmessage(message){for(const part of message.serverContent?.modelTurn?.parts??[]){if(part.inlineData?.data){audioBytes+=Buffer.from(part.inlineData.data,'base64').length;finish();}}},onerror(){finish();},onclose(event){closedCode=event.code;finish();}}});
    connection.sendRealtimeInput({text:'Скажи: Здравствуйте, я ваш помощник в Узбекистане.'});
    await done;
    console.log(JSON.stringify({model,connected:true,audioBytes,closedCode}));
  }catch{console.log(JSON.stringify({model,connected:false,audioBytes,closedCode}));}
  finally{clearTimeout(timer);connection?.close();}
}
