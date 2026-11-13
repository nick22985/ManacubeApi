import { vi } from 'vitest';
import { ManaCubeApi, type ManaCubeApiOptions } from '../src';

export type Reply = { status?: number; body?: unknown; headers?: Record<string, string> };

export function mockClient(routes: Record<string, Reply | Reply[]>, options: ManaCubeApiOptions = {}) {
	const calls: { method: string; url: string; headers: Record<string, string>; body?: unknown }[] = [];
	const used = new Map<string, number>();
	const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
		const url = String(input);
		const key = url.replace('https://api.manacube.com/api', '');
		calls.push({
			method: init?.method ?? 'GET',
			url: key,
			headers: (init?.headers ?? {}) as Record<string, string>,
			body: init?.body ?? undefined,
		});
		const route = routes[key];
		if (!route) return new Response(JSON.stringify({ message: `no mock for ${key}` }), { status: 599 });
		const list = Array.isArray(route) ? route : [route];
		const n = used.get(key) ?? 0;
		used.set(key, n + 1);
		const reply = list[Math.min(n, list.length - 1)]!;
		const body =
			reply.body === undefined ? '' : typeof reply.body === 'string' ? reply.body : JSON.stringify(reply.body);
		return new Response(body, { status: reply.status ?? 200, headers: reply.headers });
	});
	const api = new ManaCubeApi({ validation: 'strict', ...options, fetch });
	return { api, calls, fetch };
}

export const ok = (body: unknown, headers?: Record<string, string>): Reply => ({ body, headers });
