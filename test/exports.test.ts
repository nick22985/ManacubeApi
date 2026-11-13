import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const check = `
	if (typeof ManaCubeApi !== 'function' || typeof guildSchema?.parse !== 'function') process.exit(1);
	const api = new ManaCubeApi({ fetch: async () => new Response('[]') });
	api.patrons.uuids().then((r) => { if (!Array.isArray(r)) process.exit(1); console.log('ok'); });
`;

describe.skipIf(!existsSync(dist))('built package', () => {
	test('ESM import', () => {
		const code = `import { ManaCubeApi, guildSchema } from ${JSON.stringify(`${dist}index.js`)};${check}`;
		expect(execFileSync('node', ['--input-type=module', '-e', code], { encoding: 'utf8' }).trim()).toBe('ok');
	});

	test('CommonJS require', () => {
		const code = `const { ManaCubeApi, guildSchema } = require(${JSON.stringify(`${dist}index.cjs`)});${check}`;
		expect(execFileSync('node', ['-e', code], { encoding: 'utf8' }).trim()).toBe('ok');
	});
});
