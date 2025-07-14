import axios, { AxiosInstance } from 'axios';
import debug from 'debug';
import { economyVolumeHistory, faction, friend, gamemodeSvas, guild, playerStats, shopItem, svaSalesData, userSva, uuidName } from './types/default';

interface ServerRateLimitState {
	serverRateLimitHit: boolean;
	serverRateLimitUntil: number;
}

interface QueuedRequest {
	resolve: (value: any) => void;
	reject: (error: any) => void;
	url: string;
	retryCount?: number;
}

interface RequestOptions {
	enableQueueing?: boolean;
}

class ManaCubeApi {
	axiosConfig: AxiosInstance;
	disableSafeUUIDCheck: boolean;
	private serverRateLimit: ServerRateLimitState;
	private enableQueueing: boolean;
	private requestQueue: QueuedRequest[];
	private isProcessingQueue: boolean;
	private debug: debug.Debugger;
	private debugRateLimit: debug.Debugger;
	private debugQueue: debug.Debugger;
	private debugRequest: debug.Debugger;
	private progressIntervals: Set<NodeJS.Timeout>;

	constructor(baseUrl = 'https://api.manacube.com/api/', disableSafeUUIDCheck = false, enableQueueing = false) {
		this.axiosConfig = axios.create({
			baseURL: baseUrl,
		});
		this.disableSafeUUIDCheck = disableSafeUUIDCheck;
		this.enableQueueing = enableQueueing;
		this.requestQueue = [];
		this.isProcessingQueue = false;
		this.progressIntervals = new Set();
		this.serverRateLimit = {
			serverRateLimitHit: false,
			serverRateLimitUntil: 0
		};
		
		this.debug = debug('manacube:api');
		this.debugRateLimit = debug('manacube:ratelimit');
		this.debugQueue = debug('manacube:queue');
		this.debugRequest = debug('manacube:request');
		
		this.debug('ManaCubeApi initialized with baseUrl: %s, queueing: %s', baseUrl, enableQueueing);
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

	setQueueing(enabled: boolean): boolean {
		this.debug('Setting queueing to: %s', enabled);
		this.enableQueueing = enabled;
		return this.enableQueueing;
	}

	getQueueing(): boolean {
		return this.enableQueueing;
	}

	private isServerRateLimited(): boolean {
		const now = Date.now();
		if (this.serverRateLimit.serverRateLimitHit && now < this.serverRateLimit.serverRateLimitUntil) {
			return true;
		}
		if (this.serverRateLimit.serverRateLimitHit && now >= this.serverRateLimit.serverRateLimitUntil) {
			this.debugRateLimit('Server rate limit expired, resetting');
			this.serverRateLimit.serverRateLimitHit = false;
			this.serverRateLimit.serverRateLimitUntil = 0;
		}
		return false;
	}

	private handleServerRateLimit(retryAfter?: number): void {
		const now = Date.now();
		const defaultBackoff = 60000; // 1 minute default
		const backoffTime = retryAfter ? retryAfter * 1000 : defaultBackoff;
		
		this.serverRateLimit.serverRateLimitHit = true;
		this.serverRateLimit.serverRateLimitUntil = now + backoffTime;
		
		this.debugRateLimit('Server rate limit detected, backing off for %dms until %d', backoffTime, this.serverRateLimit.serverRateLimitUntil);
	}

	private showWaitProgress(totalWaitTime: number): void {
		const startTime = Date.now();
		const updateInterval = Math.min(5000, Math.max(1000, totalWaitTime / 10)); // Update every 1-5 seconds
		
		this.debugRateLimit('Starting wait progress updates every %dms for %dms total wait', updateInterval, totalWaitTime);
		
		const progressInterval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, totalWaitTime - elapsed);
			const percentComplete = Math.min(100, (elapsed / totalWaitTime) * 100);
			
			if (remaining <= 0) {
				this.debugRateLimit('Wait complete! Ready to process requests');
				clearInterval(progressInterval);
				this.progressIntervals.delete(progressInterval);
				return;
			}
			
			const remainingSeconds = Math.ceil(remaining / 1000);
			const remainingMinutes = Math.floor(remainingSeconds / 60);
			const remainingSecondsOnly = remainingSeconds % 60;
			
			let timeDisplay;
			if (remainingMinutes > 0) {
				timeDisplay = `${remainingMinutes}m ${remainingSecondsOnly}s`;
			} else {
				timeDisplay = `${remainingSecondsOnly}s`;
			}
			
			this.debugRateLimit('Rate limit wait progress: %.1f%% complete, %s remaining (%d queued requests)', 
				percentComplete, timeDisplay, this.requestQueue.length);
		}, updateInterval);
		
		this.progressIntervals.add(progressInterval);
		
		// Clean up interval when wait is complete
		setTimeout(() => {
			clearInterval(progressInterval);
			this.progressIntervals.delete(progressInterval);
		}, totalWaitTime + 1000);
	}

	private clearAllProgressIntervals(): void {
		this.progressIntervals.forEach(interval => clearInterval(interval));
		this.progressIntervals.clear();
	}

	private isRateLimitError(error: any): { isRateLimit: boolean; retryAfter?: number } {
		if (!error.response) return { isRateLimit: false };
		
		const status = error.response.status;
		const headers = error.response.headers || {};
		
		// Check for common rate limit status codes
		if (status === 429 || status === 503) {
			const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];
			this.debugRateLimit('Rate limit error detected: status %d, retry-after: %s', status, retryAfter);
			return { 
				isRateLimit: true, 
				retryAfter: retryAfter ? parseInt(retryAfter) : undefined 
			};
		}
		
		// Check for rate limit in error message
		const message = error.message || '';
		if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many requests')) {
			this.debugRateLimit('Rate limit error detected in message: %s', message);
			return { isRateLimit: true };
		}
		
		return { isRateLimit: false };
	}

	private getServerWaitTime(): number {
		const now = Date.now();
		if (this.isServerRateLimited()) {
			const serverWaitTime = this.serverRateLimit.serverRateLimitUntil - now;
			this.debugRateLimit('Server rate limit wait time: %dms', serverWaitTime);
			return serverWaitTime;
		}
		return 0;
	}

	private canMakeRequest(): boolean {
		if (this.isServerRateLimited()) {
			this.debugRateLimit('Cannot make request: server rate limited until %d', this.serverRateLimit.serverRateLimitUntil);
			return false;
		}
		
		this.debugRateLimit('Can make request: no server rate limit active');
		return true;
	}

	private async processQueue(): Promise<void> {
		if (this.isProcessingQueue || this.requestQueue.length === 0) {
			if (this.isProcessingQueue) {
				this.debugQueue('Queue processing already in progress');
			}
			return;
		}
		
		this.debugQueue('Starting queue processing with %d requests', this.requestQueue.length);
		this.isProcessingQueue = true;
		
		let loopCount = 0;
		const maxLoops = 1000; // Safety mechanism

		while (this.requestQueue.length > 0 && loopCount < maxLoops) {
			loopCount++;
			
			// Check if we're server rate limited
			if (this.isServerRateLimited()) {
				const waitTime = this.getServerWaitTime();
				this.debugQueue('Server rate limited, waiting %dms', waitTime + 100);
				
				// Add progress updates for long waits
				if (waitTime > 5000) { // Only show progress for waits longer than 5 seconds
					this.showWaitProgress(waitTime);
				}
				
				await new Promise(resolve => setTimeout(resolve, waitTime + 100));
				continue;
			}
			
			// Process all queued requests since there's no client-side rate limiting
			const currentBatch = this.requestQueue.splice(0, this.requestQueue.length);
			
			if (currentBatch.length === 0) break;
			
			this.debugQueue('Processing batch of %d requests', currentBatch.length);
			
			const batchPromises = currentBatch.map(async (queuedRequest, index) => {
				try {
					this.debugRequest('Executing queued request %d: %s', index, queuedRequest.url);
					const result = await this.axiosConfig.get(queuedRequest.url).then((response: { data: any }) => response.data);
					this.debugRequest('Queued request %d completed successfully', index);
					queuedRequest.resolve(result);
				} catch (error) {
					this.debugRequest('Queued request %d failed: %s', index, error);
					
					const rateLimitCheck = this.isRateLimitError(error);
					if (rateLimitCheck.isRateLimit) {
						this.handleServerRateLimit(rateLimitCheck.retryAfter);
						
						// Re-queue the request if it hasn't been retried too many times
						const retryCount = (queuedRequest.retryCount || 0) + 1;
						const maxRetries = 3;
						
						if (retryCount <= maxRetries) {
							this.debugQueue('Re-queuing rate limited request (attempt %d/%d): %s', retryCount, maxRetries, queuedRequest.url);
							// Add to end of queue to avoid immediate retry
							this.requestQueue.push({ 
								...queuedRequest, 
								retryCount 
							});
						} else {
							this.debugQueue('Max retries exceeded for request: %s', queuedRequest.url);
							queuedRequest.reject(error);
						}
					} else {
						queuedRequest.reject(error);
					}
				}
			});
			
			await Promise.all(batchPromises);
			this.debugQueue('Batch of %d requests completed', currentBatch.length);
		}
		
		if (loopCount >= maxLoops) {
			this.debugQueue('Queue processing stopped due to loop limit, remaining requests: %d', this.requestQueue.length);
		} else {
			this.debugQueue('Queue processing completed');
		}
		this.isProcessingQueue = false;
	}

	private async makeRequest<T>(url: string, options?: RequestOptions): Promise<T> {
		this.debugRequest('Making request to: %s', url);
		
		if (this.canMakeRequest()) {
			this.debugRequest('Executing immediate request: %s', url);
			try {
				const result = await this.axiosConfig.get(url).then((response: { data: any }) => response.data);
				this.debugRequest('Request completed successfully: %s', url);
				return result;
			} catch (error) {
				this.debugRequest('Request failed: %s - %s', url, error);
				
				const rateLimitCheck = this.isRateLimitError(error);
				if (rateLimitCheck.isRateLimit) {
					this.handleServerRateLimit(rateLimitCheck.retryAfter);
					
					// If queueing is enabled, automatically re-queue the request
					const shouldQueue = options?.enableQueueing !== undefined ? options.enableQueueing : this.enableQueueing;
					if (shouldQueue) {
						this.debugQueue('Auto-queuing rate limited immediate request: %s', url);
						return new Promise<T>((resolve, reject) => {
							this.requestQueue.push({ resolve, reject, url, retryCount: 1 });
							this.debugQueue('Queue length now: %d', this.requestQueue.length);
							this.processQueue();
						});
					}
				}
				
				throw error;
			}
		}
		
		// Server rate limited - queue if enabled
		const shouldQueue = options?.enableQueueing !== undefined ? options.enableQueueing : this.enableQueueing;
		this.debugRequest('Server rate limited for: %s, shouldQueue: %s', url, shouldQueue);
		
		if (shouldQueue) {
			this.debugQueue('Adding request to queue: %s', url);
			return new Promise<T>((resolve, reject) => {
				this.requestQueue.push({ resolve, reject, url });
				this.debugQueue('Queue length now: %d', this.requestQueue.length);
				this.processQueue();
			});
		} else {
			const waitTime = this.getServerWaitTime();
			this.debugRateLimit('Server rate limit active for: %s, wait time: %dms', url, waitTime);
			throw new Error(`Server rate limit active. Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request.`);
		}
	}

	getAllGamemodeSvas(gamemode: string, options?: RequestOptions): Promise<Array<gamemodeSvas>> {
		if (!gamemode) throw new Error('gamemode is required');
		return this.makeRequest(`svas/${gamemode}`, options);
	}

	getUserSvas(uuid: string, gamemode: string, options?: RequestOptions): Promise<Array<userSva>> {
		if (!uuid) throw new Error('uuid is required');
		if (!gamemode) throw new Error('gamemode is required');
		return this.makeRequest(`svas/${gamemode}/${this.safe_uuid(uuid)}`, options);
	}

	getSvaSalesData(gamemode: string, sva: string, options?: RequestOptions): Promise<Array<svaSalesData>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.makeRequest(`svas/sales/${gamemode}/${sva}`, options);
	}

	getSvaCirculationData(gamemode: string, sva: string, options?: RequestOptions): Promise<number> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!sva) throw new Error('sva is required');
		return this.makeRequest(`svas/circulation/${gamemode}/${sva}`, options);
	}

	getPlayerStatisticsForGamemode(uuid: string, game: string, options?: RequestOptions): Promise<any> {
		if (!uuid) throw new Error('uuid is required');
		if (!game) throw new Error('game is required');
		return this.makeRequest(`statistics/${this.safe_uuid(uuid)}/${game}`, options);
	}

	getListOfAllGamemodes(options?: RequestOptions): Promise<Array<string>> {
		return this.makeRequest(`statistics/gamemodes`, options);
	}

	getAllPatrons(options?: RequestOptions): Promise<Array<string>> {
		return this.makeRequest(`patrons/uuids`, options);
	}

	getPatronPlus(options?: RequestOptions): Promise<Array<uuidName>> {
		return this.makeRequest(`patrons/patronsplus`, options);
	}

	getPatrons(options?: RequestOptions): Promise<Array<uuidName>> {
		return this.makeRequest(`patrons/patrons`, options);
	}

	async getPlayerLevels(uuid: string, options?: RequestOptions): Promise<playerStats> {
		if (!uuid) throw new Error('uuid is required');
		return this.makeRequest(`manalevel/${this.safe_uuid(uuid)}`, options);
	}

	async economyCurrentSellPrices(gamemode: string, options?: RequestOptions): Promise<Array<shopItem>> {
		return this.makeRequest(`manaeconomy/prices/${gamemode}`, options);
	}

	async economyVolumeHistory(gamemode: string, page: number, options?: RequestOptions): Promise<Array<economyVolumeHistory>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.makeRequest(`manaeconomy/history/volume/${gamemode}/${page}`, options);
	}

	async economyPriceHistory(gamemode: string, page: number, options?: RequestOptions): Promise<Array<shopItem>> {
		if (!gamemode) throw new Error('gamemode is required');
		if (!page) throw new Error('page is required');
		return this.makeRequest(`manaeconomy/history/prices/${gamemode}/${page}`, options);
	}

	async getTopGuilds(total: number, options?: RequestOptions): Promise<Array<guild>> {
		if (!total) throw new Error('total is required');
		return this.makeRequest(`guilds/top/${total}`, options);
	}

	async getPlayerGuild(uuid: string, options?: RequestOptions): Promise<guild> {
		if (!uuid) throw new Error('uuid is required');
		return this.makeRequest(`guilds/player/${this.safe_uuid(uuid)}`, options);
	}

	async getUserFriends(uuid: string, options?: RequestOptions): Promise<Array<friend>> {
		if (!uuid) throw new Error('uuid is required');
		return this.makeRequest(`friends/${this.safe_uuid(uuid)}`, options);
	}

	async getGracePlaceholder(placeholder: string, options?: RequestOptions): Promise<string> {
		if (!placeholder) {
			throw new Error('placeholder is required');
		}
		return this.makeRequest(`factions/placeholder/${placeholder}`, options);
	}

	async getFactionsSeasonPayouts(season: number, options?: RequestOptions): Promise<Array<faction>> {
		if (!season) throw new Error('season is required');
		return this.makeRequest(`factions/payouts/${season}`, options);
	}

	async getPlayersCubitBalance(uuid: string, options?: RequestOptions): Promise<number> {
		if (!uuid) throw new Error('uuid is required');
		return this.makeRequest(`cubits/${this.safe_uuid(uuid)}`, options);
	}
}

export { ManaCubeApi };