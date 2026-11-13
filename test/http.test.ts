import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { z } from 'zod';
import { ManaCubeApi, ManaCubeApiError, ManaCubeError, ManaCubeRateLimitError, ManaCubeValidationError } from '../src';
import * as f from './fixtures';
import { mockClient, ok } from './helpers';

const tooMany = { status: 429, body: { message: 'Too many requests!' } };

afterEach(() => {
	vi.useRealTimers();
});

describe('errors', () => {
	test('non-2xx responses throw ManaCubeApiError with the parsed body', async () => {
		const { api } = mockClient({ '/svas/nope': { status: 404, body: f.notFoundGamemode } });
		const error = await api.svas.types('nope').catch((e) => e);
		expect(error).toBeInstanceOf(ManaCubeApiError);
		expect(error.status).toBe(404);
		expect(error.body.validGamemodes).toContain('survival');
		expect(error.message).toBe('ManaCube API 404: The requested gamemode could not be found');
	});

	test('network failures are wrapped with the cause', async () => {
		const cause = new TypeError('fetch failed');
		const api = new ManaCubeApi({ fetch: async () => Promise.reject(cause) });
		const error = await api.patrons.uuids().catch((e) => e);
		expect(error).toBeInstanceOf(ManaCubeError);
		expect(error.cause).toBe(cause);
	});

	test('a caller abort propagates unwrapped', async () => {
		const api = new ManaCubeApi({
			fetch: (_url, init) =>
				new Promise((_resolve, reject) => init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason))),
		});
		const controller = new AbortController();
		const pending = api.patrons.uuids({ signal: controller.signal });
		controller.abort(new Error('stop'));
		await expect(pending).rejects.toThrow('stop');
	});

	test('timeout aborts a slow request', async () => {
		const api = new ManaCubeApi({
			timeout: 20,
			fetch: (_url, init) =>
				new Promise((_resolve, reject) => init!.signal!.addEventListener('abort', () => reject(init!.signal!.reason))),
		});
		await expect(api.patrons.uuids()).rejects.toThrow(ManaCubeError);
	});
});

describe('response validation', () => {
	const bad = { '/patrons/patrons': ok([{ uuid: f.UUID }]) };

	test('strict throws', async () => {
		const { api } = mockClient(bad, { validation: 'strict' });
		const error = await api.patrons.patrons().catch((e) => e);
		expect(error).toBeInstanceOf(ManaCubeValidationError);
		expect(error.source).toBe('response');
		expect(error.message).toContain('GET /patrons/patrons');
	});

	test('warn logs and returns the data as received', async () => {
		const logger = { warn: vi.fn() };
		const { api } = mockClient(bad, { validation: 'warn', logger });
		expect(await api.patrons.patrons()).toEqual([{ uuid: f.UUID }]);
		expect(logger.warn).toHaveBeenCalledOnce();
	});

	test('warn logs each problem once, ignoring which array item it was in', async () => {
		const logger = { warn: vi.fn() };
		const { api } = mockClient(
			{ '/patrons/patrons': ok([{ uuid: f.UUID }, { uuid: f.UUID }]), '/patrons/patronsplus': ok([{ uuid: f.UUID }]) },
			{ validation: 'warn', logger },
		);
		await api.patrons.patrons();
		await api.patrons.patrons();
		expect(logger.warn).toHaveBeenCalledOnce();
		expect(logger.warn.mock.calls[0]![0]).not.toContain('1.name');
		await api.patrons.patronsPlus();
		expect(logger.warn).toHaveBeenCalledTimes(2);
	});

	test('off skips validation', async () => {
		const logger = { warn: vi.fn() };
		const { api } = mockClient(bad, { validation: 'off', logger });
		expect(await api.patrons.patrons()).toEqual([{ uuid: f.UUID }]);
		expect(logger.warn).not.toHaveBeenCalled();
	});

	test('unknown fields pass through', async () => {
		const { api } = mockClient({ '/guilds/top/1': ok([{ ...f.guild, newField: 1 }]) });
		expect((await api.guilds.top(1))[0]).toMatchObject({ newField: 1 });
	});
});

describe('rate limiting', () => {
	test('tracks x-rate-limit-remaining', async () => {
		const { api } = mockClient({ '/patrons/uuids': ok([], { 'x-rate-limit-remaining': '28' }) });
		await api.patrons.uuids();
		expect(api.rateLimit.remaining).toBe(28);
	});

	test('retries after Retry-After and succeeds', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient({
			'/patrons/uuids': [{ ...tooMany, headers: { 'retry-after': '2' } }, ok([f.UUID])],
		});
		const pending = api.patrons.uuids();
		await vi.advanceTimersByTimeAsync(1999);
		expect(calls).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		expect(await pending).toEqual([f.UUID]);
		expect(calls).toHaveLength(2);
	});

	test('a retry-after of 0 (the API rounds down) still waits the backoff', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient({
			'/patrons/uuids': [{ ...tooMany, headers: { 'x-rate-limit-retry-after-seconds': '0' } }, ok([])],
		});
		const pending = api.patrons.uuids();
		await vi.advanceTimersByTimeAsync(999);
		expect(calls).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		await pending;
		expect(calls).toHaveLength(2);
	});

	test('backs off exponentially without Retry-After, then gives up', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient({ '/patrons/uuids': tooMany }, { maxRetries: 2 });
		const pending = api.patrons.uuids().catch((e) => e);
		await vi.advanceTimersByTimeAsync(1000 + 2000 + 4000);
		const error = await pending;
		expect(error).toBeInstanceOf(ManaCubeRateLimitError);
		expect(error.retryAfterMs).toBe(4000);
		expect(calls).toHaveLength(3);
	});

	test('a 429 holds back concurrent requests on the same client', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient({
			'/patrons/uuids': [{ ...tooMany, headers: { 'retry-after': '5' } }, ok([])],
			'/patrons/patrons': ok([]),
		});
		const first = api.patrons.uuids();
		await vi.advanceTimersByTimeAsync(0);
		const second = api.patrons.patrons();
		await vi.advanceTimersByTimeAsync(4000);
		expect(calls.map((c) => c.url)).toEqual(['/patrons/uuids']);
		await vi.advanceTimersByTimeAsync(1000);
		await Promise.all([first, second]);
		expect(calls).toHaveLength(3);
	});

	test('with retrying off, a 429 throws and later calls fail fast until it lifts', async () => {
		const { api, fetch } = mockClient(
			{ '/patrons/uuids': { ...tooMany, headers: { 'retry-after': '60' } } },
			{ retryOnRateLimit: false },
		);
		await expect(api.patrons.uuids()).rejects.toBeInstanceOf(ManaCubeRateLimitError);
		await expect(api.patrons.uuids()).rejects.toBeInstanceOf(ManaCubeRateLimitError);
		expect(fetch).toHaveBeenCalledOnce();
		expect(api.rateLimit.blockedUntil).toBeGreaterThan(Date.now());
	});

	test('pauses briefly when fewer requests remain than could be in flight', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient({
			'/patrons/uuids': ok([], { 'x-rate-limit-remaining': '3' }),
			'/patrons/patrons': ok([]),
		});
		await api.patrons.uuids();
		const next = api.patrons.patrons();
		await vi.advanceTimersByTimeAsync(999);
		expect(calls).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(1);
		await next;
		expect(calls).toHaveLength(2);
	});

	test('the low-remaining pause does not count as a 429 when retrying is off', async () => {
		vi.useFakeTimers();
		const { api } = mockClient(
			{ '/patrons/uuids': ok([], { 'x-rate-limit-remaining': '0' }) },
			{ retryOnRateLimit: false },
		);
		await api.patrons.uuids();
		const next = api.patrons.uuids();
		await vi.advanceTimersByTimeAsync(1000);
		await expect(next).resolves.toEqual([]);
	});

	test('with request scope, a 429 does not hold back other requests', async () => {
		vi.useFakeTimers();
		const { api, calls } = mockClient(
			{
				'/patrons/uuids': [{ ...tooMany, headers: { 'retry-after': '5' } }, ok([])],
				'/patrons/patrons': ok([]),
			},
			{ rateLimitScope: 'request' },
		);
		const first = api.patrons.uuids();
		await vi.advanceTimersByTimeAsync(0);
		await api.patrons.patrons();
		expect(calls.map((c) => c.url)).toEqual(['/patrons/uuids', '/patrons/patrons']);
		await vi.advanceTimersByTimeAsync(4999);
		expect(calls).toHaveLength(2);
		await vi.advanceTimersByTimeAsync(1);
		await first;
		expect(calls).toHaveLength(3);
		expect(api.rateLimit.blockedUntil).toBe(0);
	});

	test('with request scope and retrying off, only the limited request fails', async () => {
		const { api, fetch } = mockClient(
			{ '/patrons/uuids': [{ ...tooMany, headers: { 'retry-after': '60' } }, ok([])] },
			{ rateLimitScope: 'request', retryOnRateLimit: false },
		);
		const error = await api.patrons.uuids().catch((e) => e);
		expect(error).toBeInstanceOf(ManaCubeRateLimitError);
		expect(error.retryAfterMs).toBe(60_000);
		await expect(api.patrons.uuids()).resolves.toEqual([]);
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	test('with request scope, low remaining does not pause or get tracked', async () => {
		const { api, calls } = mockClient(
			{ '/patrons/uuids': ok([], { 'x-rate-limit-remaining': '0' }), '/patrons/patrons': ok([]) },
			{ rateLimitScope: 'request' },
		);
		await api.patrons.uuids();
		await api.patrons.patrons();
		expect(calls).toHaveLength(2);
		expect(api.rateLimit.remaining).toBeUndefined();
	});

	test('retryOnRateLimit can be overridden per request', async () => {
		const { api, fetch } = mockClient({ '/patrons/uuids': tooMany });
		await expect(api.patrons.uuids({ retryOnRateLimit: false })).rejects.toBeInstanceOf(ManaCubeRateLimitError);
		expect(fetch).toHaveBeenCalledOnce();
	});
});

describe('concurrency', () => {
	function heldFetch() {
		const open: (() => void)[] = [];
		let inFlight = 0;
		let peak = 0;
		const fetch = vi.fn(
			(_url: string | URL | Request, init?: RequestInit) =>
				new Promise<Response>((resolve, reject) => {
					inFlight++;
					peak = Math.max(peak, inFlight);
					init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
					open.push(() => {
						inFlight--;
						resolve(new Response('[]'));
					});
				}),
		);
		return { fetch, open, peak: () => peak };
	}

	test('maxConcurrency caps requests in flight and queues the rest in order', async () => {
		const held = heldFetch();
		const api = new ManaCubeApi({ fetch: held.fetch, maxConcurrency: 2 });
		const all = Promise.all(Array.from({ length: 5 }, () => api.patrons.uuids()));
		await vi.waitFor(() => expect(held.fetch).toHaveBeenCalledTimes(2));
		while (held.open.length) {
			held.open.shift()!();
			await new Promise((r) => setTimeout(r, 0));
		}
		await all;
		expect(held.fetch).toHaveBeenCalledTimes(5);
		expect(held.peak()).toBe(2);
	});

	test('a queued request can be aborted without taking a slot', async () => {
		const held = heldFetch();
		const api = new ManaCubeApi({ fetch: held.fetch, maxConcurrency: 1 });
		const first = api.patrons.uuids();
		const controller = new AbortController();
		const queued = api.patrons.uuids({ signal: controller.signal });
		const third = api.patrons.uuids();
		controller.abort(new Error('stop'));
		await expect(queued).rejects.toThrow('stop');
		held.open.shift()!();
		await first;
		await vi.waitFor(() => expect(held.fetch).toHaveBeenCalledTimes(2));
		held.open.shift()!();
		await third;
	});

	test('maxConcurrency must be a positive integer or Infinity', () => {
		expect(() => new ManaCubeApi({ maxConcurrency: 0 })).toThrow(ManaCubeError);
		expect(() => new ManaCubeApi({ maxConcurrency: 1.5 })).toThrow(ManaCubeError);
		expect(() => new ManaCubeApi({ maxConcurrency: Infinity })).not.toThrow();
	});
});

describe('options', () => {
	test('baseUrl and headers', async () => {
		const fetch = vi.fn(async () => new Response('[]'));
		const api = new ManaCubeApi({ baseUrl: 'https://example.test/api/', headers: { 'user-agent': 'bot' }, fetch });
		await api.patrons.uuids();
		expect(fetch).toHaveBeenCalledWith(
			'https://example.test/api/patrons/uuids',
			expect.objectContaining({ headers: { accept: 'application/json', 'user-agent': 'bot' } }),
		);
	});

	test('per-call headers are merged over client headers, ignoring case', async () => {
		const { api, calls } = mockClient({ '/patrons/uuids': ok([]) }, { headers: { 'User-Agent': 'bot', 'X-A': '1' } });
		await api.patrons.uuids({ headers: { 'x-a': '2', 'X-Client-IP': '203.0.113.7' } });
		await api.patrons.uuids();
		expect(calls[0]!.headers).toEqual({
			accept: 'application/json',
			'user-agent': 'bot',
			'x-a': '2',
			'x-client-ip': '203.0.113.7',
		});
		expect(calls[1]!.headers['x-client-ip']).toBeUndefined();
	});

	test('an authorization header is sent everywhere and satisfies partner endpoints', async () => {
		const { api, calls } = mockClient(
			{ '/patrons/uuids': ok([]), [`/playtime/reset/${f.UUID}`]: ok(undefined) },
			{ headers: { Authorization: 'secret' } },
		);
		await api.patrons.uuids();
		await api.players.resetPlaytime(f.UUID);
		expect(calls.map((c) => c.headers.authorization)).toEqual(['secret', 'secret']);
	});

	test('a per-call authorization header overrides apiKey', async () => {
		const { api, calls } = mockClient({ [`/playtime/reset/${f.UUID}`]: ok(undefined) }, { apiKey: 'secret' });
		await api.players.resetPlaytime(f.UUID, { headers: { authorization: 'other' } });
		expect(calls[0]!.headers.authorization).toBe('other');
	});

	test('the api key is only sent to endpoints that need it', async () => {
		const { api, calls } = mockClient({ '/patrons/uuids': ok([]) }, { apiKey: 'secret' });
		await api.patrons.uuids();
		expect(calls[0]!.headers.authorization).toBeUndefined();
	});
});

describe('custom requests', () => {
	test('call a path the client does not define, with params and query', async () => {
		const { api, calls } = mockClient({ '/dev/stats/earth?day=1&tag=a&tag=b': ok({ online: 5 }) });
		const result = await api.request('GET /dev/stats/{gamemode}', {
			params: { gamemode: 'earth' },
			query: { day: 1, tag: ['a', 'b'] },
		});
		expect(result).toEqual({ online: 5 });
		expectTypeOf(result).toEqualTypeOf<unknown>();
		expect(calls[0]).toMatchObject({ method: 'GET', url: '/dev/stats/earth?day=1&tag=a&tag=b' });
	});

	test('a schema validates and types the response', async () => {
		const schema = z.object({ online: z.number() });
		const { api } = mockClient({ '/dev/stats': [ok({ online: 5 }), ok({ online: 'five' })] });
		const result = await api.request('GET /dev/stats', { schema });
		expectTypeOf(result).toEqualTypeOf<{ online: number }>();
		expect(result.online).toBe(5);
		await expect(api.request('GET /dev/stats', { schema })).rejects.toBeInstanceOf(ManaCubeValidationError);
	});

	test('auth, a JSON body and per-call headers', async () => {
		const { api, calls } = mockClient({ '/dev/reset': ok(undefined) }, { apiKey: 'secret' });
		await api.request('POST /dev/reset', { auth: true, body: { uuid: f.UUID } }, { headers: { 'x-trace': '1' } });
		expect(calls[0]).toMatchObject({
			method: 'POST',
			headers: { authorization: 'secret', 'content-type': 'application/json', 'x-trace': '1' },
			body: JSON.stringify({ uuid: f.UUID }),
		});
	});

	test('notFoundAsNull resolves a 404 to null', async () => {
		const { api } = mockClient({ '/dev/missing': { status: 404, body: { message: 'nope' } } });
		const result = await api.request('GET /dev/missing', { schema: z.number(), notFoundAsNull: true });
		expectTypeOf(result).toEqualTypeOf<number | null>();
		expect(result).toBeNull();
	});

	test('errors and rate limits behave like the built-in methods', async () => {
		const { api } = mockClient(
			{ '/dev/a': { status: 500, body: { message: 'boom' } }, '/dev/b': tooMany },
			{ retryOnRateLimit: false },
		);
		await expect(api.request('GET /dev/a')).rejects.toMatchObject({ status: 500, message: 'ManaCube API 500: boom' });
		await expect(api.request('GET /dev/b')).rejects.toBeInstanceOf(ManaCubeRateLimitError);
	});

	test('rejects a malformed endpoint before sending', async () => {
		const { api, fetch } = mockClient({});
		await expect(api.request('get /x' as never)).rejects.toThrow('expected "METHOD /path"');
		await expect(api.request('GET https://evil.test/x' as never)).rejects.toThrow(ManaCubeError);
		expect(fetch).not.toHaveBeenCalled();
	});
});
