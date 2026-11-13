import { writeFile } from 'node:fs/promises';

const url = process.argv[2] ?? 'https://api.manacube.com/v3/api-docs';
const response = await fetch(url);
if (!response.ok) throw new Error(`GET ${url} responded ${response.status}`);
const spec = await response.json();
await writeFile(new URL('../spec/openapi.json', import.meta.url), `${JSON.stringify(spec, null, '\t')}\n`);
console.log(`Wrote spec/openapi.json (${Object.keys(spec.paths).length} paths)`);
