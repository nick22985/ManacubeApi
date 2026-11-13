import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { nonEmpty } from '../input';
import {
	type Events,
	eventsSchema,
	type Gamemode,
	type Policy,
	policySchema,
	type Wonders,
	wondersSchema,
} from '../schemas';
import { Resource } from './resource';

export class Realm extends Resource {
	async wonders(gamemode: Gamemode, options?: RequestOptions): Promise<Wonders> {
		return this.http.request(
			endpoints.wonders,
			{ schema: wondersSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async events(gamemode: Gamemode, options?: RequestOptions): Promise<Events> {
		return this.http.request(
			endpoints.events,
			{ schema: eventsSchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}

	async policy(gamemode: Gamemode, options?: RequestOptions): Promise<Policy> {
		return this.http.request(
			endpoints.policy,
			{ schema: policySchema, params: { gamemode: nonEmpty(gamemode, 'gamemode') } },
			options,
		);
	}
}
