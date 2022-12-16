import axios, { AxiosInstance } from 'axios';
import { economyVolumeHistory, faction, friend, gamemodeSvas, guild, playerStats, shopItem, svaSalesData, userSva, uuidName } from './types/default';

class ManaCubeApi {
	axiosConfig: AxiosInstance;
	disableSafeUUIDCheck: boolean;
	/**
	 * @desc Creates a api client.
	 * @param baseUrl manacube api api base url
	 * @param disableSafeUUIDCheck disable safe uuid check
	 * @example
	 * const manacubeApi = new ManaCubeApi("https://api.manacube.com/api/");
	 */
	constructor(baseUrl = 'https://api.manacube.com/api/', disableSafeUUIDCheck = false) {
		this.axiosConfig = axios.create({
			baseURL: baseUrl,
		});
		this.disableSafeUUIDCheck = disableSafeUUIDCheck;
	}

	private safe_uuid(uuid: string) {
		if (this.disableSafeUUIDCheck) return uuid;
		let uuidMatch = /([0-9a-f]{8})(?:-|)([0-9a-f]{4})(?:-|)(4[0-9a-f]{3})(?:-|)([89ab][0-9a-f]{3})(?:-|)([0-9a-f]{12})/;
		let uuidReplace = '$1-$2-$3-$4-$5';
		if (!uuid.match(uuidMatch)) return 'Invalid UUID';
		return uuid.replace(uuidMatch, uuidReplace);
	}

	safeUUIDCheck(UUIDCheck?: boolean) {
		if (UUIDCheck == undefined) return (this.disableSafeUUIDCheck = !this.disableSafeUUIDCheck);
		return (this.disableSafeUUIDCheck = UUIDCheck);
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @returns Get all SVAs that a player owns on a specific gamemode
	 */
	getAllGamemodeSvas(gamemode: string): Promise<Array<gamemodeSvas>> {
		if (!gamemode) throw new Error('gamemode is required');
		return this.axiosConfig
			.get(`svas/${gamemode}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid MCC UUID
	 * @param gamemode gamemode to get stats for
	 * @returns A single users sva's
	 */
	getUserSvas(uuid: string, gamemode: string): Promise<Array<userSva>> {
		if (!uuid) throw new Error('uuid is required');
		if (!gamemode) throw new Error('gamemode is required');
		return this.axiosConfig
			.get(`svas/${gamemode}/${this.safe_uuid(uuid)}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}
	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param sva SVA to get stats for
	 * @returns Get a list of sales data for a specific sva within a specific gamemode
	 */
	getSvaSalesData(gamemode: string, sva: string): Promise<Array<svaSalesData>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.axiosConfig
			.get(`svas/sales/${gamemode}/${sva}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param sva SVA to get stats for
	 * @returns Get total circulation of a specific sva within a specific gamemode
	 */
	getSvaCirculationData(gamemode: string, sva: string): Promise<number> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.axiosConfig
			.get(`svas/circulation/${gamemode}/${sva}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid MCC UUID
	 * @param game Game to get stats for
	 * @returns Get a players stats for a specific game
	 */
	getPlayerStatisticsForGamemode(uuid: string, game: string): Promise<any> {
		if (!uuid) throw new Error('uuid is required');
		if (!game) throw new Error('game is required');
		return this.axiosConfig
			.get(`statistics/${this.safe_uuid(uuid)}/${game}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @returns List of all
	 */
	getListOfAllGamemodes(): Promise<Array<string>> {
		return this.axiosConfig
			.get(`statistics/gamemodes`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @returns List of patrons uuid's
	 */
	getAllPatrons(): Promise<Array<string>> {
		return this.axiosConfig
			.get(`patrons/uuids`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @returns Gets a list of all patron+ uuid and names
	 */
	getPatronPlus(): Promise<Array<uuidName>> {
		return this.axiosConfig
			.get(`patrons/patronsplus`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}
	/**
	 *
	 * @returns Get a list of all patrons plus names
	 */
	getPatrons(): Promise<Array<uuidName>> {
		return this.axiosConfig
			.get(`patrons/patrons`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerLevels(uuid: string): Promise<playerStats> {
		if (!uuid) throw new Error('uuid is required');

		return this.axiosConfig
			.get(`manalevel/${this.safe_uuid(uuid)}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}
	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @returns Get the current sell prices from a gamemode's economy
	 */
	async economyCurrentSellPrices(gamemode: string): Promise<Array<shopItem>> {
		return this.axiosConfig
			.get(`manaeconomy/prices/${gamemode}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 * @param gamemode Gamemode to get stats for
	 * @returns Get the volume history of a gamemode's economy
	 */
	async economyVolumeHistory(gamemode: string, page: number): Promise<Array<economyVolumeHistory>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.axiosConfig
			.get(`manaeconomy/history/volume/${gamemode}/${page}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param page Page to get
	 * @returns Get the price history of a gamemode's economy
	 */
	async economyPriceHistory(gamemode: string, page: number): Promise<Array<shopItem>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.axiosConfig
			.get(`manaeconomy/history/prices/${gamemode}/${page}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param total Total amount of guilds to get
	 * @returns Get a list of x guilds stats
	 */
	async getTopGuilds(total: number): Promise<Array<guild>> {
		if (!total) throw new Error('total is required');
		return this.axiosConfig
			.get(`guilds/top/${total}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerGuild(uuid: string): Promise<guild> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig
			.get(`guilds/player/${this.safe_uuid(uuid)}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's friend list
	 */
	async getUserFriends(uuid: string): Promise<Array<friend>> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig
			.get(`friends/${this.safe_uuid(uuid)}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param placeholder placeholder
	 * @returns placeholder
	 */
	async getGracePlaceholder(placeholder: string): Promise<string> {
		if (!placeholder) {
			throw new Error('placeholder is required');
		}
		return this.axiosConfig
			.get(`factions/placeholder/${placeholder}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param season Factions Season payouts to get stats for
	 * @returns Get a list of factions season payouts
	 */
	async getFactionsSeasonPayouts(season: number): Promise<Array<faction>> {
		if (!season) throw new Error('season is required');
		return this.axiosConfig
			.get(`factions/payouts/${season}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's cubit stats
	 */
	async getPlayersCubitBalance(uuid: string): Promise<number> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig
			.get(`cubits/${this.safe_uuid(uuid)}`)
			.then((response: { data: any }) => response.data)
			.catch((e: any) => e);
	}
}

export { ManaCubeApi };
