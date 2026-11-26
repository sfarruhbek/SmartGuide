import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { enrichFromWeb } from '../src/explore/web-source.js';

const places=await enrichFromWeb({query:'Ark of Bukhara'});
assert.ok(places.some(p=>/Ark/i.test(p.name)),'Expected a public-source match');
const stored=JSON.parse(await readFile(new URL('../data/cache/explore-web.json',import.meta.url),'utf8')) as {id:string;name:string;sources:{url:string}[]}[];
assert.ok(stored.some(p=>places.some(record=>record.id===p.id)));
console.log(JSON.stringify({savedPublicRecords:places.map(p=>({id:p.id,name:p.name,url:p.sources[0].url})),persisted:true},null,2));
