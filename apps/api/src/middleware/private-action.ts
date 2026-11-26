import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
/** Cookie-backed actions accept JSON from configured app origins, never cross-site forms. */
export const privateAction:RequestHandler=(req,res,next)=>{
  if((req.headers.origin&&!env.corsOrigins.includes(req.headers.origin))||req.headers['sec-fetch-site']==='cross-site'){res.status(403).json({error:'ORIGIN_REJECTED'});return;}
  if(!req.is('application/json')){res.status(415).json({error:'JSON_REQUIRED'});return;}
  next();
};
