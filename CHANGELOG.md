# Changelog

## 2.0.1

### Fixed

- Response types no longer have a `[x: string]: unknown` index signature, so frameworks that
  serialise return types (TanStack Start server functions, for example) keep the fields. Unknown
  fields still pass through at runtime.
- `PlayerSva.customModelData` is `number | null`; the API returns `null` for some items.
- `SvaType.leatherColor` is typed as `LeatherColor | null` instead of `unknown`, following the
  `java.awt.Color` shape in the API spec. `leatherColorSchema` and `LeatherColor` are exported.

## 2.0.0

A rewrite. See [Migrating from 1.x](README.md#migrating-from-1x) for the old-to-new method table.

### Added

- Every endpoint in the API spec: towny towns, nations, claims and recruitment, rankings, wonders,
  events, policy, player shops and trades, ManaUpdates, player names and ranks (`players.get`),
  and the partner endpoint `players.resetPlaytime`.
- Types and zod schemas for every response, checked at runtime (`validation: 'warn' | 'strict' | 'off'`).
- Async iterators for every paginated endpoint, and `toArray`.
- Typed errors: `ManaCubeApiError`, `ManaCubeRateLimitError`, `ManaCubeValidationError`.
- A request queue (`maxConcurrency`, default 4), a pause when the API reports few requests
  left, and retries on 429 that hold back every request on the client.
- `signal` and `retryOnRateLimit` per call; `timeout`, `headers`, `fetch`, `logger` and `apiKey`
  options.
- ESM and CommonJS builds with types for both.

### Changed

- Methods are grouped by area (`api.auctions.active`, `api.players.level`, …) and the
  constructor takes an options object.
- Types are PascalCase (`Guild`, `AuctionItem`, …).
- All `page` arguments and returned `page` values are 1-based, including shops and updates.
- `players.level`, `players.cubits` and `guilds.player` resolve to `null` for an unknown player.
- `SvaSale.timesSold` replaces `timeSold`, and `SvaType.circulation` is a number.
- Uses the platform `fetch` instead of axios; zod is the only dependency.
- Requires Node 22 or newer.

### Removed

- `getPlayerStatisticsForGamemode` and `getListOfAllGamemodes`: the API no longer has `/statistics`.
- `safeUUIDCheck` and `disableSafeUUIDCheck`: UUIDs are always normalised.
- `setQueueing`, `getQueueing` and `axiosConfig`.
