const manacubeApi = require("../lib");

const manacubeClient = new manacubeApi.ManaCubeApi();

let uuid = "f91c3347-4be2-48f2-be73-9a4323f08497";

test("getUserSvas", async () => {
	let getUserSvas = await manacubeClient.getUserSvas(uuid, 'olympus').catch((err) => {
		console.log(err);
		throw err;
	});
	console.log(getUserSvas)
});


