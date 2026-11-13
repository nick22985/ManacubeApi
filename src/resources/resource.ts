import type { HttpClient } from '../http';

export abstract class Resource {
	constructor(protected readonly http: HttpClient) {}
}
