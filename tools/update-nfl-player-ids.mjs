import { writeFile } from 'node:fs/promises';
import { parseNflPlayerIds } from '../netlify/lib/csv.mjs';

const source = 'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv';
const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`nflverse players.csv: HTTP ${response.status}`);
const ids = parseNflPlayerIds(await response.text());
const target = new URL('../netlify/lib/nfl-player-ids.mjs', import.meta.url);
const entries = ids.map(([espn, gsis]) => `  [${JSON.stringify(espn)}, ${JSON.stringify(gsis)}]`).join(',\n');
await writeFile(target, `// Generated from nflverse players.csv; refresh with node tools/update-nfl-player-ids.mjs.\nexport const NFL_PLAYER_IDS = new Map([\n${entries}\n]);\n`);
console.log(`NFL player ID map updated: ${ids.length} recent players.`);
