<div align="center" id="top">
  <!-- <img src="./.github/app.gif" alt="ManacubeApi" /> -->

&#xa0;

</div>

<h1 align="center">ManacubeApi</h1>
<h2 align="center">This project has no association to the official manacube developers</h2>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/nick22985/ManacubeApi?color=56BEB8">

  <img alt="Github language count" src="https://img.shields.io/github/languages/count/nick22985/ManacubeApi?color=56BEB8">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/nick22985/ManacubeApi?color=56BEB8">

  <img alt="License" src="https://img.shields.io/github/license/nick22985/ManacubeApi?color=56BEB8">

  <img alt="Github issues" src="https://img.shields.io/github/issues/nick22985/ManacubeApi?color=56BEB8" />

  <img alt="Github forks" src="https://img.shields.io/github/forks/nick22985/ManacubeApi?color=56BEB8" />

  <img alt="Github stars" src="https://img.shields.io/github/stars/nick22985/ManacubeApi?color=56BEB8" />
</p>

<!-- Status -->

<h4 align="center">
	🚧  ManacubeApi 🚀 Under construction...  🚧
</h4>

<hr>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0;
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/nick22985" target="_blank">Author</a>
</p>

<br>

## :dart: About

A typed TypeScript client for the [ManaCube public API](https://api.manacube.com/).

## :sparkles: Features

- Every endpoint in the [ManaCube API spec](https://api.manacube.com/v3/api-docs), grouped by area
- Types and [zod](https://zod.dev) schemas for every response, checked against the live API
- Queues requests and waits out rate limits instead of failing
- Async iterators for paginated endpoints
- Typed errors with the API's error body attached
- Uses the platform `fetch`; zod is the only dependency. Works in Node 22+, Bun, Deno and browsers.

## :checkered_flag: Starting

```bash
npm i manacube
```

```ts
import { ManaCubeApi } from 'manacube';

const api = new ManaCubeApi();

const guild = await api.guilds.player('30f8109e-7ea7-4ae7-90f4-178bb39cfe31');
const towns = await api.towny.towns('earth');

for await (const auction of api.auctions.iterateActive('survival')) {
	console.log(auction.item, auction.price);
}
```

CommonJS works too: `const { ManaCubeApi } = require('manacube')`.

## Options

```ts
new ManaCubeApi({
	baseUrl: 'https://api.manacube.com/api', // default
	apiKey: process.env.MANACUBE_API_KEY, // only partner endpoints need it
	timeout: 30_000, // per attempt, 0 disables
	retryOnRateLimit: true, // wait and retry on 429
	rateLimitScope: 'client', // 'client' | 'request', see Rate limits
	maxRetries: 3,
	maxConcurrency: 4, // requests in flight at once; the rest queue. Infinity disables
	validation: 'warn', // 'warn' | 'strict' | 'off'
	headers: { 'user-agent': 'my-bot' },
	fetch: customFetch, // defaults to globalThis.fetch
	logger: { warn: console.warn, debug: console.debug }, // debug traces requests and rate-limit waits
});
```

Every method also takes a last `options` argument with `signal` (an `AbortSignal`),
`retryOnRateLimit` to override the client setting for that call, and `headers`, which are merged
over the client headers (names are case-insensitive).

`apiKey` is only sent to partner endpoints. To send a key with every request, set it as a header
instead: `headers: { authorization: key }`. A key in the client or per-call headers also counts as
the key for partner endpoints.

UUIDs are accepted with or without dashes. Gamemode arguments autocomplete the known gamemodes
(`survival`, `skyblock`, `olympus`, `parkour`, `islands`, `earth`, `kitpvp`, `lifesteal`) but
accept any string.

## Endpoints

| Method                                                  | Endpoint                                            |
| ------------------------------------------------------- | --------------------------------------------------- |
| `auctions.active(gamemode, page)`                       | `GET /auctions/active/{gamemode}/{page}`            |
| `auctions.ended(gamemode, page)`                        | `GET /auctions/ended/{gamemode}/{page}`             |
| `auctions.player(uuid, gamemode, page)`                 | `GET /auctions/player/{uuid}/{gamemode}/{page}`     |
| `auctions.iterateActive / iterateEnded / iteratePlayer` | all pages of the above                              |
| `economy.prices(gamemode)`                              | `GET /manaeconomy/prices/{gamemode}`                |
| `economy.priceHistory(gamemode, page)`                  | `GET /manaeconomy/history/prices/{gamemode}/{page}` |
| `economy.volumeHistory(gamemode, page)`                 | `GET /manaeconomy/history/volume/{gamemode}/{page}` |
| `economy.iteratePriceHistory / iterateVolumeHistory`    | all pages of the above                              |
| `factions.placeholder(name)`                            | `GET /factions/placeholder/{placeholder}`           |
| `factions.payouts(season)`                              | `GET /factions/payouts/{season}`                    |
| `guilds.top(amount)`                                    | `GET /guilds/top/{amount}`                          |
| `guilds.player(uuid)`                                   | `GET /guilds/player/{uuid}`                         |
| `patrons.uuids()`                                       | `GET /patrons/uuids`                                |
| `patrons.patrons()`                                     | `GET /patrons/patrons`                              |
| `patrons.patronsPlus()`                                 | `GET /patrons/patronsplus`                          |
| `players.get(uuids)`                                    | `GET /players` (up to 100)                          |
| `players.friends(uuid)`                                 | `GET /friends/{uuid}`                               |
| `players.level(uuid)`                                   | `GET /manalevel/{uuid}`                             |
| `players.cubits(uuid)`                                  | `GET /cubits/{uuid}`                                |
| `players.resetPlaytime(uuid)`                           | `POST /playtime/reset/{uuid}` (needs `apiKey`)      |
| `rankings.boards(gamemode)`                             | `GET /rankings/{gamemode}/boards`                   |
| `rankings.get(gamemode, boards, { limit })`             | `GET /rankings/{gamemode}`                          |
| `realm.wonders(gamemode)`                               | `GET /wonders/{gamemode}`                           |
| `realm.events(gamemode)`                                | `GET /events/{gamemode}`                            |
| `realm.policy(gamemode)`                                | `GET /policy/{gamemode}`                            |
| `shops.list(gamemode, { page, size })`                  | `GET /shops/{gamemode}`                             |
| `shops.trades(gamemode, { shop, page, size })`          | `GET /shops/{gamemode}/trades`                      |
| `shops.iterate / iterateTrades`                         | all pages of the above                              |
| `svas.types(gamemode)`                                  | `GET /svas/{gamemode}`                              |
| `svas.player(uuid, gamemode)`                           | `GET /svas/{gamemode}/{uuid}`                       |
| `svas.sales(gamemode, sva)`                             | `GET /svas/sales/{gamemode}/{sva}`                  |
| `svas.circulation(gamemode, sva)`                       | `GET /svas/circulation/{gamemode}/{sva}`            |
| `towny.towns(gamemode)`                                 | `GET /towny/{gamemode}/towns`                       |
| `towny.nations(gamemode)`                               | `GET /towny/{gamemode}/nations`                     |
| `towny.claims(gamemode)`                                | `GET /towny/{gamemode}/claims`                      |
| `towny.recruit(gamemode)`                               | `GET /recruit/{gamemode}`                           |
| `updates.list({ realm, page, size })`                   | `GET /updates`                                      |
| `updates.iterate({ realm, size })`                      | all pages of the above                              |

`players.level`, `players.cubits` and `guilds.player` resolve to `null` for an unknown player (or,
for `guilds.player`, a player without a guild). Wonders, events, policies and shops are only
published for some gamemodes; the others answer 404.

### Other endpoints

`api.request` calls any path on `baseUrl`, including private or development endpoints the
package doesn't know about. It goes through the same client as the methods above: headers, the
API key, rate limits, timeouts and errors all work the same way.

```ts
import { z } from 'zod';

const stats = await api.request('GET /dev/stats/{gamemode}', {
	params: { gamemode: 'earth' }, // URL-encoded into the path
	query: { day: 1, tag: ['a', 'b'] }, // arrays repeat the key
	schema: z.object({ online: z.number() }), // optional; without it the result is unknown
});

await api.request('POST /dev/reset', { auth: true, body: { uuid } }, { headers: { 'x-trace': '1' } });
```

`auth: true` requires an API key, `body` is sent as JSON, and `notFoundAsNull: true` resolves a 404
to `null`. The endpoint must be a method followed by a path; for another host, such as a dev
server, create a second client with that `baseUrl`.

### Pagination

Iterators fetch the next page only when you reach it, so `break` stops fetching. `toArray`
collects one, with an optional item limit:

```ts
import { toArray } from 'manacube';

const latest = await toArray(api.updates.iterate({ realm: 'Earth' }), 50);
const shops = await toArray(api.shops.iterate('earth', {}, { maxPages: 5 }));
```

Every `page` argument and every returned `page` is 1-based. The shops and updates endpoints count
from 0, and the client converts both ways.

Auction pages have no page count; the iterators follow pages while the API marks
them `full`. The API sometimes sends an empty body for a page that has data, so the iterators
retry an empty page once. A page past the end also comes back empty, and the single-page methods
turn that into `{ lastUpdated: 0, auctions: [], full: false, finalized: false }`.

### Errors

```ts
import { ManaCubeApiError, ManaCubeRateLimitError, ManaCubeValidationError } from 'manacube';

try {
	await api.realm.wonders('survival');
} catch (error) {
	if (error instanceof ManaCubeRateLimitError) console.log(`retry in ${error.retryAfterMs}ms`);
	else if (error instanceof ManaCubeApiError)
		console.log(error.status, error.body); // body.validGamemodes etc.
	else if (error instanceof ManaCubeValidationError) console.log(error.source, error.issues);
}
```

All of them extend `ManaCubeError`. Network failures and timeouts throw a `ManaCubeError` with the
original error as `cause`; aborting through your own `signal` rethrows the abort reason.

### Rate limits

The API allows a burst of about 30 requests and refills a few per second. The client keeps
`maxConcurrency` requests in flight and queues the rest, so `Promise.all` over a long list is
safe. When a response reports fewer requests remaining than `maxConcurrency` (at most 8), the next
request waits a second.

After a 429 the client holds back every request it makes until the limit lifts (using
`Retry-After` when the API sends it, otherwise backing off 1s, 2s, 4s… up to 30s), then retries
up to `maxRetries` times. With `retryOnRateLimit: false` it throws `ManaCubeRateLimitError`
instead, without sending requests while the limit is in effect. `api.rateLimit` shows the last
`x-rate-limit-remaining` value and when the hold ends.

All of that assumes one caller. A server that proxies requests for many users (forwarding each
user's IP in a header, say) gets a separate limit per user, so one user's 429 shouldn't hold back
the others. With `rateLimitScope: 'request'`, a 429 only affects the request that got it: that
request backs off and retries (or throws, with `retryOnRateLimit: false`), other requests are not
held back, the low-remaining pause is skipped, and `api.rateLimit` isn't updated. Set
`maxConcurrency: Infinity` too if one user's requests shouldn't wait in the queue behind
another's.

```ts
const api = new ManaCubeApi({
	rateLimitScope: 'request',
	maxConcurrency: Infinity,
	retryOnRateLimit: false,
	validation: 'strict',
	headers: { authorization: process.env.MANACUBE_API_KEY! },
});

await api.towny.towns('earth', { headers: { 'x-client-ip': visitorIp }, signal });
```

### Response validation

Responses are checked against the zod schemas exported from the package (`guildSchema`,
`townyTownsSchema`, …). Unknown fields pass through. With `validation: 'warn'` a mismatch is
logged once per client (so a bad field across 200 pages is one warning) and the data is returned
as received; `'strict'` throws; `'off'` skips the check.

## Migrating from 1.x

2.0 is a rewrite. The constructor takes an options object, methods are grouped by area, and axios
is gone.

| 1.x                                                                            | 2.x                                                                       |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `new ManaCubeApi(baseUrl, disableSafeUUIDCheck, enableQueueing, axiosOptions)` | `new ManaCubeApi({ baseUrl, retryOnRateLimit, headers, timeout, fetch })` |
| `getAllGamemodeSvas(gamemode)`                                                 | `svas.types(gamemode)`                                                    |
| `getUserSvas(uuid, gamemode)`                                                  | `svas.player(uuid, gamemode)`                                             |
| `getSvaSalesData(gamemode, sva)`                                               | `svas.sales(gamemode, sva)`                                               |
| `getSvaCirculationData(gamemode, sva)`                                         | `svas.circulation(gamemode, sva)`                                         |
| `getAllPatrons()`                                                              | `patrons.uuids()`                                                         |
| `getPatrons()` / `getPatronPlus()`                                             | `patrons.patrons()` / `patrons.patronsPlus()`                             |
| `getPlayerLevels(uuid)`                                                        | `players.level(uuid)`                                                     |
| `getUserFriends(uuid)`                                                         | `players.friends(uuid)`                                                   |
| `getPlayersCubitBalance(uuid)`                                                 | `players.cubits(uuid)`                                                    |
| `economyCurrentSellPrices(gamemode)`                                           | `economy.prices(gamemode)`                                                |
| `economyPriceHistory(gamemode, page)`                                          | `economy.priceHistory(gamemode, page)`                                    |
| `economyVolumeHistory(gamemode, page)`                                         | `economy.volumeHistory(gamemode, page)`                                   |
| `getTopGuilds(total)`                                                          | `guilds.top(amount)`                                                      |
| `getPlayerGuild(uuid)`                                                         | `guilds.player(uuid)`                                                     |
| `getGracePlaceholder(placeholder)`                                             | `factions.placeholder(placeholder)`                                       |
| `getFactionsSeasonPayouts(season)`                                             | `factions.payouts(season)`                                                |
| `getActiveAuctions` / `getRecentlyEndedAuctions` / `getPlayerAuctions`         | `auctions.active` / `auctions.ended` / `auctions.player`                  |
| `getAllActiveAuctions(gamemode, maxPages)`                                     | `toArray(auctions.iterateActive(gamemode, { maxPages }))`                 |
| `getAllPlayerAuctions(uuid, gamemode, maxPages)`                               | `toArray(auctions.iteratePlayer(uuid, gamemode, { maxPages }))`           |
| `getPlayerStatisticsForGamemode`, `getListOfAllGamemodes`                      | removed; the API no longer has `/statistics`                              |
| `safeUUIDCheck`, `disableSafeUUIDCheck`                                        | removed; UUIDs are always normalised (`normalizeUuid` is exported)        |
| `setQueueing` / `getQueueing` / `{ enableQueueing }`                           | `maxConcurrency` and `retryOnRateLimit` options                           |
| `axiosConfig`                                                                  | removed; use `headers`, `timeout` or a custom `fetch`                     |

Other changes:

- Types are PascalCase (`Guild`, `AuctionItem`, …) and schemas are exported alongside them.
- `SvaSale.timesSold` replaces `timeSold`, and `SvaType.circulation` is a number, matching the API.
- Errors are `ManaCubeError` subclasses instead of axios errors.
- Input errors throw `ManaCubeValidationError` instead of `Error('Validation error: …')`.

## Development

```bash
npm run check        # lint, typecheck, build and test, as CI does
npm run format       # biome: format and fix lint issues
npm test             # vitest
npm run smoke        # build, then call every endpoint on the live API with strict validation
npm run spec:update  # refresh spec/openapi.json from the live API
```

`test/spec.test.ts` compares `src/endpoints.ts` with `spec/openapi.json`, so after
`npm run spec:update` the tests list any endpoint the API added or removed. `npm run smoke` is
the check for response shapes drifting; it is not in CI because it depends on the API being up.

### Releasing

`npm run release` (or `release:minor`, `release:major`) runs `npm run check`, bumps the version,
and pushes the commit and tag. The tag triggers `.github/workflows/publish.yml`, which checks the
tag matches `package.json` and stages the release on npm with provenance. Nothing is public until
you approve it with 2FA: on npmjs.com, or with `npm stage list manacube` and
`npm stage approve <stage-id>`. Add release notes to
[CHANGELOG.md](CHANGELOG.md) before releasing.

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE) file.

Made with :heart: by <a href="https://github.com/nick22985" target="_blank">nick22985</a>

&#xa0;

<a href="#top">Back to top</a>
