import { Router } from 'express';
import { accessState, resolveVisitor } from '../access/store.js';
export const accessRouter=Router();
accessRouter.get('/',async(req,res)=>{res.setHeader('Cache-Control','no-store');try{res.json(await accessState(await resolveVisitor(req,res)));}catch{res.status(503).json({error:'ACCESS_UNAVAILABLE'});}});
