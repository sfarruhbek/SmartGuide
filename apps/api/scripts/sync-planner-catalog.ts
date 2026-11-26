import { writeFileSync } from 'node:fs';
import { CITIES, PLACES } from '../../tourist/src/lib/places.ts';

writeFileSync(new URL('../data/planner-catalog.json', import.meta.url), JSON.stringify({ cities: CITIES, places: PLACES }, null, 2) + '\n');
console.log(`Synced ${CITIES.length} cities and ${PLACES.length} places from the authored frontend catalog.`);
