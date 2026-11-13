import { z } from 'zod';
import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { nonEmpty, normalizeUuid } from '../input';
import {
	type Gamemode,
	type PlayerSva,
	playerSvaSchema,
	type SvaSale,
	type SvaType,
	svaSaleSchema,
	svaTypeSchema,
} from '../schemas';
import { Resource } from './resource';

export class Svas extends Resource {
	async types(gamemode: Gamemode, options?: RequestOptions): Promise<SvaType[]> {
		return this.http.request(
			endpoints.svaTypes,
			{ schema: z.array(svaTypeSchema), params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async player(uuid: string, gamemode: Gamemode, options?: RequestOptions): Promise<PlayerSva[]> {
		return this.http.request(
			endpoints.playerSvas,
			{
				schema: z.array(playerSvaSchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode'), uuid: normalizeUuid(uuid) },
			},
			options,
		);
	}

	async sales(gamemode: Gamemode, sva: string, options?: RequestOptions): Promise<SvaSale[]> {
		return this.http.request(
			endpoints.svaSales,
			{
				schema: z.array(svaSaleSchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode'), sva: nonEmpty(sva, 'sva') },
			},
			options,
		);
	}

	async circulation(gamemode: Gamemode, sva: string, options?: RequestOptions): Promise<number> {
		return this.http.request(
			endpoints.svaCirculation,
			{ schema: z.number(), params: { gamemode: nonEmpty(gamemode, 'gamemode'), sva: nonEmpty(sva, 'sva') } },
			options,
		);
	}
}
