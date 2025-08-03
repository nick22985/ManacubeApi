import { z } from 'zod';

// Input validation schemas
export const uuidInputSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format');
export const gamemodeInputSchema = z.string().min(1, 'Gamemode is required');
export const svaInputSchema = z.string().min(1, 'SVA is required');
export const gameInputSchema = z.string().min(1, 'Game is required');
export const pageInputSchema = z.number().int().positive('Page must be a positive integer');
export const totalInputSchema = z.number().int().positive('Total must be a positive integer');
export const seasonInputSchema = z.number().int().positive('Season must be a positive integer');
export const placeholderInputSchema = z.string().min(1, 'Placeholder is required');

export const gamemodeSvasSchema = z.object({
	itemType: z.string(),
	slot: z.string(),
	version: z.number(),
	material: z.string(),
	durability: z.number(),
	displayName: z.string(),
	lore: z.array(z.string()),
	enchants: z.any(),
	customModelData: z.number(),
	unbreakable: z.literal(true),
	leatherColor: z.any(),
	circulation: z.string(),
});

export const userSvaSchema = z.object({
	id: z.number(),
	itemType: z.string(),
	originalOwner: z.string(),
	owner: z.string(),
	obtainTime: z.number(),
	customModelData: z.number(),
});

export const svaSalesDataSchema = z.object({
	currency: z.string(),
	averageValue: z.number(),
	timeSold: z.number(),
});

export const playerStatisticsSchema = z.object({
	playerID: z.string(),
	gamemode: z.string(),
	statistics: z.array(z.any()),
});

export const svaCirculationDataSchema = z.object({});

export const uuidNameSchema = z.object({
	uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
	name: z.string(),
});

export const playerStatsSchema = z.object({
	uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
	totalExp: z.number(),
	stats: z.array(z.any()),
});

export const shopItemSchema = z.object({
	time: z.number(),
	shopID: z.string(),
	itemID: z.string(),
	newPrice: z.number(),
	oldPrice: z.number(),
	basePrice: z.number(),
	item: z.string(),
	periodMS: z.number(),
});

export const economyVolumeHistorySchema = z.object({
	time: z.number(),
	shopID: z.string(),
	itemID: z.string(),
	volume: z.number(),
	item: z.string(),
	periodMS: z.number(),
});

export const guildPlayerSchema = z.object({
	uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
	name: z.string(),
	guildId: z.number(),
	joinDate: z.string(),
	rank: z.string(),
});

export const guildSchema = z.object({
	id: z.number(),
	tag: z.string(),
	createDate: z.string(),
	rank: z.number(),
	level: z.number(),
	description: z.string(),
	homeServer: z.string(),
	members: z.array(guildPlayerSchema),
});

export const friendSchema = z.object({
	uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
	name: z.string(),
});

export const factionSchema = z.object({
	time: z.number(),
	week: z.string(),
	statistic: z.string(),
	player_uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
	factionName: z.string(),
	place: z.number(),
	value: z.number(),
	payout: z.number(),
});

export type gamemodeSvas = z.infer<typeof gamemodeSvasSchema>;
export type userSva = z.infer<typeof userSvaSchema>;
export type svaSalesData = z.infer<typeof svaSalesDataSchema>;
export type playerStatistics = z.infer<typeof playerStatisticsSchema>;
export type svaCirculationData = z.infer<typeof svaCirculationDataSchema>;
export type uuidName = z.infer<typeof uuidNameSchema>;
export type playerStats = z.infer<typeof playerStatsSchema>;
export type shopItem = z.infer<typeof shopItemSchema>;
export type economyVolumeHistory = z.infer<typeof economyVolumeHistorySchema>;
export type guildPlayer = z.infer<typeof guildPlayerSchema>;
export type guild = z.infer<typeof guildSchema>;
export type friend = z.infer<typeof friendSchema>;
export type faction = z.infer<typeof factionSchema>;
