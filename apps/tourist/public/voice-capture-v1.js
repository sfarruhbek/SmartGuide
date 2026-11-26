// Microphone PCM resampling to Gemini Live's 16 kHz mono input. No recording or persistence.
class SmartGuideCapture extends AudioWorkletProcessor {
  constructor() { super(); this.ratio=sampleRate/16000; this.phase=0; this.sum=0; this.count=0; this.samples=[]; }
  process(inputs,outputs) {
    const channel=inputs[0]?.[0];
    if(channel)for(const value of channel){
      this.sum+=value;this.count++;this.phase++;
      if(this.phase>=this.ratio){
        const sample=Math.max(-1,Math.min(1,this.sum/this.count));
        this.samples.push(Math.round(sample*(sample<0?32768:32767)));
        this.phase-=this.ratio;this.sum=0;this.count=0;
        if(this.samples.length===1600){const pcm=new Int16Array(this.samples);this.port.postMessage(pcm.buffer,[pcm.buffer]);this.samples=[];}
      }
    }
    for(const output of outputs)for(const channel of output)channel.fill(0);
    return true;
  }
}
registerProcessor('smartguide-capture',SmartGuideCapture);
