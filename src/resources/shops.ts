import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { nonEmpty, optionalInt, zeroBasedPage } from '../input';
import { fromPage, type IterateOptions, oneBasedPage, paginate } from '../paginate';
import {
	type Gamemode,
	type Page,
	pageSchema,
	type Shop,
	type ShopTrade,
	shopSchema,
	shopTradeSchema,
} from '../schemas';
import { Resource } from './resource';

export interface ShopsQuery {
	page?: number;
	size?: number;
}

export interface TradesQuery {
	shop?: number;
	page?: number;
	size?: number;
}

export class Shops extends Resource {
	async list(gamemode: Gamemode, query: ShopsQuery = {}, options?: RequestOptions): Promise<Page<Shop>> {
		const page = await this.http.request(
			endpoints.shops,
			{
				schema: pageSchema(shopSchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode') },
				query: { page: zeroBasedPage(query.page), size: optionalInt(query.size, 'size', 1, 1000) },
			},
			options,
		);
		return oneBasedPage(page);
	}

	async trades(gamemode: Gamemode, query: TradesQuery = {}, options?: RequestOptions): Promise<Page<ShopTrade>> {
		const page = await this.http.request(
			endpoints.shopTrades,
			{
				schema: pageSchema(shopTradeSchema),
				params: { gamemode: nonEmpty(gamemode, 'gamemode') },
				query: {
					shop: optionalInt(query.shop, 'shop', 0),
					page: zeroBasedPage(query.page),
					size: optionalInt(query.size, 'size', 1, 100),
				},
			},
			options,
		);
		return oneBasedPage(page);
	}

	iterate(gamemode: Gamemode, query: Omit<ShopsQuery, 'page'> = {}, options?: IterateOptions & RequestOptions) {
		return paginate(1, async (page) => fromPage(await this.list(gamemode, { ...query, page }, options)), options);
	}

	iterateTrades(gamemode: Gamemode, query: Omit<TradesQuery, 'page'> = {}, options?: IterateOptions & RequestOptions) {
		return paginate(1, async (page) => fromPage(await this.trades(gamemode, { ...query, page }, options)), options);
	}
}
