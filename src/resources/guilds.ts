import { z } from 'zod';
import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { int, normalizeUuid } from '../input';
import { type Guild, guildSchema } from '../schemas';
import { Resource } from './resource';

export class Guilds extends Resource {
	async top(amount: number, options?: RequestOptions): Promise<Guild[]> {
		return this.http.request(
			endpoints.topGuilds,
			{ schema: z.array(guildSchema), params: { amount: int(amount, 'amount', 1) } },
			options,
		);
	}

	async player(uuid: string, options?: RequestOptions): Promise<Guild | null> {
		return this.http.request(
			endpoints.playerGuild,
			{ schema: guildSchema.nullable(), params: { uuid: normalizeUuid(uuid) }, notFoundAsNull: true },
			options,
		);
	}
}
