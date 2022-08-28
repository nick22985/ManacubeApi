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
	 * @param uuid MCC UUID
	 * @param gamemode gamemode to get stats for
	 * @returns A single users sva's
	 */
	getUserSvas(uuid: string, gamemode: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		if (!gamemode) {
			throw new Error('gamemode is required');
		}
		return this.axiosConfig.get(`svas/${this.safe_uuid(uuid)}/${gamemode}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param gamemode Gamemode to get stats for
	 * @returns Get all SVAs that a player owns on a specific gamemode
	 */
	getAllGamemodeSvas(gamemode: string): Promise<JSON> {
		if (!gamemode) {
			throw new Error('gamemode is required');
		}
		return this.axiosConfig.get(`svas/${gamemode}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @returns List of patrons uuid's
	 */
	getPatrons(): Promise<JSON> {
		return this.axiosConfig.get(`patrons/uuids`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	getPlayerLevels(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		return this.axiosConfig.get(`manalevel/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param total Total amount of guilds to get
	 * @returns Get a list of x guilds stats
	 */
	getTopGuilds(total: number): Promise<JSON> {
		if (!total) {
			throw new Error('total is required');
		}
		return this.axiosConfig.get(`guilds/top/${total}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's stats
	 */
	getPlayerGuild(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		return this.axiosConfig.get(`guild/player/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's friend list
	 */
	getUserFriends(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		return this.axiosConfig.get(`friends/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param season Factions Season payouts to get stats for
	 * @returns Get a list of factions season payouts
	 */
	getFactionsSeasonPayouts(season: number): Promise<JSON> {
		if (!season) {
			throw new Error('season is required');
		}
		return this.axiosConfig.get(`factions/payouts/${season}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param placeholder placeholder
	 * @returns placeholder
	 */
	getGracePlaceholder(placeholder: string): Promise<JSON> {
		if (!placeholder) {
			throw new Error('placeholder is required');
		}
		return this.axiosConfig.get(`factions/placeholder/${placeholder}`).then((response: { data: any }) => response.data);
	}

	/**
	 *
	 * @param uuid UUID of player to get stats for
	 * @returns Get a single player's cubit stats
	 */
	getPlayersCubitBalance(uuid: string): Promise<JSON> {
		if (!uuid) {
			throw new Error('uuid is required');
		}
		return this.axiosConfig.get(`cubits/${this.safe_uuid(uuid)}`).then((response: { data: any }) => response.data);
	}
}

export { ManaCubeApi };
