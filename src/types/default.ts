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
