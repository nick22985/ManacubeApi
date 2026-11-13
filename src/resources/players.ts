import { z } from 'zod';
import { endpoints } from '../endpoints';
import { ManaCubeValidationError } from '../errors';
import type { RequestOptions } from '../http';
import { normalizeUuid } from '../input';
import {
	type ManaLevel,
	manaLevelSchema,
	type PlayerIdentity,
	type PlayerInfo,
	playerIdentitiesSchema,
	playerInfoSchema,
} from '../schemas';
import { Resource } from './resource';

export class Players extends Resource {
	async get(uuids: readonly string[], options?: RequestOptions): Promise<PlayerIdentity[]> {
		if (!Array.isArray(uuids) || uuids.length === 0 || uuids.length > 100) {
			throw new ManaCubeValidationError('input', [{ path: ['uuids'], message: 'must contain 1 to 100 UUIDs' }]);
		}
		const result = await this.http.request(
			endpoints.players,
			{ schema: playerIdentitiesSchema, query: { uuid: uuids.map((u, i) => normalizeUuid(u, `uuids.${i}`)) } },
			options,
		);
		return result.players;
	}

	async friends(uuid: string, options?: RequestOptions): Promise<PlayerInfo[]> {
		return this.http.request(
			endpoints.friends,
			{ schema: z.array(playerInfoSchema), params: { uuid: normalizeUuid(uuid) } },
			options,
		);
	}

	async level(uuid: string, options?: RequestOptions): Promise<ManaLevel | null> {
		return this.http.request(
			endpoints.manaLevel,
			{ schema: manaLevelSchema.nullable(), params: { uuid: normalizeUuid(uuid) }, notFoundAsNull: true },
			options,
		);
	}

	async cubits(uuid: string, options?: RequestOptions): Promise<number | null> {
		return this.http.request(
			endpoints.cubits,
			{ schema: z.number().nullable(), params: { uuid: normalizeUuid(uuid) }, notFoundAsNull: true },
			options,
		);
	}

	async resetPlaytime(uuid: string, options?: RequestOptions): Promise<void> {
		await this.http.request(
			endpoints.resetPlaytime,
			{ schema: z.unknown(), params: { uuid: normalizeUuid(uuid) }, auth: true },
			options,
		);
	}
}
