import { describe, expect, test } from 'vitest';
import { ManaCubeValidationError, toArray } from '../src';
import * as f from './fixtures';
import { mockClient, ok } from './helpers';

describe('svas', () => {
	test('types', async () => {
		const { api } = mockClient({ '/svas/survival': ok([f.svaType]) });
		const types = await api.svas.types('survival');
		expect(types[0]!.circulation).toBe(34);
	});

	test('player normalises an undashed uuid', async () => {
		const { api, calls } = mockClient({ [`/svas/survival/${f.UUID}`]: ok([]) });
		await api.svas.player(f.UUID.replaceAll('-', '').toUpperCase(), 'survival');
		expect(calls[0]!.url).toBe(`/svas/survival/${f.UUID}`);
	});

	test('sales and circulation', async () => {
		const { api } = mockClient({
			'/svas/sales/survival/bombchu': ok([{ currency: 'MANA_CUBITS', averageValue: 1.5, timesSold: 3 }]),
			'/svas/circulation/survival/bombchu': ok(54),
		});
		expect((await api.svas.sales('survival', 'bombchu'))[0]!.timesSold).toBe(3);
		expect(await api.svas.circulation('survival', 'bombchu')).toBe(54);
	});

	test('path segments are encoded', async () => {
		const { api, calls } = mockClient({ '/svas/sales/survival/a%2Fb': ok([]) });
		await api.svas.sales('survival', 'a/b');
		expect(calls[0]!.url).toBe('/svas/sales/survival/a%2Fb');
	});
});

describe('economy', () => {
	test('prices and history', async () => {
		const { api } = mockClient({
			'/manaeconomy/prices/earth': ok([f.priceEntry]),
			'/manaeconomy/history/prices/earth/1': ok([f.priceEntry]),
			'/manaeconomy/history/volume/earth/1': ok([{ ...f.priceEntry, volume: 5 }]),
		});
		expect(await api.economy.prices('earth')).toHaveLength(1);
		expect(await api.economy.priceHistory('earth', 1)).toHaveLength(1);
		expect((await api.economy.volumeHistory('earth', 1))[0]!.volume).toBe(5);
	});

	test('iteratePriceHistory stops at the first empty page', async () => {
		const { api, calls } = mockClient({
			'/manaeconomy/history/prices/earth/1': ok([f.priceEntry, f.priceEntry]),
			'/manaeconomy/history/prices/earth/2': ok([f.priceEntry]),
			'/manaeconomy/history/prices/earth/3': ok([]),
		});
		expect(await toArray(api.economy.iteratePriceHistory('earth'))).toHaveLength(3);
		expect(calls).toHaveLength(3);
	});

	test('pages are 1-based', async () => {
		const { api } = mockClient({});
		await expect(api.economy.priceHistory('earth', 0)).rejects.toThrow(ManaCubeValidationError);
	});
});

describe('auctions', () => {
	test('active, ended and player pages', async () => {
		const { api } = mockClient({
			'/auctions/active/survival/1': ok(f.auctionPage),
			'/auctions/ended/survival/1': ok({ ...f.auctionPage, auctions: [{ ...f.auctionItem, status: 'SOLD' }] }),
			[`/auctions/player/${f.UUID}/survival/1`]: ok(f.auctionPage),
		});
		expect((await api.auctions.active('survival', 1)).auctions[0]!.id).toBe(407293);
		expect((await api.auctions.ended('survival', 1)).auctions[0]!.status).toBe('SOLD');
		expect(await api.auctions.player(f.UUID, 'survival', 1)).toMatchObject({ full: false });
	});

	test('an empty body past the last page becomes an empty page', async () => {
		const { api } = mockClient({ '/auctions/active/survival/9': ok(undefined) });
		expect(await api.auctions.active('survival', 9)).toEqual({
			lastUpdated: 0,
			auctions: [],
			full: false,
			finalized: false,
		});
	});

	test('iterateActive follows pages while full', async () => {
		const { api, calls } = mockClient({
			'/auctions/active/survival/1': ok({ ...f.auctionPage, full: true }),
			'/auctions/active/survival/2': ok({ ...f.auctionPage, auctions: [{ ...f.auctionItem, id: 2 }] }),
		});
		const all = await toArray(api.auctions.iterateActive('survival'));
		expect(all.map((a) => a.id)).toEqual([407293, 2]);
		expect(calls).toHaveLength(2);
	});

	test('iterators honour maxPages and stop fetching when the consumer stops', async () => {
		const { api, calls } = mockClient({
			'/auctions/active/survival/1': ok({ ...f.auctionPage, full: true }),
			'/auctions/active/survival/2': ok({ ...f.auctionPage, full: true }),
			'/auctions/active/survival/3': ok({ ...f.auctionPage, full: true }),
		});
		expect(await toArray(api.auctions.iterateActive('survival', { maxPages: 2 }))).toHaveLength(2);
		calls.length = 0;
		expect(await toArray(api.auctions.iterateActive('survival'), 1)).toHaveLength(1);
		expect(calls).toHaveLength(1);
	});

	test('iterators retry an empty body once before treating it as the end', async () => {
		const { api, calls } = mockClient({
			'/auctions/active/survival/1': [ok(undefined), ok({ ...f.auctionPage, full: true })],
			'/auctions/active/survival/2': ok(undefined),
		});
		expect(await toArray(api.auctions.iterateActive('survival'))).toHaveLength(1);
		expect(calls.map((c) => c.url)).toEqual([
			'/auctions/active/survival/1',
			'/auctions/active/survival/1',
			'/auctions/active/survival/2',
			'/auctions/active/survival/2',
		]);
	});

	test('page 0 is rejected before any request', async () => {
		const { api, fetch } = mockClient({});
		await expect(api.auctions.active('survival', 0)).rejects.toThrow('page: must be an integer from 1 up');
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe('shops', () => {
	test('list takes and returns 1-based pages, sending the API 0-based ones', async () => {
		const { api, calls } = mockClient({
			'/shops/earth?page=2&size=10': ok({ items: [f.shop], page: 2, hasMore: false }),
		});
		const page = await api.shops.list('earth', { page: 3, size: 10 });
		expect(page.items[0]!.buyPrice).toBe(1);
		expect(page.page).toBe(3);
		expect(calls[0]!.url).toBe('/shops/earth?page=2&size=10');
	});

	test('page 0 is rejected', async () => {
		const { api } = mockClient({});
		await expect(api.shops.list('earth', { page: 0 })).rejects.toThrow('page: must be an integer from 1 up');
	});

	test('trades filters by shop', async () => {
		const { api } = mockClient({
			'/shops/earth/trades?shop=2700': ok({ items: [f.trade], page: 0, hasMore: false }),
		});
		expect((await api.shops.trades('earth', { shop: 2700 })).items[0]!.shopId).toBe(2700);
	});

	test('iterate walks pages until hasMore is false', async () => {
		const { api } = mockClient({
			'/shops/earth?page=0': ok({ items: [f.shop], page: 0, hasMore: true }),
			'/shops/earth?page=1': ok({ items: [{ ...f.shop, id: 2 }], page: 1, hasMore: false }),
		});
		expect((await toArray(api.shops.iterate('earth'))).map((s) => s.id)).toEqual([1, 2]);
	});

	test('size is range checked', async () => {
		const { api } = mockClient({});
		await expect(api.shops.trades('earth', { size: 101 })).rejects.toThrow('size: must be an integer from 1 to 100');
	});
});

describe('updates', () => {
	test('list with realm', async () => {
		const { api } = mockClient({
			'/updates?realm=Earth&size=1': ok({ items: [f.update], page: 0, hasMore: true }),
		});
		const page = await api.updates.list({ realm: 'Earth', size: 1 });
		expect(page.items[0]!.kind).toBe('ECONOMY');
		expect(page.page).toBe(1);
	});

	test('iterate', async () => {
		const { api } = mockClient({
			'/updates?page=0': ok({ items: [f.update], page: 0, hasMore: true }),
			'/updates?page=1': ok({ items: [f.update], page: 1, hasMore: false }),
		});
		expect(await toArray(api.updates.iterate())).toHaveLength(2);
	});
});

describe('guilds', () => {
	test('top', async () => {
		const { api } = mockClient({ '/guilds/top/1': ok([f.guild]) });
		expect((await api.guilds.top(1))[0]!.tag).toBe('JAVA');
	});

	test('player returns null for a guildless player (empty 200)', async () => {
		const { api } = mockClient({ [`/guilds/player/${f.UUID}`]: ok(undefined) });
		expect(await api.guilds.player(f.UUID)).toBeNull();
	});
});

describe('players', () => {
	test('get sends repeated uuid params and unwraps the list', async () => {
		const { api, calls } = mockClient({ [`/players?uuid=${f.UUID2}&uuid=${f.UUID}`]: ok(f.players) });
		const players = await api.players.get([f.UUID2, f.UUID]);
		expect(players.map((p) => p.name)).toEqual([null, 'Roree']);
		expect(calls).toHaveLength(1);
	});

	test('get rejects more than 100 uuids', async () => {
		const { api } = mockClient({});
		await expect(api.players.get(Array(101).fill(f.UUID))).rejects.toThrow('must contain 1 to 100 UUIDs');
	});

	test('friends', async () => {
		const { api } = mockClient({ [`/friends/${f.UUID}`]: ok([{ uuid: f.UUID2, name: 'AlfieJay' }]) });
		expect(await api.players.friends(f.UUID)).toEqual([{ uuid: f.UUID2, name: 'AlfieJay' }]);
	});

	test('level and cubits return null for an unknown player', async () => {
		const { api } = mockClient({
			[`/manalevel/${f.UUID}`]: { status: 404, body: f.notFoundPlayer },
			[`/cubits/${f.UUID}`]: { status: 404, body: f.notFoundPlayer },
		});
		expect(await api.players.level(f.UUID)).toBeNull();
		expect(await api.players.cubits(f.UUID)).toBeNull();
	});

	test('level and cubits', async () => {
		const { api } = mockClient({ [`/manalevel/${f.UUID}`]: ok(f.manaLevel), [`/cubits/${f.UUID}`]: ok(5.47) });
		expect((await api.players.level(f.UUID))!.totalExp).toBe(587181);
		expect(await api.players.cubits(f.UUID)).toBe(5.47);
	});

	test('invalid uuid is rejected before any request', async () => {
		const { api, fetch } = mockClient({});
		const error = await api.players.friends('nope').catch((e) => e);
		expect(error).toBeInstanceOf(ManaCubeValidationError);
		expect(error.source).toBe('input');
		expect(fetch).not.toHaveBeenCalled();
	});

	test('resetPlaytime POSTs with the api key', async () => {
		const { api, calls } = mockClient({ [`/playtime/reset/${f.UUID}`]: ok(undefined) }, { apiKey: 'secret' });
		await api.players.resetPlaytime(f.UUID);
		expect(calls[0]).toMatchObject({ method: 'POST', headers: { authorization: 'secret' } });
	});

	test('resetPlaytime without an api key throws before any request', async () => {
		const { api, fetch } = mockClient({});
		await expect(api.players.resetPlaytime(f.UUID)).rejects.toThrow('requires an API key');
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe('patrons', () => {
	test('uuids, patrons and patronsPlus', async () => {
		const { api } = mockClient({
			'/patrons/uuids': ok([f.UUID]),
			'/patrons/patrons': ok([{ uuid: f.UUID, name: 'Roree' }]),
			'/patrons/patronsplus': ok([]),
		});
		expect(await api.patrons.uuids()).toEqual([f.UUID]);
		expect(await api.patrons.patrons()).toHaveLength(1);
		expect(await api.patrons.patronsPlus()).toEqual([]);
	});
});

describe('factions', () => {
	test('placeholder accepts JSON and plain text bodies', async () => {
		const { api } = mockClient({
			'/factions/placeholder/a': ok('"12"'),
			'/factions/placeholder/b': ok('plain'),
			'/factions/placeholder/c': ok(undefined),
		});
		expect(await api.factions.placeholder('a')).toBe('12');
		expect(await api.factions.placeholder('b')).toBe('plain');
		expect(await api.factions.placeholder('c')).toBe('');
	});

	test('payouts', async () => {
		const payout = {
			time: 1,
			week: '1',
			statistic: 'ftop',
			player_uuid: f.UUID,
			factionName: 'x',
			place: 1,
			value: 2,
			payout: 3,
		};
		const { api } = mockClient({ '/factions/payouts/3': ok([payout]) });
		expect(await api.factions.payouts(3)).toEqual([payout]);
	});
});

describe('towny', () => {
	test('towns, nations, claims and recruit', async () => {
		const { api } = mockClient({
			'/towny/earth/towns': ok(f.towns),
			'/towny/earth/nations': ok(f.nations),
			'/towny/earth/claims': ok(f.claims),
			'/recruit/earth': ok(f.recruit),
		});
		expect((await api.towny.towns('earth')).towns[0]!.mayor!.name).toBe('Luuiee');
		expect((await api.towny.nations('earth')).nations[0]!.leader!.name).toBe('liolet');
		expect((await api.towny.claims('earth')).claims[0]!.home).toBe(true);
		expect((await api.towny.recruit('earth')).nomads[0]!.timezone).toBe('na-east');
	});
});

describe('rankings', () => {
	test('boards unwraps the id list', async () => {
		const { api } = mockClient({ '/rankings/earth/boards': ok({ boards: ['player_balances_alltime'] }) });
		expect(await api.rankings.boards('earth')).toEqual(['player_balances_alltime']);
	});

	test('get sends repeated board params and the limit', async () => {
		const { api, calls } = mockClient({
			'/rankings/earth?board=player_balances_alltime&board=player_kills_alltime&limit=5': ok(f.rankings),
		});
		const result = await api.rankings.get('earth', ['player_balances_alltime', 'player_kills_alltime'], { limit: 5 });
		expect(result.boards[0]!.entries[0]!.position).toBe(1);
		expect(calls).toHaveLength(1);
	});

	test('get accepts a single board id', async () => {
		const { api } = mockClient({ '/rankings/earth?board=player_balances_alltime': ok(f.rankings) });
		await expect(api.rankings.get('earth', 'player_balances_alltime')).resolves.toBeDefined();
	});

	test('get requires at least one board', async () => {
		const { api } = mockClient({});
		await expect(api.rankings.get('earth', [])).rejects.toThrow('must contain 1 to 20 board ids');
	});
});

describe('realm', () => {
	test('wonders, events and policy', async () => {
		const { api } = mockClient({
			'/wonders/earth': ok(f.wonders),
			'/events/earth': ok(f.events),
			'/policy/earth': ok(f.policy),
		});
		expect((await api.realm.wonders('earth')).sessions[0]!.zone).toBe('America/New_York');
		expect((await api.realm.events('earth')).events[0]!.source).toBe('KoTH');
		expect((await api.realm.policy('earth')).vote!.options[0]!.playerVotes).toBe(64);
	});
});
