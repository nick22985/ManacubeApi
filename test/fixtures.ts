export const UUID = '30f8109e-7ea7-4ae7-90f4-178bb39cfe31';
export const UUID2 = 'afa2d6be-5df5-486d-b07e-9c20a29cce04';

export const svaType = {
	itemType: 'championtunic',
	slot: 'ARMOR_CHESTPLATE',
	version: 1,
	circulation: 34,
	material: 'NETHERITE_CHESTPLATE',
	durability: 0,
	displayName: '&r&lCHAMPION TUNIC',
	lore: ['&r§6Unbreakable'],
	enchants: { Protection: 8 },
	customModelData: -1,
	itemModel: 'manalabs:crates/zelda26/champion_tunic',
	unbreakable: true,
	leatherColor: null,
};

export const auctionItem = {
	adminAuction: false,
	auctionType: 'SELL',
	creationTime: 1794362687923,
	economyType: 'MANA_CUBITS',
	expiryTime: 1794535487923,
	id: 407293,
	item: 'NETHERITE_BOOTS 1 name:&lWARDEN_BOOTS',
	price: 2.0,
	sellerUUID: '5c605f32-c041-4200-846d-efe97ec331e3',
	status: 'ACTIVE',
	topBidderUUID: null,
	winnerUUID: null,
};

export const auctionPage = { auctions: [auctionItem], finalized: false, full: false, lastUpdated: 1794534992992 };

export const guild = {
	id: 204617639,
	tag: 'JAVA',
	createDate: '2021-05-21T16:55:12.000Z',
	rank: 393,
	level: 108,
	description: null,
	homeServer: null,
	members: [{ uuid: UUID, name: 'Roree', guildId: 204617639, joinDate: '2021-05-21T16:55:12.000Z', rank: 'owner' }],
};

export const manaLevel = {
	uuid: UUID,
	totalExp: 587181,
	stats: [{ key: 'base:blocks_broken', value: 83, progression: 83671.0 }],
};

export const priceEntry = {
	time: 1794535043000,
	shopID: 'sellshop',
	itemID: 'netherwart',
	newPrice: 1.9908,
	oldPrice: 1.9907,
	basePrice: 3.0,
	item: 'NETHER_WART 1',
	periodMS: 600000,
};

export const shop = {
	id: 1,
	ownerUuid: '2d10de75-cf23-44f6-9ddc-13768cc62a6a',
	server: 'earth-map',
	world: 'earth',
	x: 36086,
	y: 74,
	z: 7730,
	shopType: 'SELL',
	amount: 1,
	currencyType: 'VAULT',
	buyPrice: 1.0,
	sellPrice: null,
	material: 'OAK_SIGN',
	itemName: 'Oak Sign',
	stock: null,
	stockUpdatedAt: null,
	updatedAt: null,
	lastTradeAt: null,
};

export const trade = {
	time: '2026-11-12T21:13:50.096Z',
	shopId: 2700,
	shopOwner: '02f55a78-502a-478a-97e4-971c221e14ba',
	action: 'BUY',
	amount: 9,
	price: 0.1,
	pricePerItem: 0.011111111111111112,
	currencyType: 'MANA_CUBITS',
	server: 'earth-map',
	material: 'TURTLE_SCUTE',
	itemName: 'Spawner Fragment',
};

export const update = {
	id: 8543,
	author: 'Swrds',
	categories: ['Store'],
	scope: 'realm',
	kind: 'ECONOMY',
	description: 'The Anniversary sale has been extended by 1 day!',
	createdAt: '2026-09-22T22:40:52Z',
};

export const towns = {
	revision: 'b1a1d29b697c',
	towns: [
		{
			id: '9da32d6e-b12d-4478-a943-621751242801',
			name: 'aurora',
			description: 'A fun new town!',
			type: 'settlement',
			level: 171,
			nationId: 'b9997aba-50a4-46ba-a6c8-88b1790a6698',
			capital: true,
			mayor: { uuid: 'e3775372-04f2-4f7e-b104-68cc19529751', name: 'Luuiee' },
			members: [{ uuid: 'e3775372-04f2-4f7e-b104-68cc19529751', name: 'Luuiee', role: 'MAYOR', online: false }],
			onlineMembers: 0,
			foundedAt: '2026-10-27T19:59:31.458Z',
			bank: 9521000.0,
			open: false,
			peaceful: false,
			pvp: false,
			likes: 0,
			visitors: 0,
			home: { x: 13992, z: -7578 },
			warps: [],
			ruinedAt: null,
		},
	],
};

export const nations = {
	revision: 'b1a1d29b697c',
	nations: [
		{
			id: '4ab67a0f-4cff-4bde-91df-d678b1b43cb0',
			name: 'aaaa',
			type: 'nation',
			capitalTownId: '0225e0fb-84ea-465e-8add-c7499c1adf0d',
			leader: { uuid: '736ca969-ce6d-4bde-91e7-2408b42c7c1d', name: 'liolet' },
			townIds: ['0225e0fb-84ea-465e-8add-c7499c1adf0d'],
			allyIds: [],
			enemyIds: [],
			occupiedTownIds: [],
			open: false,
			bank: 0.0,
		},
	],
};

export const claims = {
	revision: 'b1a1d29b697c',
	claims: [{ townId: '7263375a-dce7-4f9e-b8c5-c5a148463d29', x: 867, z: -479, outpost: false, home: true }],
};

export const recruit = {
	towns: [
		{
			id: 'c346ad8a-4fd7-4a09-8bf2-899277feeb04',
			name: 'Eshay',
			nationId: '48c38526-39d0-40f5-8821-7316d7627a08',
			nationName: 'QLD',
			mayor: { uuid: 'c4281b37-018c-4353-9943-1be166fdc263', name: 'Solence15612' },
			residents: 1,
			level: 521,
			description: 'We are Eshayyyys Brahhhh',
			interests: ['pvp'],
		},
	],
	nomads: [
		{
			uuid: '06b01413-451a-4ac7-a1f1-dd68c924e07e',
			name: 'CounterSign',
			networkLevel: 57,
			interests: ['competitive'],
			timezone: 'na-east',
			online: false,
			lastSeen: '2026-11-10T22:33:48.008Z',
		},
	],
	observedAt: '2026-11-13T01:57:01.633096863Z',
};

export const rankings = {
	boards: [
		{
			id: 'player_balances_alltime',
			type: 'player',
			stat: 'balances',
			length: 'alltime',
			periodStart: null,
			periodEnd: null,
			entries: [
				{ id: '47d5293b-89e3-4ae2-92b5-ecd417201dd9', name: 'TheIronSquirel', value: 6580174639.0, position: 1 },
			],
		},
	],
	observedAt: '2026-11-13T01:56:37.818Z',
};

export const wonders = {
	wonders: [
		{
			id: 'christ-wonder',
			name: 'ChristTheRedeemer',
			server: 'dev-earth-cube',
			world: 'earth',
			x: -9065.0,
			y: 145.0,
			z: 6854.0,
			runTimeSeconds: 900,
			winNationPayout: 250000.0,
			holdingNationPayout: 0.0,
			holderNationId: null,
			heldSince: null,
		},
	],
	sessions: [
		{
			id: 'SATURDAY-18:00',
			dayOfWeek: 'SATURDAY',
			startTime: '18:00',
			zone: 'America/New_York',
			startsAt: '2026-10-03T22:00:00Z',
			endsAt: '2026-10-03T23:00:00Z',
		},
	],
	observedAt: '2026-11-13T01:56:40.033923155Z',
};

const option = (kind: 'buff' | 'debuff') => ({
	id: `v2:MCMMO:mcmmo-${kind}`,
	kind,
	name: 'MCMMO',
	description: null,
	percent: -10,
});

export const policy = {
	active: {
		id: 'a|b',
		buff: option('buff'),
		debuff: option('debuff'),
		nationVotes: 9,
		startedAt: null,
		endsAt: '2026-10-05T04:00:00Z',
	},
	vote: {
		closesAt: '2026-10-05T04:00:00Z',
		options: [{ id: 'a|b', buff: option('buff'), debuff: option('debuff'), nationVotes: 7, playerVotes: 64 }],
	},
	history: [],
};

export const events = {
	events: [
		{ id: 'KoTH@2026-10-04T18:00:00Z@Castle', source: 'KoTH', name: 'Castle', startsAt: '2026-10-04T18:00:00Z' },
	],
};

export const players = {
	players: [
		{ uuid: UUID2, name: null, rank: null, staffRank: null, manaPlus: null, patron: null },
		{ uuid: UUID, name: 'Roree', rank: null, staffRank: null, manaPlus: null, patron: null },
	],
};

export const notFoundPlayer = {
	status: '404 Not Found',
	path: `/api/manalevel/${UUID}`,
	message: 'The requested player could not be found',
	timestamp: 1794535072,
	userID: UUID,
};

export const notFoundGamemode = {
	status: '404 Not Found',
	path: '/api/svas/nope',
	message: 'The requested gamemode could not be found',
	gamemode: 'nope',
	timestamp: 1794535076,
	validGamemodes: 'survival, skyblock, olympus, parkour, islands, earth, kitpvp, lifesteal',
};
