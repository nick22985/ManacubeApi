import { endpoints } from '../endpoints';
import { ManaCubeValidationError } from '../errors';
import type { RequestOptions } from '../http';
import { nonEmpty, optionalInt } from '../input';
import { type Gamemode, type Rankings as RankingsData, rankingBoardIdsSchema, rankingsSchema } from '../schemas';
import { Resource } from './resource';

export interface RankingsQuery {
	limit?: number;
}

export class Rankings extends Resource {
	async boards(gamemode: Gamemode, options?: RequestOptions): Promise<string[]> {
		const result = await this.http.request(
			endpoints.rankingBoards,
			{ schema: rankingBoardIdsSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
		return result.boards;
	}

	async get(
		gamemode: Gamemode,
		boards: string | readonly string[],
		query: RankingsQuery = {},
		options?: RequestOptions,
	): Promise<RankingsData> {
		const ids = typeof boards === 'string' ? [boards] : boards;
		if (!Array.isArray(ids) || ids.length === 0 || ids.length > 20) {
			throw new ManaCubeValidationError('input', [{ path: ['boards'], message: 'must contain 1 to 20 board ids' }]);
		}
		return this.http.request(
			endpoints.rankings,
			{
				schema: rankingsSchema,
				params: { gamemode: nonEmpty(gamemode, 'gamemode') },
				query: {
					board: ids.map((id, i) => nonEmpty(id, `boards.${i}`)),
					limit: optionalInt(query.limit, 'limit', 1, 100),
				},
			},
			options,
		);
	}
}
