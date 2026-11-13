import { z } from 'zod';
import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { int, nonEmpty } from '../input';
import { type FactionPayout, factionPayoutSchema } from '../schemas';
import { Resource } from './resource';

export class Factions extends Resource {
	async placeholder(placeholder: string, options?: RequestOptions): Promise<string> {
		const value = await this.http.request(
			endpoints.factionPlaceholder,
			{
				schema: z.union([z.string(), z.number(), z.null()]),
				params: { placeholder: nonEmpty(placeholder, 'placeholder') },
			},
			options,
		);
		return value === null ? '' : String(value);
	}

	async payouts(season: number, options?: RequestOptions): Promise<FactionPayout[]> {
		return this.http.request(
			endpoints.factionPayouts,
			{ schema: z.array(factionPayoutSchema), params: { season: int(season, 'season', 0) } },
			options,
		);
	}
}
