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
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/nick22985" target="_blank">Author</a>
</p>

<br>

## :dart: About

This project is a npm wrapper to integrate with the manacube api (https://api.manacube.com/)

## :sparkles: Features

:heavy_check_mark: Api Client;\
:heavy_check_mark: Typescript;\

## :rocket: Technologies

The following tools were used in this project:

- [Node.js](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need to have [Node](https://nodejs.org/en/) installed.

## :checkered_flag: Starting

```bash
# Install the project
$ npm i manacube

# import / declare client
const manacubeApi = require("manacube")
let manacubeClient = new manacubeApi.ManaCubeApi()

# Run the project
you can now use the client and the function to interact with the manacube api

```

## Functions

Declaring Client

```js
// Declare api instance
// Has to options baseUrl and disableSafeUUIDCheck. BaseUrl changes the default api url
// disableSafeUUIDCheck will not run any checks against any UUID imputed into the api.
let manacubeClient = new manacubeApi.ManaCubeApi();
let manacubeClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', true); // Disables UUID CHECKS
```

Reforms UUID to the correct formatting for the api or returns `Invalid UUID` if UUID isn't the valid minecraft format.

```js
manacubeClient.safeUUIDCheck('f91c3347-4be2-48f2-be73-9a4323f08497'); //return f91c3347-4be2-48f2-be73-9a4323f08497
manacubeClient.safeUUIDCheck('f91c3347-4be248f2be73-9a4323f08497'); //return f91c3347-4be2-48f2-be73-9a4323f08497
manacubeClient.safeUUIDCheck('f91c33474be248f2be739a4323f08497'); //return f91c3347-4be2-48f2-be73-9a4323f08497
manacubeClient.safeUUIDCheck('f91c33474be248f2be739a4323f08497'); //return Invalid UUID
```

Get Users sva's

```js
@param uuid MCC UUID
@param gamemode gamemode to get stats for
@returns A single users svas

manacubeClient.getUserSvas(uuid, gamemode);
```

Get gamemode sva's

```js
@param gamemode Gamemode to get stats for
@returns Get all SVAs that a player owns on a specific gamemode

manacubeClient.getAllGamemodeSvas(gamemode)
```

Get Patrons list

```js
@returns List of patrons uuids

manacubeClient.getPatrons()
```

Get player levels

```js
@param uuid UUID of player to get stats for
@returns Get a single players stats
manacubeClient.getPlayerLevels(uuid)

```

Get Top Guilds

```js
@param total Total amount of guilds to get
@returns Get a list of x guilds stats

manacubeClient.getTopGuilds(total)
```

Get players guilds

```js
@param uuid UUID of player to get stats for
@returns Get a single players stats

manacubeClient.getPlayerGuild(uuid)
```

Get Users Friends List

```js
@param uuid UUID of player to get stats for
@returns Get a single players friend list

manacubeClient.getUserFriends(uuid)
```

Gets Factions Placeholders

```js
@param season Factions Season payouts to get stats for
@returns Get a list of factions season payouts

manacubeClient.getFactionsSeasonPayouts(season)
```

Get factions Grace Placeholders

```js
@param placeholder placeholder
@returns placeholder

getGracePlaceholder(placeholder)

```

Get Players cubit balance

```js
@param uuid UUID of player to get stats for
@returns Get a single players cubit stats

getPlayersCubitBalance(uuid)
```

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.

Made with :heart: by <a href="https://github.com/nick22985" target="_blank">nick22985</a>

&#xa0;

<a href="#top">Back to top</a>
