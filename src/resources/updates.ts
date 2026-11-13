import { endpoints } from '../endpoints';
import type { RequestOptions } from '../http';
import { optionalInt, zeroBasedPage } from '../input';
import { fromPage, type IterateOptions, oneBasedPage, paginate } from '../paginate';
import { type Page, pageSchema, type Update, updateSchema } from '../schemas';
import { Resource } from './resource';

export interface UpdatesQuery {
	realm?: string;
	page?: number;
	size?: number;
}

export class Updates extends Resource {
	async list(query: UpdatesQuery = {}, options?: RequestOptions): Promise<Page<Update>> {
		const page = await this.http.request(
			endpoints.updates,
			{
				schema: pageSchema(updateSchema),
				query: {
					realm: query.realm,
					page: zeroBasedPage(query.page),
					size: optionalInt(query.size, 'size', 1, 100),
				},
			},
			options,
		);
		return oneBasedPage(page);
	}

	iterate(query: Omit<UpdatesQuery, 'page'> = {}, options?: IterateOptions & RequestOptions) {
		return paginate(1, async (page) => fromPage(await this.list({ ...query, page }, options)), options);
	}
}
