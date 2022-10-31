import axios, { AxiosInstance } from 'axios';
import { gamemodeSvas, userSva, svaSalesData, uuidName, playerStats, shopItem, economyVolumeHistory, guild, faction, friend } from './types/default';

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
	async getAllGamemodeSvas(gamemode: string): Promise<Array<gamemodeSvas>> {
		if (!gamemode) throw new Error('gamemode is required');
		return this.axiosConfig.get(`svas/${gamemode}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid MCC UUID
	 * @param gamemode gamemode to get stats for
	 * @returns A single users sva's
	 */
	async getUserSvas(uuid: string, gamemode: string): Promise<Array<userSva>> {
		if (!uuid) throw new Error('uuid is required');
		if (!gamemode) throw new Error('gamemode is required');
		return this.axiosConfig.get(`svas/${gamemode}/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}
	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param sva SVA to get stats for
	 * @returns Get a list of sales data for a specific sva within a specific gamemode
	 */
	async getSvaSalesData(gamemode: string, sva: string): Promise<Array<svaSalesData>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.axiosConfig.get(`svas/sales/${gamemode}/${sva}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param sva SVA to get stats for
	 * @returns Get total circulation of a specific sva within a specific gamemode
	 */
	async getSvaCirculationData(gamemode: string, sva: string): Promise<number> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.axiosConfig.get(`svas/circulation/${gamemode}/${sva}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns List of patrons uuid's
	 */
	getAllPatrons(): Promise<Array<string>> {
		return this.axiosConfig.get(`patrons/uuids`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns Gets a list of all patron+ uuid and names
	 */
	getPatronPlus(): Promise<Array<uuidName>> {
		return this.axiosConfig.get(`patrons/patronplus`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns Get a list of all patrons plus names
	 */
	getPatrons(): Promise<Array<uuidName>> {
		return this.axiosConfig.get(`patrons/patron`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerLevels(uuid: string): Promise<playerStats> {
		if (!uuid) throw new Error('uuid is required');

		return this.axiosConfig.get(`manalevel/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}
	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @returns Get the current sell prices from a gamemode's economy
	 */
	async economyCurrentSellPrices(gamemode: string): Promise<Array<shopItem>> {
		return this.axiosConfig.get(`manaeconomy/prices/${gamemode}`).then((response: { data: any }) => response.data);
	}

	/**
	 * @param gamemode Gamemode to get stats for
	 * @returns Get the volume history of a gamemode's economy
	 */
	async economyVolumeHistory(gamemode: string, page: number): Promise<Array<economyVolumeHistory>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.axiosConfig.get(`manaeconomy/history/volume/${gamemode}/${page}`).then((response: { data: any }) => response.data);
	}

	async economyPriceHistory(gamemode: string, page: number): Promise<Array<shopItem>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.axiosConfig.get(`manaeconomy/history/prices/${gamemode}/${page}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param total Total amount of guilds to get
	 * @returns Get a list of x guilds stats
	 */
	async getTopGuilds(total: number): Promise<Array<guild>> {
		if (!total) throw new Error('total is required');
		return this.axiosConfig.get(`guilds/top/${total}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerGuild(uuid: string): Promise<guild> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig.get(`guilds/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's friend list
	 */
	async getUserFriends(uuid: string): Promise<Array<friend>> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig.get(`friends/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
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
		return this.axiosConfig.get(`factions/placeholder/${placeholder}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param season Factions Season payouts to get stats for
	 * @returns Get a list of factions season payouts
	 */
	async getFactionsSeasonPayouts(season: number): Promise<Array<faction>> {
		if (!season) throw new Error('season is required');
		return this.axiosConfig.get(`factions/payouts/${season}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's cubit stats
	 */
	async getPlayersCubitBalance(uuid: string): Promise<number> {
		if (!uuid) throw new Error('uuid is required');
		return this.axiosConfig.get(`cubits/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}
}

export { ManaCubeApi };
