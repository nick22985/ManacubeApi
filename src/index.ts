import { HttpClient, type ManaCubeApiOptions, type RateLimitState } from './http';
import { Auctions } from './resources/auctions';
import { Economy } from './resources/economy';
import { Factions } from './resources/factions';
import { Guilds } from './resources/guilds';
import { Patrons } from './resources/patrons';
import { Players } from './resources/players';
import { Rankings } from './resources/rankings';
import { Realm } from './resources/realm';
import { Shops } from './resources/shops';
import { Svas } from './resources/svas';
import { Towny } from './resources/towny';
import { Updates } from './resources/updates';

export class ManaCubeApi {
	private readonly http: HttpClient;

	readonly auctions: Auctions;
	readonly economy: Economy;
	readonly factions: Factions;
	readonly guilds: Guilds;
	readonly patrons: Patrons;
	readonly players: Players;
	readonly rankings: Rankings;
	readonly realm: Realm;
	readonly shops: Shops;
	readonly svas: Svas;
	readonly towny: Towny;
	readonly updates: Updates;

	constructor(options: ManaCubeApiOptions = {}) {
		this.http = new HttpClient(options);
		this.auctions = new Auctions(this.http);
		this.economy = new Economy(this.http);
		this.factions = new Factions(this.http);
		this.guilds = new Guilds(this.http);
		this.patrons = new Patrons(this.http);
		this.players = new Players(this.http);
		this.rankings = new Rankings(this.http);
		this.realm = new Realm(this.http);
		this.shops = new Shops(this.http);
		this.svas = new Svas(this.http);
		this.towny = new Towny(this.http);
		this.updates = new Updates(this.http);
	}

	get rateLimit(): Readonly<RateLimitState> {
		return this.http.rateLimit;
	}
}

export { endpoints } from './endpoints';
export * from './errors';
export type {
	Logger,
	ManaCubeApiOptions,
	RateLimitScope,
	RateLimitState,
	RequestOptions,
	ValidationMode,
} from './http';
export { DEFAULT_BASE_URL } from './http';
export { normalizeUuid } from './input';
export { type IterateOptions, toArray } from './paginate';
export type { RankingsQuery } from './resources/rankings';
export type { ShopsQuery, TradesQuery } from './resources/shops';
export type { UpdatesQuery } from './resources/updates';
export * from './schemas';
