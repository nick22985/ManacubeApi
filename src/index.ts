import axios, { AxiosInstance } from "axios";

class ManaCubeApi {
	axiosConfig: AxiosInstance;
	/**
	 * @desc Creates a api client.
	 * @param apiKey wakatime api key
	 * @param baseUrl wakatime api base url
	 * @example
	 * const wakaTimeApi = new WakaTimeApi("1f89b85e-54a8-4f75-86a2-f9b7d47ba30e");
	 * const wakaTimeApi = new WakaTimeApi(apiKey, "https://wakatime.com/api/v1/");
	 */
	constructor(private apiKey: string, baseUrl = "https://wakatime.com/api/v1/") {
		this.axiosConfig = axios.create({
			baseURL: baseUrl,
			headers: {
				Authorization: `Basic ${Buffer.from(this.apiKey).toString("base64")}`,
			},
		});
	}
	/**
	 * @desc Gets a users stats.
	 * @scope email
	 * @param userId users wakatime id
	 * @returns A single user.
	 * @example getUser("1f89b85e-54a8-4f75-86a2-f9b7d47ba30e");
	 */
	getUser(userId: string): Promise<JSON> {
		if (!userId) {
			throw new Error("userId is required");
		}
		return this.axiosConfig.get(`users/${userId}`).then((response) => response.data);
	}
}

export { ManaCubeApi };