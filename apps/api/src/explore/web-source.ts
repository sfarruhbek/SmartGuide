import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { z } from 'zod';
import { explorePlaceSchema, inUzbekistanBounds, type ExplorePlace, type Position } from './types.js';

const wikiPageSchema=z.object({pageid:z.number().int().positive(),title:z.string(),extract:z.string().optional(),
  coordinates:z.array(z.object({lat:z.number(),lon:z.number()})).optional(),
  description:z.string().optional(), missing:z.boolean().optional()}).passthrough();
const pageResponseSchema=z.object({query:z.object({pages:z.array(wikiPageSchema)}).optional()});
const CACHE_PATH=new URL('../../data/cache/explore-web.json',import.meta.url);
const TTL=30*24*60*60*1000;
let cached:ExplorePlace[]|null=null;
let loading:Promise<ExplorePlace[]>|null=null;
let saveChain=Promise.resolve();
const activeLookups=new Map<string,Promise<ExplorePlace[]>>();
const recent=new Map<string,{until:number;places:ExplorePlace[]}>();

export async function readWebCache():Promise<ExplorePlace[]> {
  if(cached)return cached=cached.filter(p=>Date.now()-Date.parse(p.fetchedAt)<TTL);
  if(loading)return loading;
  loading=(async()=>{
    try { cached=z.array(explorePlaceSchema).parse(JSON.parse(await fs.readFile(CACHE_PATH,'utf8')))
      .filter(p=>p.provenance==='web-cache'&&Date.now()-Date.parse(p.fetchedAt)<TTL).slice(-150); }
    catch {cached=[];}
    return cached;
  })();
  try{return await loading;}finally{loading=null;}
}
export async function rememberWebPlaces(places:ExplorePlace[]) {
  await readWebCache();
  const existing=cached??[];
  const records=new Map([...existing,...places].map(p=>[p.id,p]));
  cached=[...records.values()].slice(-150);
  const snapshot=JSON.stringify(cached,null,2)+'\n';
  saveChain=saveChain.catch(()=>undefined).then(async()=>{
    await fs.mkdir(path.dirname(fileURLToPath(CACHE_PATH)),{recursive:true});
    const temp=new URL('./explore-web.tmp',CACHE_PATH);
    await fs.writeFile(temp,snapshot); await fs.rename(temp,CACHE_PATH);
  });
  // Read-only hosting still supports this request and an in-memory cache.
  await saveChain.catch(()=>undefined);
}

async function wikiQuery(params:Record<string,string>,fetcher:typeof fetch=fetch) {
  const url=new URL('https://en.wikipedia.org/w/api.php');
  url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',redirects:'1',...params}).toString();
  const response=await fetcher(url,{headers:{'User-Agent':'SmartGuide/1.0 (https://github.com/sfarruhbek/SmartGuide)'},signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw new Error('Public source unavailable');
  return pageResponseSchema.parse(await response.json()).query?.pages??[];
}

export async function lookupWikipedia(params:{query?:string;position?:Position;titles?:string[]},fetcher:typeof fetch=fetch):Promise<ExplorePlace[]> {
  const properties={prop:'extracts|coordinates|description',exintro:'1',explaintext:'1',exsentences:'3',exlimit:'max',colimit:'max',coprimary:'primary'};
  const search:Record<string,string>|null=params.titles?{titles:params.titles.slice(0,30).join('|')}:params.query?
    {generator:'search',gsrsearch:`${params.query.slice(0,160)} Uzbekistan`,gsrlimit:'3',gsrnamespace:'0'}:
    params.position?{generator:'geosearch',ggscoord:`${params.position.lat.toFixed(3)}|${params.position.lng.toFixed(3)}`,ggsradius:'10000',ggslimit:'6',ggsnamespace:'0'}:null;
  if(!search)return [];
  const pages=await wikiQuery({...properties,...search},fetcher);
  return pages.flatMap(page=>{
    const coord=page.coordinates?.[0],text=(page.extract??'').replace(/\s+/g,' ').trim();
    if(page.title==='Uzbekistan')return [];
    if(page.missing||!coord||!text||!inUzbekistanBounds({lat:coord.lat,lng:coord.lon})||
      !/Uzbekistan|Uzbek/i.test(text+' '+(page.description??''))|| /\b(born|politician|footballer|singer)\b/i.test(page.description??''))return [];
    // Short attributed excerpts, not full pages. Wikipedia's license remains attached.
    const fact=text.split(/\s+/).slice(0,85).join(' ');
    const kind=/^(city|town|capital|district-level city|regional city)\b/i.test(page.description??'')?'area':'place';
    return [explorePlaceSchema.parse({id:`wiki-${page.pageid}`,name:page.title,aliases:[page.title],kind,lat:coord.lat,lng:coord.lon,
      facts:[fact],sources:[{title:`Wikipedia: ${page.title}`,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,license:'CC BY-SA; source attribution and revision history at linked page'}],
      provenance:'web-cache',fetchedAt:new Date().toISOString()})];
  });
}

export async function enrichFromWeb(params:{query?:string;position?:Position}) {
  const key=params.query?`q:${params.query.toLowerCase().slice(0,160)}`:`g:${params.position?.lat.toFixed(2)},${params.position?.lng.toFixed(2)}`;
  const hit=recent.get(key);if(hit&&hit.until>Date.now())return hit.places;
  if(activeLookups.has(key))return activeLookups.get(key)!;
  const promise=(async()=>{
    const places=await lookupWikipedia(params).catch(()=>[]);
    if(places.length)await rememberWebPlaces(places);
    if(recent.size>150)recent.clear();
    recent.set(key,{places,until:Date.now()+300_000});return places;
  })();
  activeLookups.set(key,promise);
  try{return await promise;}finally{activeLookups.delete(key);}
}
