import { ManaCubeValidationError } from './errors';

const UUID = /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})$/i;

function invalid(name: string, message: string): never {
	throw new ManaCubeValidationError('input', [{ path: [name], message }]);
}

export function normalizeUuid(value: string, name = 'uuid'): string {
	const match = typeof value === 'string' ? UUID.exec(value.trim()) : null;
	if (!match) invalid(name, `expected a UUID, got ${JSON.stringify(value)}`);
	return match.slice(1).join('-').toLowerCase();
}

export function nonEmpty(value: string, name: string): string {
	if (typeof value !== 'string' || value.trim() === '') invalid(name, 'must be a non-empty string');
	return value;
}

export function int(value: number, name: string, min: number, max = Number.MAX_SAFE_INTEGER): number {
	if (!Number.isInteger(value) || value < min || value > max) {
		invalid(name, `must be an integer from ${min}${max === Number.MAX_SAFE_INTEGER ? ' up' : ` to ${max}`}`);
	}
	return value;
}

export function zeroBasedPage(value: number | undefined): number | undefined {
	return value === undefined ? undefined : int(value, 'page', 1) - 1;
}

export function optionalInt(value: number | undefined, name: string, min: number, max?: number) {
	return value === undefined ? undefined : int(value, name, min, max);
}
