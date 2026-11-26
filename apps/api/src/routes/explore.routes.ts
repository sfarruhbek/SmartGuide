import { Router } from 'express';
import { z } from 'zod';
import { allExplorePlaces, nearbyPlaces, resolvePosition } from '../explore/catalog.js';
import { exploreChat, exploreRequestSchema } from '../explore/chat.js';
import { aiLimit } from '../middleware/ai-limit.js';
import { resolveVisitor, reservePhoto, AccessError } from '../access/store.js';
import { privateAction } from '../middleware/private-action.js';

export const identifyPhotoSchema=z.object({
  cityId:z.string(),language:z.enum(['en','uz','ru','es','ja','ko']),
  question:z.string().trim().max(500).default('Describe this tourist photograph.'),
  imageBase64:z.string().min(4).max(300000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
  imageMimeType:z.literal('image/jpeg'),locationSource:z.enum(['map','gps']),
  location:z.object({lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),accuracy:z.number().nonnegative().max(100000).optional()}).optional(),
}).strict().pipe(exploreRequestSchema);

export const exploreRouter=Router();
exploreRouter.post('/identify',privateAction,aiLimit,async(req,res)=>{
  const input=identifyPhotoSchema.safeParse(req.body);
  if(!input.success){res.status(400).json({error:'Choose a photo and valid city context.'});return;}
  res.setHeader('Cache-Control','no-store');
  let refund:(()=>Promise<void>)|undefined;
  try{refund=await reservePhoto(await resolveVisitor(req,res),input.data.imageBase64!);res.json(await exploreChat(input.data));}
  catch(error){await refund?.();res.status(error instanceof AccessError?error.status:503).json({code:error instanceof AccessError?error.code:'PHOTO_UNAVAILABLE',error:error instanceof AccessError?error.code:'The photo guide is temporarily unavailable.'});}
});
exploreRouter.get('/places',async(req,res)=>{
  const query=z.object({cityId:z.string().optional(),lat:z.coerce.number().min(-90).max(90).optional(),lng:z.coerce.number().min(-180).max(180).optional()}).superRefine((q,ctx)=>{
    if((q.lat===undefined)!==(q.lng===undefined))ctx.addIssue({code:'custom',message:'Both coordinates required'});
  }).safeParse(req.query);
  if(!query.success){res.status(400).json({error:'Invalid map context'});return;}
  const position=resolvePosition(query.data.cityId,query.data.lat!==undefined&&query.data.lng!==undefined?{lat:query.data.lat,lng:query.data.lng}:undefined);
  const places=await allExplorePlaces();
  res.json({places:position?nearbyPlaces(places,position,30):places.filter(p=>p.kind==='place').slice(0,150),areas:places.filter(p=>p.kind==='area')});
});
