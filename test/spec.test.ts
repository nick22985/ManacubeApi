import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { endpoints } from '../src/endpoints';

test('the client covers exactly the endpoints in spec/openapi.json', () => {
	const spec = JSON.parse(readFileSync(new URL('../spec/openapi.json', import.meta.url), 'utf8'));
	const inSpec = Object.entries(spec.paths as Record<string, object>)
		.flatMap(([path, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${path.replace(/^\/api/, '')}`))
		.sort();
	expect(Object.values(endpoints).sort()).toEqual(inSpec);
});
