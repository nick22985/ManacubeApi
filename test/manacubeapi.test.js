const manacubeApi = require("../lib");

const manacubeClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false);

let uuid = "f91c3347-4be2-48f2-be73-9a4323f08497";
test("safe_uuid", async () => {
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	manacubeClient.safeUUIDCheck()
	expect(manacubeClient.disableSafeUUIDCheck).toBe(true);
	manacubeClient.safeUUIDCheck()
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	manacubeClient.safeUUIDCheck(true)
	expect(manacubeClient.disableSafeUUIDCheck).toBe(true);
	manacubeClient.safeUUIDCheck(false)
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
});

test('uuidFormat', async () => {
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	expect(manacubeClient.safe_uuid(uuid)).toBe('f91c3347-4be2-48f2-be73-9a4323f08497');
	expect(manacubeClient.safe_uuid('f91c33474be2-48f2-be73-9a4323f08497')).toBe('f91c3347-4be2-48f2-be73-9a4323f08497');
	expect(manacubeClient.safe_uuid('f91c33474be248f2-be73-9a4323f08497')).toBe('f91c3347-4be2-48f2-be73-9a4323f08497');
	expect(manacubeClient.safe_uuid('f91c33474be248f2be73-9a4323f08497')).toBe('f91c3347-4be2-48f2-be73-9a4323f08497');
	expect(manacubeClient.safe_uuid('f91c33474be248f2be739a4323f08497')).toBe('f91c3347-4be2-48f2-be73-9a4323f08497');
	expect(manacubeClient.safe_uuid('48f2-be73-9a4323f08497')).toBe('Invalid UUID');
});

test("getUserSvas", async () => {
	let getUserSvas = await manacubeClient.getUserSvas(uuid, 'olympus').catch((err) => {
		console.log(err);
		throw err;
	});
	// NOT IMPLEMENTED YET
	// if(getUserSvas.length == 0) {
	// 	console.log(getUserSvas);
	// 	throw err
	// }
});

test("getAllGamemodeSvas", async () => {
	let getUserSvas = await manacubeClient.getAllGamemodeSvas('olympus').catch((err) => {
		console.log(err);
		throw err;
	});
	// NOT IMPLEMENTED IN API
	// if(getUserSvas.length == 0) {
	// 	console.log(getUserSvas);
	// 	throw err
	// }
});

test("getPatrons", async () => {
	let patrons = await manacubeClient.getPatrons().catch((err) => {
		console.log(err);
		throw err;
	});
	if (patrons.length == 0) {
		console.log(patrons);
		throw err
	}
});

test("getPlayerLevels", async () => {
	let playerLevel = await manacubeClient.getPlayerLevels(uuid).catch((err) => {
		console.log(err);
		throw err;
	});
	if (playerLevel.length == 0) {
		console.log(playerLevel);
		throw err
	}
});

test("getTopGuilds", async () => {
	let getTopGuilds = await manacubeClient.getTopGuilds(50).catch((err) => {
		console.log(err);
		throw err;
	});
	if (getTopGuilds.length != 50) {
		console.log(getTopGuilds);
		throw err
	}
});

test("getPlayerGuild", async () => {
	// let getPlayerGuild = await manacubeClient.getPlayerGuild(uuid).catch((err) => {
	// 	console.log(err);
	// 	throw err;
	// });
	// NOT IMPLEMENTED IN API
	// if(getPlayerGuild.length == 0) {
	// 	console.log(getPlayerGuild);
	// 	throw err
	// }
});

test("getUserFriends", async () => {
	let getUserFriends = await manacubeClient.getUserFriends(uuid).catch((err) => {
		console.log(err);
		throw err;
	});
	if (getUserFriends.length == 0) {
		console.log(getUserFriends);
		throw err
	}
});

test("getUserFriends", async () => {
	let getUserFriends = await manacubeClient.getUserFriends(uuid).catch((err) => {
		console.log(err);
		throw err;
	});
	if (getUserFriends.length == 0) {
		console.log(getUserFriends);
		throw err
	}
});

test("getFactionsSeasonPayouts", async () => {
	// let getFactionsSeasonPayouts = await manacubeClient.getFactionsSeasonPayouts(1).catch((err) => {
	// 	console.log(err);
	// 	throw err;
	// });
	// if(getFactionsSeasonPayouts.length == 0) {
	// 	console.log(getFactionsSeasonPayouts);
	// 	throw err
	// }
});

test("getGracePlaceholder", async () => {
	// let getGracePlaceholder = await manacubeClient.getGracePlaceholder("1").catch((err) => {
	// 	console.log(err);
	// 	throw err;
	// });
	// if(getGracePlaceholder.length == 0) {
	// 	console.log(getGracePlaceholder);
	// 	throw err
	// }
});

test("getPlayersCubitBalance", async () => {
	let getPlayersCubitBalance = await manacubeClient.getPlayersCubitBalance(uuid).catch((err) => {
		console.log(err);
		throw err;
	});
	if (getPlayersCubitBalance.length == 0) {
		console.log(getPlayersCubitBalance);
		throw err
	}
});
