const manacubeApi = require("../lib");

const manacubeClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false);

let uuid = "f91c3347-4be2-48f2-be73-9a4323f08497";
// let uuid = "f91c3347-4be248f2be739a4323f08497";
test("getUserSvas", async () => {
	manacubeClient.safeUUIDCheck()
	console.log(uuid)
	let getUserSvas = await manacubeClient.getUserSvas(uuid, 'olympus').catch((err) => {
		console.log(err);
		throw err;
	});
	// console.log(getUserSvas)
});


