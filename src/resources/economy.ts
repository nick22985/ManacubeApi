import { z } from 'zod';
import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { int, nonEmpty } from '../input';
import { type IterateOptions, paginate } from '../paginate';
import {
	type EconomyPriceEntry,
	type EconomyVolumeEntry,
	economyPriceEntrySchema,
	economyVolumeEntrySchema,
	type Gamemode,
} from '../schemas';
import { Resource } from './resource';

export class Economy extends Resource {
	async prices(gamemode: Gamemode, options?: RequestOptions): Promise<EconomyPriceEntry[]> {
		return this.http.request(
			endpoints.economyPrices,
			{ schema: z.array(economyPriceEntrySchema), params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async priceHistory(gamemode: Gamemode, page: number, options?: RequestOptions): Promise<EconomyPriceEntry[]> {
		return this.http.request(
			endpoints.economyPriceHistory,
			{
				schema: z.array(economyPriceEntrySchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode'), page: int(page, 'page', 1) },
			},
			options,
		);
	}

	async volumeHistory(gamemode: Gamemode, page: number, options?: RequestOptions): Promise<EconomyVolumeEntry[]> {
		return this.http.request(
			endpoints.economyVolumeHistory,
			{
				schema: z.array(economyVolumeEntrySchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode'), page: int(page, 'page', 1) },
			},
			options,
		);
	}

	iteratePriceHistory(gamemode: Gamemode, options?: IterateOptions & RequestOptions) {
		return paginate(
			1,
			async (page) => ({ items: await this.priceHistory(gamemode, page, options), more: true }),
			options,
		);
	}

	iterateVolumeHistory(gamemode: Gamemode, options?: IterateOptions & RequestOptions) {
		return paginate(
			1,
			async (page) => ({ items: await this.volumeHistory(gamemode, page, options), more: true }),
			options,
		);
	}
}
