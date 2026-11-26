import { z } from 'zod';

export const positionSchema = z.object({ lat:z.number().min(-90).max(90), lng:z.number().min(-180).max(180) });
export const explorePlaceSchema = positionSchema.extend({
  id:z.string().min(1).max(100), name:z.string().min(1).max(200), cityId:z.string().max(100).optional(),
  aliases:z.array(z.string().max(200)).max(12).default([]),
  kind:z.enum(['place','area']), facts:z.array(z.string().max(2000)).min(1).max(8),
  sources:z.array(z.object({title:z.string().max(200),url:z.string().url().refine(url=>new URL(url).protocol==='https:'),license:z.string().optional()})).min(1).max(4),
  provenance:z.enum(['local-catalog','web-cache']), fetchedAt:z.string().datetime(),
});
export type ExplorePlace = z.infer<typeof explorePlaceSchema>;
export type Position = z.infer<typeof positionSchema>;
export const distanceKm = (a:Position,b:Position) => {
  const r=Math.PI/180, q=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(q),Math.sqrt(Math.max(0,1-q)));
};
export const inUzbekistanBounds = (p:Position) => p.lat>=37 && p.lat<=46 && p.lng>=55 && p.lng<=74;
