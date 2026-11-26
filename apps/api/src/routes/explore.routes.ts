import { Router } from 'express';
import { z } from 'zod';
import { allExplorePlaces, nearbyPlaces, resolvePosition } from '../explore/catalog.js';

export const exploreRouter=Router();
exploreRouter.get('/places',async(req,res)=>{
  const query=z.object({cityId:z.string().optional(),lat:z.coerce.number().min(-90).max(90).optional(),lng:z.coerce.number().min(-180).max(180).optional()}).superRefine((q,ctx)=>{
    if((q.lat===undefined)!==(q.lng===undefined))ctx.addIssue({code:'custom',message:'Both coordinates required'});
  }).safeParse(req.query);
  if(!query.success){res.status(400).json({error:'Invalid map context'});return;}
  const position=resolvePosition(query.data.cityId,query.data.lat!==undefined&&query.data.lng!==undefined?{lat:query.data.lat,lng:query.data.lng}:undefined);
  const places=await allExplorePlaces();
  res.json({places:position?nearbyPlaces(places,position,30):places.filter(p=>p.kind==='place').slice(0,150),areas:places.filter(p=>p.kind==='area')});
});
