interface gamemodeSvas {
	itemType: string;
	slot: string;
	version: number;
	material: string;
	durability: number;
	displayName: string;
	lore: Array<string>;
	enchants: any;
	customModelData: number;
	unbreakable: true;
	leatherColor: any;
}

interface userSva {
	id: number;
	itemType: string;
	originalOwner: string;
	owner: string;
	obtainTime: number;
	customModelData: number;
}

interface svaSalesData {
	currency: string;
	averageValue: number;
	timeSold: number;
}

interface svaCirculationData {}

interface uuidName {
	uuid: string;
	name: string;
}

interface playerStats {
	uuid: string;
	totalExp: number;
	stats: Array<any>;
}

interface shopItem {
	time: number;
	shopID: string;
	itemID: string;
	newPrice: number;
	oldPrice: number;
	basePrice: number;
	item: string;
	periodMS: number;
}

interface economyVolumeHistory {
	time: number;
	shopID: string;
	itemID: string;
	volume: number;
	item: string;
	periodMS: number;
}

interface guild {
	id: number;
	tag: string;
	createDate: string;
	rank: number;
	level: number;
	description: string;
	homeServer: string;
	members: Array<any>;
}

interface friend {
	uuid: string;
	name: string;
}

interface faction {
	time: number;
	week: string;
	statistic: string;
	player_uuid: string;
	factionName: string;
	place: number;
	value: number;
	payout: number;
}
