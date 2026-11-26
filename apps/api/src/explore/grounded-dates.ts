const years=(text:string)=>[...text.matchAll(/(?<!\d)(1\d{3}|20\d{2})(?!\d)/g)].map(match=>Number(match[1]));
const roman=(text:string)=>{const values:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let result=0;for(let i=0;i<text.length;i++){const current=values[text[i]]??0,next=values[text[i+1]]??0;result+=current<next?-current:current;}return result;};
const centuries=(text:string)=>[...text.matchAll(/\b([IVXLCDM]+|\d{1,2})(?:st|nd|rd|th)?\s*(?:век[а-я]*|centur[a-z]*|asr[a-z]*|siglo|世紀|세기)/gi)].map(match=>/^\d/.test(match[1])?Number(match[1]):roman(match[1].toUpperCase()));
/** Rejects invented years/centuries; this is a narrow guard, not a historical fact checker. */
export function assertGroundedDates(answer:string,facts:string[]) {
  const evidence=facts.join('\n'),allowedYears=new Set(years(evidence));
  const allowedCenturies=new Set([...centuries(evidence),...[...allowedYears].map(year=>Math.ceil(year/100))]);
  if(years(answer).some(year=>!allowedYears.has(year))||centuries(answer).some(century=>!allowedCenturies.has(century)))throw new Error('Historical date absent from source records');
}
