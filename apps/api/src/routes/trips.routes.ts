import { Router } from 'express';
import { aiLimit } from '../middleware/ai-limit.js';
import { tripInputSchema } from '../planner/catalog.js';
import { planTrip } from '../planner/service.js';
import { composeTravel, composeSchema } from '../planner/interactive.js';
import { resolveVisitor, workspaceState, reserveUse, AccessError } from '../access/store.js';
import { privateAction } from '../middleware/private-action.js';

export const tripsRouter = Router();
tripsRouter.get('/current',async(req,res)=>{res.setHeader('Cache-Control','no-store');try{res.json(await workspaceState(await resolveVisitor(req,res)));}catch{res.status(503).json({error:'TRIP_UNAVAILABLE'});}});
tripsRouter.post('/compose',privateAction,aiLimit,async(req,res)=>{
  const parsed=composeSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'INVALID_TRIP_INPUT'});return;}
  res.setHeader('Cache-Control','no-store');
  const controller=new AbortController();res.once('close',()=>{if(!res.writableEnded)controller.abort();});
  try{res.json(await composeTravel(await resolveVisitor(req,res),parsed.data,{signal:controller.signal}));}
  catch(error){res.status(error instanceof AccessError?error.status:503).json({error:error instanceof AccessError?error.code:'TRIP_AI_UNAVAILABLE'});}
});
tripsRouter.post('/generate', privateAction, aiLimit, async (req, res) => {
  const parsed = tripInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid trip preferences', details: parsed.error.flatten().fieldErrors });
    return;
  }
  let refund:(()=>Promise<void>)|undefined;
  try{refund=await reserveUse(await resolveVisitor(req,res),'plans');const result=await planTrip(parsed.data);if(result.source==='local-fallback')await refund();res.json(result);}
  catch(error){await refund?.();res.status(error instanceof AccessError?error.status:503).json({error:error instanceof AccessError?error.code:'TRIP_UNAVAILABLE'});}
});
