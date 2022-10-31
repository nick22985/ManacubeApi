import axios, { AxiosInstance } from 'axios';

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
		if (!UUIDCheck) return (this.disableSafeUUIDCheck = !this.disableSafeUUIDCheck);
		this.disableSafeUUIDCheck = UUIDCheck;
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @returns Get all SVAs that a player owns on a specific gamemode
	 */
	async getAllGamemodeSvas(gamemode: string): Promise<Array<gamemodeSvas>> {
		if (!gamemode) {
			throw new Error('gamemode is required');
		}
		const response = await this.axiosConfig.get(`svas/${gamemode}`);
		return response.data as gamemodeSvas[];
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
		const response = await this.axiosConfig.get(`svas/${this.safe_uuid(uuid)}/${gamemode}`);
		return response.data as Array<userSva>;
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
		const response = await this.axiosConfig.get(`svas/sales/${gamemode}/${sva}`);
		return response.data as Array<svaSalesData>;
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @param sva SVA to get stats for
	 * @returns Get total circulation of a specific sva within a specific gamemode
	 */
	async getSvaCirculationData(gamemode: string, sva: string): Promise<svaCirculationData> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		const response = await this.axiosConfig.get(`svas/circulation/${gamemode}/${sva}`);
		return response.data as svaCirculationData;
	}

	/**
	 *
	 * @returns List of patrons uuid's
	 */
	getAllPatrons(): Promise<JSON> {
		return this.axiosConfig.get(`patrons/uuids`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns Get a list of all patrons plus names
	 */
	getPatrons(): Promise<JSON> {
		return this.axiosConfig.get(`patrons/patron`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns Gets a list of all patron+ uuid and names
	 */
	getPatronPlus(): Promise<JSON> {
		return this.axiosConfig.get(`patrons/patronplus`).then((response: { data: any }) => response.data);
	}
	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerLevels(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		const response = await this.axiosConfig.get(`manalevel/${this.safe_uuid(uuid)}`);
		return response.data;
	}

	/**
	 *
	 * @param total Total amount of guilds to get
	 * @returns Get a list of x guilds stats
	 */
	async getTopGuilds(total: number): Promise<JSON> {
		if (!total) {
			throw new Error('total is required');
		}
		const response = await this.axiosConfig.get(`guilds/top/${total}`);
		return response.data;
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	async getPlayerGuild(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		const response = await this.axiosConfig.get(`guild/player/${this.safe_uuid(uuid)}`);
		return response.data;
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's friend list
	 */
	async getUserFriends(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		const response = await this.axiosConfig.get(`friends/${this.safe_uuid(uuid)}`);
		return response.data;
	}

	/**
	 *
	 * @param season Factions Season payouts to get stats for
	 * @returns Get a list of factions season payouts
	 */
	async getFactionsSeasonPayouts(season: number): Promise<JSON> {
		if (!season) {
			throw new Error('season is required');
		}
		const response = await this.axiosConfig.get(`factions/payouts/${season}`);
		return response.data;
	}

	/**
	 *
	 * @param placeholder placeholder
	 * @returns placeholder
	 */
	async getGracePlaceholder(placeholder: string): Promise<JSON> {
		if (!placeholder) {
			throw new Error('placeholder is required');
		}
		const response = await this.axiosConfig.get(`factions/placeholder/${placeholder}`);
		return response.data;
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's cubit stats
	 */
	async getPlayersCubitBalance(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		const response = await this.axiosConfig.get(`cubits/${this.safe_uuid(uuid)}`);
		return response.data;
	}
}

export { ManaCubeApi };
