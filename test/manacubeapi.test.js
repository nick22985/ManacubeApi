//FIXME: OLD WAKATIME TESTS
const wakatime = require("../lib");
const dotenv = require("dotenv");
dotenv.config();
const wakatime_api_key = process.env.WAKATIME_API_KEY;

const wakaClient = new wakatime.WakaTimeApi(wakatime_api_key);
const myWakaId = process.env.WAKATIMEID;

test("GetUser", async () => {
	let getUser = await wakaClient.getUser(myWakaId).catch((err) => {
		console.log(err);
		throw err;
	});
});
