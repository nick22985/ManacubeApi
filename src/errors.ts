import type { ApiErrorBody } from './schemas';

export class ManaCubeError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = new.target.name;
	}
}

export class ManaCubeApiError extends ManaCubeError {
	readonly status: number;
	readonly url: string;
	readonly body: ApiErrorBody | unknown;

	constructor(status: number, url: string, body: unknown, message?: string) {
		super(message ?? errorMessage(status, body));
		this.status = status;
		this.url = url;
		this.body = body;
	}
}

export class ManaCubeRateLimitError extends ManaCubeApiError {
	readonly retryAfterMs: number;

	constructor(url: string, body: unknown, retryAfterMs: number) {
		super(429, url, body, `Rate limited by the ManaCube API, retry in ${Math.ceil(retryAfterMs / 1000)}s`);
		this.retryAfterMs = retryAfterMs;
	}
}

export interface ValidationIssue {
	path: PropertyKey[];
	message: string;
}

export class ManaCubeValidationError extends ManaCubeError {
	readonly source: 'input' | 'response';
	readonly issues: ValidationIssue[];

	constructor(source: 'input' | 'response', issues: ValidationIssue[], context?: string) {
		const detail = issues.map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message));
		super(`Invalid ${source}${context ? ` for ${context}` : ''}: ${detail.join(', ')}`);
		this.source = source;
		this.issues = issues;
	}
}

function errorMessage(status: number, body: unknown): string {
	if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
		return `ManaCube API ${status}: ${body.message}`;
	}
	return `ManaCube API responded with ${status}`;
}
