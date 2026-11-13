export interface IterateOptions {
	maxPages?: number;
}

export async function* paginate<T>(
	firstPage: number,
	fetchPage: (page: number) => Promise<{ items: T[]; more: boolean }>,
	{ maxPages = Infinity }: IterateOptions = {},
): AsyncGenerator<T, void, undefined> {
	for (let page = firstPage, fetched = 0; fetched < maxPages; page++, fetched++) {
		const { items, more } = await fetchPage(page);
		yield* items;
		if (!more || items.length === 0) return;
	}
}

export async function toArray<T>(iterable: AsyncIterable<T>, limit = Infinity): Promise<T[]> {
	const out: T[] = [];
	if (limit <= 0) return out;
	for await (const item of iterable) {
		out.push(item);
		if (out.length >= limit) break;
	}
	return out;
}

export const fromPage = <T>(page: { items: T[]; hasMore: boolean }) => ({ items: page.items, more: page.hasMore });

export const oneBasedPage = <P extends { page: number }>(page: P): P =>
	typeof page?.page === 'number' ? { ...page, page: page.page + 1 } : page;
