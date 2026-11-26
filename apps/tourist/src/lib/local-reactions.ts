export type LocalReaction='interesting'|'ordinary';
export function appendLocalReaction(raw:string|null,reaction:LocalReaction,cityId:string,placeId?:string) {
  let previous:unknown=[];try{previous=JSON.parse(raw??'[]');}catch{}
  const safe=Array.isArray(previous)?previous.filter(item=>item&&['interesting','ordinary'].includes(item.reaction)&&typeof item.cityId==='string'&&typeof item.createdAt==='string')
    .slice(-49).map(item=>({reaction:item.reaction,cityId:item.cityId.slice(0,100),placeId:typeof item.placeId==='string'?item.placeId.slice(0,100):undefined,createdAt:item.createdAt.slice(0,30)})):[];
  return JSON.stringify([...safe,{reaction,cityId:cityId.slice(0,100),placeId:placeId?.slice(0,100),createdAt:new Date().toISOString()}]);
}
