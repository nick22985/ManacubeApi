import { z } from 'zod';
import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { type PlayerInfo, playerInfoSchema } from '../schemas';
import { Resource } from './resource';

export class Patrons extends Resource {
	async uuids(options?: RequestOptions): Promise<string[]> {
		return this.http.request(endpoints.patronUuids, { schema: z.array(z.string()) }, options);
	}

	async patrons(options?: RequestOptions): Promise<PlayerInfo[]> {
		return this.http.request(endpoints.patrons, { schema: z.array(playerInfoSchema) }, options);
	}

	async patronsPlus(options?: RequestOptions): Promise<PlayerInfo[]> {
		return this.http.request(endpoints.patronsPlus, { schema: z.array(playerInfoSchema) }, options);
	}
}
