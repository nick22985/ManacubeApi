import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { int, nonEmpty, normalizeUuid } from '../input';
import { type IterateOptions, paginate } from '../paginate';
import { type AuctionPage, auctionPageSchema, type Gamemode } from '../schemas';
import { Resource } from './resource';

type AuctionEndpoint = (typeof endpoints)['activeAuctions' | 'endedAuctions' | 'playerAuctions'];

const emptyPage = (): AuctionPage => ({ lastUpdated: 0, auctions: [], full: false, finalized: false });

export class Auctions extends Resource {
	async active(gamemode: Gamemode, page: number, options?: RequestOptions): Promise<AuctionPage> {
		return (await this.fetchPage(endpoints.activeAuctions, { gamemode }, page, options)) ?? emptyPage();
	}

	async ended(gamemode: Gamemode, page: number, options?: RequestOptions): Promise<AuctionPage> {
		return (await this.fetchPage(endpoints.endedAuctions, { gamemode }, page, options)) ?? emptyPage();
	}

	async player(uuid: string, gamemode: Gamemode, page: number, options?: RequestOptions): Promise<AuctionPage> {
		return (await this.fetchPage(endpoints.playerAuctions, { uuid, gamemode }, page, options)) ?? emptyPage();
	}

	iterateActive(gamemode: Gamemode, options?: IterateOptions & RequestOptions) {
		return this.iterate(endpoints.activeAuctions, { gamemode }, options);
	}

	iterateEnded(gamemode: Gamemode, options?: IterateOptions & RequestOptions) {
		return this.iterate(endpoints.endedAuctions, { gamemode }, options);
	}

	iteratePlayer(uuid: string, gamemode: Gamemode, options?: IterateOptions & RequestOptions) {
		return this.iterate(endpoints.playerAuctions, { uuid, gamemode }, options);
	}

	private fetchPage(
		endpoint: AuctionEndpoint,
		params: { gamemode: string; uuid?: string },
		page: number,
		options?: RequestOptions,
	): Promise<AuctionPage | null> {
		const path: Record<string, string | number> = {
			gamemode: nonEmpty(params.gamemode, 'gamemode'),
			page: int(page, 'page', 1),
		};
		if (params.uuid !== undefined) path.uuid = normalizeUuid(params.uuid);
		return this.http.request(endpoint, { schema: auctionPageSchema.nullable(), params: path }, options);
	}

	private iterate(
		endpoint: AuctionEndpoint,
		params: { gamemode: string; uuid?: string },
		options?: IterateOptions & RequestOptions,
	) {
		return paginate(
			1,
			async (page) => {
				const result =
					(await this.fetchPage(endpoint, params, page, options)) ??
					(await this.fetchPage(endpoint, params, page, options)) ??
					emptyPage();
				return { items: result.auctions, more: result.full };
			},
			options,
		);
	}
}
