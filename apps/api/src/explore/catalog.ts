import fs from 'node:fs';
import { z } from 'zod';
import { catalog } from '../planner/catalog.js';
import { readWebCache } from './web-source.js';
import { distanceKm, explorePlaceSchema, type ExplorePlace, type Position } from './types.js';

const seed=z.array(explorePlaceSchema).parse(JSON.parse(fs.readFileSync(new URL('../../data/explore-places.json',import.meta.url),'utf8')));
const visualRecords=z.array(z.object({slug:z.string(),visualCues:z.array(z.string()),historicalFacts:z.array(z.string()),architecturalDetails:z.array(z.string())})).parse(JSON.parse(fs.readFileSync(new URL('../../data/ichan-qala-landmarks.json',import.meta.url),'utf8')));
export const visualHints=new Map(visualRecords.map(place=>[place.slug,place.visualCues]));
const pilotFacts=new Map(visualRecords.map(place=>[place.slug,[...place.historicalFacts.slice(0,3),...place.architecturalDetails.slice(0,3)]]));
const authored:ExplorePlace[]=catalog.places.map(p=>({id:p.id,name:p.name.en,aliases:[...new Set([p.name.en,p.name.ru,p.name.uz,p.id.replace(/-/g,' ')])],cityId:p.city,
  kind:'place',lat:p.lat,lng:p.lng,facts:[p.story.en,...(p.history?[p.history.en]:[]),...(pilotFacts.get(p.id)??[])],
  sources:[{title:'Uzbekistan Travel / authored catalog',url:p.source}],provenance:'local-catalog',fetchedAt:'2026-11-26T00:00:00.000Z'}));
export async function allExplorePlaces():Promise<ExplorePlace[]> {
  return [...new Map([...seed,...authored,...await readWebCache()].map(p=>[p.id,p])).values()];
}
export function nearbyPlaces(places:ExplorePlace[],position:Position,limit=8) {
  return places.filter(p=>p.kind==='place').map(p=>({...p,distanceKm:Math.round(distanceKm(position,p)*10)/10}))
    .filter(p=>p.distanceKm<=50).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,limit);
}
export function matchPlaces(places:ExplorePlace[],question:string) {
  const q=question.toLocaleLowerCase();
  return places.filter(p=>[p.name,...p.aliases].some(alias=>alias.toLocaleLowerCase().split(/[\s-]+/).some(token=>token.length>=5&&q.includes(token)))).slice(0,5);
}
export function resolvePosition(cityId?:string,position?:Position) {
  const city=catalog.cities.find(c=>c.id===cityId);
  return position??(city?{lat:city.lat,lng:city.lng}:undefined);
}
