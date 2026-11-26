import fs from 'node:fs/promises';
import { lookupWikipedia } from '../src/explore/web-source.js';
import { distanceKm, type ExplorePlace } from '../src/explore/types.js';

const catalog=JSON.parse(await fs.readFile(new URL('../data/planner-catalog.json',import.meta.url),'utf8')) as {cities:{id:string;name:{en:string;ru:string;uz:string};lat:number;lng:number}[]};
const pages=await lookupWikipedia({titles:catalog.cities.map(c=>c.id==='gulistan'?'Guliston':c.name.en)});
const records:ExplorePlace[]=pages.flatMap(page=>{
  const city=[...catalog.cities].sort((a,b)=>distanceKm(page,a)-distanceKm(page,b))[0];
  if(distanceKm(page,city)>30)return [];
  return [{...page,id:`area-${city.id}`,cityId:city.id,kind:'area',provenance:'local-catalog',aliases:[city.name.en,city.name.ru,city.name.uz]}];
});
const queries=['Khudayar Khan Palace','Karakalpakstan Museum of Arts','Ak-Saray Palace','Fayaz Tepe','Rabati Malik','Kok Gumbaz Qarshi','Khoja Amin Namangan','Yodgorlik Margilan'];
for(let i=0;i<queries.length;i+=2){
  const results=await Promise.all(queries.slice(i,i+2).map(query=>lookupWikipedia({query}).catch(()=>[])));
  for(const places of results)for(const place of places){
    if(records.some(p=>p.name===place.name))continue;
    const city=[...catalog.cities].sort((a,b)=>distanceKm(place,a)-distanceKm(place,b))[0];
    records.push({...place,cityId:city.id,provenance:'local-catalog'});
  }
}
// Short, paraphrased entries with coordinates published by the national tourism portal.
records.push(
  {id:'devonaboy',name:'Devonaboy Mosque',cityId:'andijan',aliases:['Девонабой','Деванабой','Devonaboy'],kind:'place',lat:40+47/60+17.2812/3600,lng:72+20/60+26.3186/3600,
    facts:['The national tourism portal lists Devonaboy as a central mosque in Andijan, used for Friday and Eid prayers.'],sources:[{title:'Uzbekistan Travel — Andijon viloyati',url:'https://uzbekistan.travel/uz/o/andijon-viloyati/'}],provenance:'local-catalog',fetchedAt:new Date().toISOString()},
  {id:'qassoblik',name:'Qassoblik Mosque (Oqmachit)',cityId:'jizzakh',aliases:['Кассоблик','Окмачит','Qassoblik','Oqmachit'],kind:'place',lat:40+8/60+45.6231/3600,lng:67+49/60+22.9253/3600,
    facts:['The national tourism portal lists Qassoblik Mosque, also called Oqmachit, on Sharof Rashidov Street in Jizzakh.'],sources:[{title:'Uzbekistan Travel — Jizzax viloyati',url:'https://uzbekistan.travel/uz/o/jizzax-viloyati/'}],provenance:'local-catalog',fetchedAt:new Date().toISOString()},
  {id:'podshohpirim-fergana',name:'Amir Xizr Valiy Podshohpirim',cityId:'fergana',aliases:['Подшохпирим','Podshohpirim','Amir Xizr Valiy'],kind:'place',lat:40+24/60+46.944/3600,lng:71+45/60+15.6694/3600,
    facts:['The national tourism portal lists this shrine in the Yormozor neighbourhood of Fergana. Accounts about the person buried here are attributed traditions and require historical review.'],sources:[{title:'Uzbekistan Travel — Fargʻona viloyati',url:'https://uzbekistan.travel/uz/o/fargona-viloyati/'}],provenance:'local-catalog',fetchedAt:new Date().toISOString()},
  {id:'puri-siddiq',name:'Puri Siddiq (Kaptarxona)',cityId:'margilan',aliases:['Пир Сиддик','Пури Сиддик','Puri Siddiq','Kaptarxona'],kind:'place',lat:40+28/60+58.2963/3600,lng:71+44/60+34.985/3600,
    facts:['The national tourism portal describes a complex in Margilan with a mausoleum, mosque and dovecote. The dovecote and mosque are described as dating from the second half of the nineteenth century.'],sources:[{title:'Uzbekistan Travel — Fargʻona viloyati',url:'https://uzbekistan.travel/uz/o/fargona-viloyati/'}],provenance:'local-catalog',fetchedAt:new Date().toISOString()},
  {id:'kok-gumbaz-karshi',name:'Kok Gumbaz Mosque, Qarshi',cityId:'karshi',aliases:['Кок Гумбаз Карши','Кук Гумбаз','Koʻkgumbaz Qarshi'],kind:'place',lat:38+51/60+49.53/3600,lng:65+47/60+29.4/3600,
    facts:['The national tourism portal lists Kok Gumbaz Mosque on Nasaf Street in Qarshi and attributes its commission to Abdullakhan II based on an inscription.'],sources:[{title:'Uzbekistan Travel — Qashqadaryo viloyati',url:'https://uzbekistan.travel/uz/o/qashqadaryo-viloyati/'}],provenance:'local-catalog',fetchedAt:new Date().toISOString()},
);
const unique=[...new Map(records.map(p=>[p.id,p])).values()];
await fs.writeFile(new URL('../data/explore-places.json',import.meta.url),JSON.stringify(unique,null,2)+'\n');
console.log(JSON.stringify({records:unique.length,cities:unique.filter(p=>p.kind==='area').map(p=>p.cityId),places:unique.filter(p=>p.kind==='place').map(p=>p.name)},null,2));
