import type { ZodType } from 'zod';
import type { Endpoint } from './endpoints';
import { ManaCubeApiError, ManaCubeError, ManaCubeRateLimitError, ManaCubeValidationError } from './errors';

export const DEFAULT_BASE_URL = 'https://api.manacube.com/api';

export type ValidationMode = 'warn' | 'strict' | 'off';

export interface Logger {
	debug?(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
}

export interface ManaCubeApiOptions {
	baseUrl?: string;
	apiKey?: string;
	fetch?: typeof fetch;
	headers?: Record<string, string>;
	timeout?: number;
	retryOnRateLimit?: boolean;
	maxRetries?: number;
	maxConcurrency?: number;
	validation?: ValidationMode;
	logger?: Logger;
}

export interface RequestOptions {
	signal?: AbortSignal;
	retryOnRateLimit?: boolean;
}

export interface RateLimitState {
	remaining?: number;
	blockedUntil: number;
}

type QueryValue = string | number | boolean | ReadonlyArray<string> | undefined;

export interface Call<T> {
	schema: ZodType<T>;
	params?: Record<string, string | number>;
	query?: Record<string, QueryValue>;
	auth?: boolean;
	notFoundAsNull?: boolean;
}

const MAX_BACKOFF_MS = 30_000;
const LOW_REMAINING_PAUSE_MS = 1_000;

export class HttpClient {
	private readonly baseUrl: string;
	private readonly apiKey?: string;
	private readonly fetchImpl: typeof fetch;
	private readonly headers: Record<string, string>;
	private readonly timeout: number;
	private readonly retryOnRateLimit: boolean;
	private readonly maxRetries: number;
	private readonly validation: ValidationMode;
	private readonly logger: Logger;
	private readonly limiter: Limiter;
	private readonly lowRemaining: number;
	private readonly warned = new Set<string>();
	private pausedUntil = 0;
	readonly rateLimit: RateLimitState = { blockedUntil: 0 };

	constructor(options: ManaCubeApiOptions = {}) {
		this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
		this.apiKey = options.apiKey;
		const fetchImpl = options.fetch ?? globalThis.fetch;
		if (!fetchImpl) throw new ManaCubeError('No fetch implementation found; pass one as options.fetch');
		this.fetchImpl = fetchImpl;
		this.headers = { accept: 'application/json', ...options.headers };
		this.timeout = options.timeout ?? 30_000;
		this.retryOnRateLimit = options.retryOnRateLimit ?? true;
		this.maxRetries = options.maxRetries ?? 3;
		this.validation = options.validation ?? 'warn';
		this.logger = options.logger ?? { warn: (message, ...args) => console.warn(message, ...args) };
		const maxConcurrency = options.maxConcurrency ?? 4;
		if (!(Number.isInteger(maxConcurrency) || maxConcurrency === Infinity) || maxConcurrency < 1) {
			throw new ManaCubeError('options.maxConcurrency must be a positive integer or Infinity');
		}
		this.limiter = new Limiter(maxConcurrency);
		this.lowRemaining = Math.min(maxConcurrency, 8);
	}

	async request<T>(endpoint: Endpoint, call: Call<T>, options: RequestOptions = {}): Promise<T> {
		const [method, template] = endpoint.split(' ') as [string, string];
		const url = this.buildUrl(template, call.params, call.query);
		const retry = options.retryOnRateLimit ?? this.retryOnRateLimit;

		const headers = { ...this.headers };
		if (call.auth) {
			if (!this.apiKey) throw new ManaCubeError(`${endpoint} requires an API key; pass options.apiKey`);
			headers.authorization = this.apiKey;
		}

		return this.limiter.run(async () => {
			for (let attempt = 0; ; attempt++) {
				const now = Date.now();
				if (this.rateLimit.blockedUntil > now && !retry) {
					throw new ManaCubeRateLimitError(url, undefined, this.rateLimit.blockedUntil - now);
				}
				const wait = Math.max(this.rateLimit.blockedUntil, this.pausedUntil) - now;
				if (wait > 0) {
					this.logger.debug?.(`manacube: rate limited, waiting ${wait}ms before ${method} ${url}`);
					await sleep(wait, options.signal);
				}

				const response = await this.send(method, url, headers, options.signal);
				const remaining = Number(response.headers.get('x-rate-limit-remaining'));
				if (response.headers.has('x-rate-limit-remaining') && !Number.isNaN(remaining)) {
					this.rateLimit.remaining = remaining;
					if (remaining < this.lowRemaining) {
						this.pausedUntil = Math.max(this.pausedUntil, Date.now() + LOW_REMAINING_PAUSE_MS);
					}
				}
				const body = await readBody(response);

				if (response.status === 429) {
					const backoff = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
					const delay = Math.max(retryAfterMs(response.headers) ?? 0, backoff);
					this.rateLimit.blockedUntil = Math.max(this.rateLimit.blockedUntil, Date.now() + delay);
					if (!retry || attempt >= this.maxRetries) throw new ManaCubeRateLimitError(url, body, delay);
					continue;
				}
				if (response.status === 404 && call.notFoundAsNull) return null as T;
				if (!response.ok) throw new ManaCubeApiError(response.status, url, body);

				return this.parse(call.schema, body, `${method} ${template}`);
			}
		}, options.signal);
	}

	private async send(method: string, url: string, headers: Record<string, string>, signal?: AbortSignal) {
		const signals = [signal, this.timeout > 0 ? AbortSignal.timeout(this.timeout) : undefined].filter(
			(s): s is AbortSignal => s !== undefined,
		);
		this.logger.debug?.(`manacube: ${method} ${url}`);
		try {
			return await this.fetchImpl(url, {
				method,
				headers,
				signal: signals.length ? AbortSignal.any(signals) : undefined,
			});
		} catch (error) {
			if (signal?.aborted) throw error;
			throw new ManaCubeError(`${method} ${url} failed: ${(error as Error)?.message ?? error}`, {
				cause: error,
			});
		}
	}

	private buildUrl(
		template: string,
		params: Record<string, string | number> = {},
		query: Record<string, QueryValue> = {},
	): string {
		const path = template.replace(/\{(\w+)\}/g, (_, key: string) => {
			if (!(key in params)) throw new ManaCubeError(`Missing path parameter ${key} for ${template}`);
			return encodeURIComponent(String(params[key]));
		});
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value === undefined) continue;
			if (Array.isArray(value)) for (const v of value) search.append(key, v);
			else search.append(key, String(value));
		}
		const qs = search.toString();
		return `${this.baseUrl}${path}${qs ? `?${qs}` : ''}`;
	}

	private parse<T>(schema: ZodType<T>, data: unknown, context: string): T {
		if (this.validation === 'off') return data as T;
		const result = schema.safeParse(data);
		if (result.success) return result.data;
		if (this.validation === 'strict') throw new ManaCubeValidationError('response', result.error.issues, context);
		const fresh = result.error.issues.filter((issue) => {
			const key = `${context} ${issue.path.map((p) => (typeof p === 'number' ? '*' : String(p))).join('.')} ${issue.message}`;
			if (this.warned.has(key)) return false;
			this.warned.add(key);
			return true;
		});
		if (fresh.length) this.logger.warn(`manacube: ${new ManaCubeValidationError('response', fresh, context).message}`);
		return data as T;
	}
}

class Limiter {
	private active = 0;
	private readonly queue: (() => void)[] = [];

	constructor(private readonly max: number) {}

	async run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		if (this.active < this.max) this.active++;
		else await this.waitForSlot(signal);
		try {
			return await task();
		} finally {
			const next = this.queue.shift();
			if (next) next();
			else this.active--;
		}
	}

	private waitForSlot(signal?: AbortSignal): Promise<void> {
		return new Promise((resolve, reject) => {
			if (signal?.aborted) return reject(signal.reason);
			const wake = () => {
				signal?.removeEventListener('abort', onAbort);
				resolve();
			};
			const onAbort = () => {
				this.queue.splice(this.queue.indexOf(wake), 1);
				reject(signal!.reason);
			};
			this.queue.push(wake);
			signal?.addEventListener('abort', onAbort, { once: true });
		});
	}
}

async function readBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (text === '') return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function retryAfterMs(headers: Headers): number | undefined {
	const seconds = headers.get('x-rate-limit-retry-after-seconds') ?? headers.get('retry-after');
	if (seconds === null) return undefined;
	const n = Number(seconds);
	if (!Number.isNaN(n)) return Math.max(0, n * 1000);
	const date = Date.parse(seconds);
	return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) return reject(signal.reason);
		const onAbort = () => {
			clearTimeout(timer);
			reject(signal!.reason);
		};
		const timer = setTimeout(() => {
			signal?.removeEventListener('abort', onAbort);
			resolve();
		}, ms);
		signal?.addEventListener('abort', onAbort, { once: true });
	});
}
