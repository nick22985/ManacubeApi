import { ManaCubeApi, toArray } from '../dist/index.js';

const api = new ManaCubeApi({ validation: 'strict' });
const PLAYER = '30f8109e-7ea7-4ae7-90f4-178bb39cfe31';
const SELLER = '5c605f32-c041-4200-846d-efe97ec331e3';
const UNKNOWN = '00000000-0000-4000-8000-000000000000';

const checks = {
	'svas.types': () => api.svas.types('survival').then((r) => r.length),
	'svas.player': () => api.svas.player(PLAYER, 'survival').then((r) => r.length),
	'svas.sales': () => api.svas.sales('survival', 'bombchu').then((r) => r.length),
	'svas.circulation': () => api.svas.circulation('survival', 'bombchu'),
	'economy.prices': () => api.economy.prices('earth').then((r) => r.length),
	'economy.priceHistory': () => api.economy.priceHistory('earth', 1).then((r) => r.length),
	'economy.volumeHistory': () => api.economy.volumeHistory('earth', 1).then((r) => r.length),
	'auctions.active': () => api.auctions.active('survival', 1).then((r) => r.auctions.length),
	'auctions.ended': () => api.auctions.ended('survival', 1).then((r) => r.auctions.length),
	'auctions.player': () => api.auctions.player(SELLER, 'survival', 1).then((r) => r.auctions.length),
	'shops.list': () => api.shops.list('earth', { size: 200 }).then((r) => `page ${r.page}, ${r.items.length} items`),
	'shops.trades': () => api.shops.trades('earth', { size: 100 }).then((r) => r.items.length),
	'updates.iterate': () => toArray(api.updates.iterate({ size: 100 }), 150).then((r) => r.length),
	'guilds.top': () => api.guilds.top(20).then((r) => r.length),
	'guilds.player': () => api.guilds.player(PLAYER).then((r) => r?.tag ?? null),
	'players.get': () => api.players.get([PLAYER, UNKNOWN]).then((r) => r.map((p) => p.name)),
	'players.friends': () => api.players.friends(PLAYER).then((r) => r.length),
	'players.level': () => api.players.level(PLAYER).then((r) => r?.totalExp),
	'players.level (unknown player)': () => api.players.level(UNKNOWN),
	'players.cubits': () => api.players.cubits(PLAYER),
	'patrons.uuids': () => api.patrons.uuids().then((r) => r.length),
	'patrons.patrons': () => api.patrons.patrons().then((r) => r.length),
	'patrons.patronsPlus': () => api.patrons.patronsPlus().then((r) => r.length),
	'factions.placeholder': () => api.factions.placeholder('test').then((r) => JSON.stringify(r)),
	'factions.payouts': () => api.factions.payouts(1).then((r) => r.length),
	'towny.towns': () => api.towny.towns('earth').then((r) => r.towns.length),
	'towny.nations': () => api.towny.nations('earth').then((r) => r.nations.length),
	'towny.claims': () => api.towny.claims('earth').then((r) => r.claims.length),
	'towny.recruit': () => api.towny.recruit('earth').then((r) => `${r.towns.length} towns, ${r.nomads.length} nomads`),
	'rankings.boards': () => api.rankings.boards('earth').then((r) => r.length),
	'rankings.get': async () => {
		const boards = await api.rankings.boards('earth');
		return api.rankings.get('earth', boards.slice(0, 20), { limit: 100 }).then((r) => r.boards.length);
	},
	'realm.wonders': () => api.realm.wonders('earth').then((r) => r.wonders.length),
	'realm.events': () => api.realm.events('earth').then((r) => r.events.length),
	'realm.policy': () => api.realm.policy('earth').then((r) => r.history.length),
};

let failed = 0;
for (const [name, check] of Object.entries(checks)) {
	try {
		console.log('ok  ', name, '->', await check());
	} catch (error) {
		failed++;
		console.log('FAIL', name, '->', error.name, error.message.slice(0, 300));
	}
}
console.log(`\n${Object.keys(checks).length - failed} passed, ${failed} failed`, api.rateLimit);
process.exitCode = failed ? 1 : 0;
