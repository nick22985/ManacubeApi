import { z } from 'zod';

const nullable = <T extends z.ZodType>(schema: T) => schema.nullable();

const object = <T extends z.core.$ZodLooseShape>(shape: T) =>
	z.looseObject(shape) as unknown as z.ZodObject<z.core.util.Writeable<T>>;

export const GAMEMODES = [
	'survival',
	'skyblock',
	'olympus',
	'parkour',
	'islands',
	'earth',
	'kitpvp',
	'lifesteal',
] as const;

export type Gamemode = (typeof GAMEMODES)[number] | (string & {});

export const apiErrorBodySchema = object({
	status: z.string(),
	path: z.string(),
	message: z.string(),
	exception: z.string().optional(),
	timestamp: z.union([z.number(), z.string()]).optional(),
	gamemode: z.string().optional(),
	validGamemodes: z.string().optional(),
	userID: z.string().optional(),
});

export const pageSchema = <T extends z.ZodType>(item: T) =>
	object({
		items: z.array(item),
		page: z.number(),
		hasMore: z.boolean(),
	});

export const leatherColorSchema = object({
	red: z.number(),
	green: z.number(),
	blue: z.number(),
	alpha: z.number(),
	rgb: z.number(),
	transparency: z.number(),
});

export const svaTypeSchema = object({
	itemType: z.string(),
	slot: z.string(),
	version: z.number(),
	circulation: z.number(),
	material: z.string(),
	durability: z.number(),
	displayName: z.string(),
	lore: z.array(z.string()),
	enchants: z.record(z.string(), z.number()),
	customModelData: z.number(),
	itemModel: nullable(z.string()).optional(),
	unbreakable: z.boolean(),
	leatherColor: nullable(leatherColorSchema),
});

export const playerSvaSchema = object({
	id: z.number(),
	itemType: z.string(),
	originalOwner: z.string(),
	owner: z.string(),
	obtainTime: z.number(),
	customModelData: nullable(z.number()),
});

export const svaSaleSchema = object({
	currency: z.string(),
	averageValue: z.number(),
	timesSold: z.number(),
});

export const playerInfoSchema = object({
	uuid: z.string(),
	name: z.string(),
});

export const playerIdentitySchema = object({
	uuid: z.string(),
	name: nullable(z.string()),
	rank: nullable(z.string()),
	staffRank: nullable(z.string()),
	manaPlus: nullable(z.string()),
	patron: nullable(z.string()),
});

export const playerIdentitiesSchema = object({
	players: z.array(playerIdentitySchema),
});

export const manaLevelStatisticSchema = object({
	key: z.string(),
	value: z.number(),
	progression: z.number(),
});

export const manaLevelSchema = object({
	uuid: z.string(),
	totalExp: z.number(),
	stats: z.array(manaLevelStatisticSchema),
});

export const economyPriceEntrySchema = object({
	time: z.number(),
	shopID: z.string(),
	itemID: z.string(),
	newPrice: z.number(),
	oldPrice: z.number(),
	basePrice: z.number(),
	item: z.string(),
	periodMS: z.number(),
});

export const economyVolumeEntrySchema = object({
	time: z.number(),
	shopID: z.string(),
	itemID: z.string(),
	volume: z.number(),
	item: z.string(),
	periodMS: z.number(),
});

export const guildMemberSchema = object({
	uuid: z.string(),
	name: z.string(),
	guildId: z.number(),
	joinDate: z.string(),
	rank: z.string(),
});

export const guildSchema = object({
	id: z.number(),
	tag: z.string(),
	createDate: z.string(),
	rank: z.number(),
	level: z.number(),
	description: nullable(z.string()),
	homeServer: nullable(z.string()),
	members: z.array(guildMemberSchema),
});

export const factionPayoutSchema = object({
	time: z.number(),
	week: z.string(),
	statistic: z.string(),
	player_uuid: z.string(),
	factionName: z.string(),
	place: z.number(),
	value: z.number(),
	payout: z.number(),
});

export const auctionTypeSchema = z.enum(['SELL', 'BID']);

export const auctionStatusSchema = z.enum(['ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED', 'COLLECTED', 'DESTROYED']);

export const auctionItemSchema = object({
	id: z.number(),
	creationTime: z.number(),
	sellerUUID: z.string(),
	item: z.string(),
	auctionType: auctionTypeSchema,
	economyType: z.string(),
	adminAuction: z.boolean(),
	price: z.number(),
	topBidderUUID: nullable(z.string()),
	winnerUUID: nullable(z.string()),
	status: auctionStatusSchema,
	expiryTime: z.number(),
});

export const auctionPageSchema = object({
	page: z.number().optional(),
	totalPages: z.number().optional(),
	totalAuctions: z.number().optional(),
	lastUpdated: z.number(),
	auctions: z.array(auctionItemSchema),
	full: z.boolean(),
	finalized: z.boolean(),
});

export const shopSchema = object({
	id: z.number(),
	ownerUuid: z.string(),
	server: z.string(),
	world: z.string(),
	x: z.number(),
	y: z.number(),
	z: z.number(),
	shopType: z.string(),
	amount: z.number(),
	currencyType: z.string(),
	buyPrice: nullable(z.number()),
	sellPrice: nullable(z.number()),
	material: z.string(),
	itemName: nullable(z.string()),
	stock: nullable(z.number()),
	stockUpdatedAt: nullable(z.string()),
	updatedAt: nullable(z.string()),
	lastTradeAt: nullable(z.string()),
});

export const shopTradeSchema = object({
	time: z.string(),
	shopId: z.number(),
	shopOwner: z.string(),
	action: z.string(),
	amount: z.number(),
	price: z.number(),
	pricePerItem: z.number(),
	currencyType: z.string(),
	server: z.string(),
	material: z.string(),
	itemName: nullable(z.string()),
});

export const updateSchema = object({
	id: z.number(),
	author: z.string(),
	categories: z.array(z.string()),
	scope: z.string(),
	kind: z.string(),
	description: z.string(),
	createdAt: z.string(),
});

export const townyPlayerRefSchema = object({
	uuid: z.string(),
	name: nullable(z.string()),
});

export const townyMemberSchema = object({
	uuid: z.string(),
	name: nullable(z.string()),
	role: z.string(),
	online: z.boolean(),
});

export const townyPointSchema = object({
	x: z.number(),
	z: z.number(),
});

export const townyWarpSchema = object({
	name: z.string(),
	likes: nullable(z.number()),
	visitors: nullable(z.number()),
});

export const townyTownSchema = object({
	id: z.string(),
	name: z.string(),
	description: nullable(z.string()),
	type: z.string(),
	level: z.number(),
	nationId: nullable(z.string()),
	capital: z.boolean(),
	mayor: nullable(townyPlayerRefSchema),
	members: z.array(townyMemberSchema),
	onlineMembers: z.number(),
	foundedAt: nullable(z.string()),
	bank: z.number(),
	open: z.boolean(),
	peaceful: z.boolean(),
	pvp: z.boolean(),
	likes: z.number(),
	visitors: z.number(),
	home: nullable(townyPointSchema),
	warps: z.array(townyWarpSchema),
	ruinedAt: nullable(z.string()),
});

export const townyTownsSchema = object({
	revision: z.string(),
	towns: z.array(townyTownSchema),
});

export const townyNationSchema = object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	capitalTownId: nullable(z.string()),
	leader: nullable(townyPlayerRefSchema),
	townIds: z.array(z.string()),
	allyIds: z.array(z.string()),
	enemyIds: z.array(z.string()),
	occupiedTownIds: z.array(z.string()),
	open: z.boolean(),
	bank: z.number(),
});

export const townyNationsSchema = object({
	revision: z.string(),
	nations: z.array(townyNationSchema),
});

export const townyClaimSchema = object({
	townId: z.string(),
	x: z.number(),
	z: z.number(),
	outpost: z.boolean(),
	home: z.boolean(),
});

export const townyClaimsSchema = object({
	revision: z.string(),
	claims: z.array(townyClaimSchema),
});

export const recruitTownSchema = object({
	id: z.string(),
	name: z.string(),
	nationId: nullable(z.string()),
	nationName: nullable(z.string()),
	mayor: nullable(townyPlayerRefSchema),
	residents: z.number(),
	level: nullable(z.number()),
	description: nullable(z.string()),
	interests: z.array(z.string()),
});

export const recruitNomadSchema = object({
	uuid: z.string(),
	name: nullable(z.string()),
	networkLevel: nullable(z.number()),
	interests: z.array(z.string()),
	timezone: nullable(z.string()),
	online: nullable(z.boolean()),
	lastSeen: nullable(z.string()),
});

export const recruitSchema = object({
	towns: z.array(recruitTownSchema),
	nomads: z.array(recruitNomadSchema),
	observedAt: z.string(),
});

export const rankingEntrySchema = object({
	id: z.string(),
	name: nullable(z.string()),
	value: z.number(),
	position: z.number(),
});

export const rankingBoardSchema = object({
	id: z.string(),
	type: z.string(),
	stat: z.string(),
	length: z.string(),
	periodStart: nullable(z.string()),
	periodEnd: nullable(z.string()),
	entries: z.array(rankingEntrySchema),
});

export const rankingsSchema = object({
	boards: z.array(rankingBoardSchema),
	observedAt: z.string(),
});

export const rankingBoardIdsSchema = object({
	boards: z.array(z.string()),
});

export const policyOptionSchema = object({
	id: z.string(),
	kind: z.enum(['buff', 'debuff']),
	name: nullable(z.string()),
	description: nullable(z.string()),
	percent: nullable(z.number()),
});

export const policyChoiceSchema = object({
	id: z.string(),
	buff: policyOptionSchema,
	debuff: policyOptionSchema,
	nationVotes: z.number(),
	playerVotes: z.number(),
});

export const policyTermSchema = object({
	id: z.string(),
	buff: policyOptionSchema,
	debuff: policyOptionSchema,
	nationVotes: z.number(),
	startedAt: nullable(z.string()),
	endsAt: z.string(),
});

export const policyVoteSchema = object({
	closesAt: z.string(),
	options: z.array(policyChoiceSchema),
});

export const policySchema = object({
	active: nullable(policyTermSchema),
	vote: nullable(policyVoteSchema),
	history: z.array(policyTermSchema),
});

export const wonderSchema = object({
	id: z.string(),
	name: z.string(),
	server: z.string(),
	world: z.string(),
	x: z.number(),
	y: z.number(),
	z: z.number(),
	runTimeSeconds: z.number(),
	winNationPayout: z.number(),
	holdingNationPayout: z.number(),
	holderNationId: nullable(z.string()),
	heldSince: nullable(z.string()),
});

export const wonderSessionSchema = object({
	id: z.string(),
	dayOfWeek: z.string(),
	startTime: z.string(),
	zone: z.string(),
	startsAt: z.string(),
	endsAt: z.string(),
});

export const wondersSchema = object({
	wonders: z.array(wonderSchema),
	sessions: z.array(wonderSessionSchema),
	observedAt: z.string(),
});

export const upcomingEventSchema = object({
	id: z.string(),
	source: z.string(),
	name: nullable(z.string()),
	startsAt: z.string(),
});

export const eventsSchema = object({
	events: z.array(upcomingEventSchema),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
export type Page<T> = { items: T[]; page: number; hasMore: boolean };
export type LeatherColor = z.infer<typeof leatherColorSchema>;
export type SvaType = z.infer<typeof svaTypeSchema>;
export type PlayerSva = z.infer<typeof playerSvaSchema>;
export type SvaSale = z.infer<typeof svaSaleSchema>;
export type PlayerInfo = z.infer<typeof playerInfoSchema>;
export type PlayerIdentity = z.infer<typeof playerIdentitySchema>;
export type ManaLevelStatistic = z.infer<typeof manaLevelStatisticSchema>;
export type ManaLevel = z.infer<typeof manaLevelSchema>;
export type EconomyPriceEntry = z.infer<typeof economyPriceEntrySchema>;
export type EconomyVolumeEntry = z.infer<typeof economyVolumeEntrySchema>;
export type GuildMember = z.infer<typeof guildMemberSchema>;
export type Guild = z.infer<typeof guildSchema>;
export type FactionPayout = z.infer<typeof factionPayoutSchema>;
export type AuctionType = z.infer<typeof auctionTypeSchema>;
export type AuctionStatus = z.infer<typeof auctionStatusSchema>;
export type AuctionItem = z.infer<typeof auctionItemSchema>;
export type AuctionPage = z.infer<typeof auctionPageSchema>;
export type Shop = z.infer<typeof shopSchema>;
export type ShopTrade = z.infer<typeof shopTradeSchema>;
export type Update = z.infer<typeof updateSchema>;
export type TownyPlayerRef = z.infer<typeof townyPlayerRefSchema>;
export type TownyMember = z.infer<typeof townyMemberSchema>;
export type TownyPoint = z.infer<typeof townyPointSchema>;
export type TownyWarp = z.infer<typeof townyWarpSchema>;
export type TownyTown = z.infer<typeof townyTownSchema>;
export type TownyTowns = z.infer<typeof townyTownsSchema>;
export type TownyNation = z.infer<typeof townyNationSchema>;
export type TownyNations = z.infer<typeof townyNationsSchema>;
export type TownyClaim = z.infer<typeof townyClaimSchema>;
export type TownyClaims = z.infer<typeof townyClaimsSchema>;
export type RecruitTown = z.infer<typeof recruitTownSchema>;
export type RecruitNomad = z.infer<typeof recruitNomadSchema>;
export type Recruit = z.infer<typeof recruitSchema>;
export type RankingEntry = z.infer<typeof rankingEntrySchema>;
export type RankingBoard = z.infer<typeof rankingBoardSchema>;
export type Rankings = z.infer<typeof rankingsSchema>;
export type PolicyOption = z.infer<typeof policyOptionSchema>;
export type PolicyChoice = z.infer<typeof policyChoiceSchema>;
export type PolicyTerm = z.infer<typeof policyTermSchema>;
export type PolicyVote = z.infer<typeof policyVoteSchema>;
export type Policy = z.infer<typeof policySchema>;
export type Wonder = z.infer<typeof wonderSchema>;
export type WonderSession = z.infer<typeof wonderSessionSchema>;
export type Wonders = z.infer<typeof wondersSchema>;
export type UpcomingEvent = z.infer<typeof upcomingEventSchema>;
export type Events = z.infer<typeof eventsSchema>;
