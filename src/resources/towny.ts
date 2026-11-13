import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { nonEmpty } from '../input';
import {
	type Gamemode,
	type Recruit,
	recruitSchema,
	type TownyClaims,
	type TownyNations,
	type TownyTowns,
	townyClaimsSchema,
	townyNationsSchema,
	townyTownsSchema,
} from '../schemas';
import { Resource } from './resource';

export class Towny extends Resource {
	async towns(gamemode: Gamemode, options?: RequestOptions): Promise<TownyTowns> {
		return this.http.request(
			endpoints.townyTowns,
			{ schema: townyTownsSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async nations(gamemode: Gamemode, options?: RequestOptions): Promise<TownyNations> {
		return this.http.request(
			endpoints.townyNations,
			{ schema: townyNationsSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async claims(gamemode: Gamemode, options?: RequestOptions): Promise<TownyClaims> {
		return this.http.request(
			endpoints.townyClaims,
			{ schema: townyClaimsSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async recruit(gamemode: Gamemode, options?: RequestOptions): Promise<Recruit> {
		return this.http.request(
			endpoints.recruit,
			{ schema: recruitSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}
}
