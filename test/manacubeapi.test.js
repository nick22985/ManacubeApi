const manacubeApi = require('../lib/index.cjs');
const MockAdapter = require('axios-mock-adapter');

let uuid = 'f91c3347-4be2-48f2-be73-9a4323f08497';
let manacubeClient;
let mock;

beforeEach(() => {
	manacubeClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false);
	mock = new MockAdapter(manacubeClient.axiosConfig);
});

afterEach(() => {
	mock.restore();
});

// Mock data
const mockPatrons = ['uuid1', 'uuid2', 'uuid3'];
const mockPlayerStats = { level: 50, experience: 1000 };
const mockGuilds = [{ name: 'TestGuild', level: 10 }];
const mockFriends = [{ name: 'Friend1', uuid: 'friend-uuid-1' }];

test('safe_uuid', async () => {
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	manacubeClient.safeUUIDCheck();
	expect(manacubeClient.disableSafeUUIDCheck).toBe(true);
	manacubeClient.safeUUIDCheck();
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	manacubeClient.safeUUIDCheck(true);
	expect(manacubeClient.disableSafeUUIDCheck).toBe(true);
	manacubeClient.safeUUIDCheck(false);
	expect(manacubeClient.disableSafeUUIDCheck).toBe(false);
	manacubeClient.safeUUIDCheck(false);
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

test('getUserSvas', async () => {
	mock.onGet(`svas/olympus/${uuid}`).reply(200, []);
	
	const getUserSvas = await manacubeClient.getUserSvas(uuid, 'olympus');
	expect(Array.isArray(getUserSvas)).toBe(true);
});

test('getAllGamemodeSvas', async () => {
	mock.onGet('svas/olympus').reply(200, []);
	
	const getUserSvas = await manacubeClient.getAllGamemodeSvas('olympus');
	expect(Array.isArray(getUserSvas)).toBe(true);
});

test('getAllPatrons', async () => {
	mock.onGet('patrons/uuids').reply(200, mockPatrons);
	
	const patrons = await manacubeClient.getAllPatrons();
	expect(patrons).toEqual(mockPatrons);
	expect(patrons.length).toBe(3);
});

test('getPlayerLevels', async () => {
	mock.onGet(`manalevel/${uuid}`).reply(200, mockPlayerStats);
	
	const playerLevel = await manacubeClient.getPlayerLevels(uuid);
	expect(playerLevel).toEqual(mockPlayerStats);
});

test('getTopGuilds', async () => {
	mock.onGet('guilds/top/50').reply(200, mockGuilds);
	
	const getTopGuilds = await manacubeClient.getTopGuilds(50);
	expect(getTopGuilds).toEqual(mockGuilds);
	expect(getTopGuilds.length).toBe(1);
});

test('getUserFriends', async () => {
	mock.onGet(`friends/${uuid}`).reply(200, mockFriends);
	
	const getUserFriends = await manacubeClient.getUserFriends(uuid);
	expect(getUserFriends).toEqual(mockFriends);
	expect(getUserFriends.length).toBe(1);
});

test('getPlayersCubitBalance', async () => {
	mock.onGet(`cubits/${uuid}`).reply(200, 1000);
	
	const getPlayersCubitBalance = await manacubeClient.getPlayersCubitBalance(uuid);
	expect(getPlayersCubitBalance).toBe(1000);
});

test('multiple concurrent requests without client rate limiting', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, false);
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock successful responses
	testMock.onGet('patrons/uuids').reply(200, mockPatrons);
	
	// Make many requests - should all succeed since no client-side rate limiting
	const promises = [];
	for (let i = 0; i < 50; i++) {
		promises.push(testClient.getAllPatrons());
	}
	
	const results = await Promise.all(promises);
	
	// All should succeed
	expect(results.length).toBe(50);
	results.forEach(result => {
		expect(result).toEqual(mockPatrons);
	});
	
	testMock.restore();
});

test('request queueing with mocked responses', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, true);
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock successful responses
	testMock.onGet('patrons/uuids').reply(200, mockPatrons);
	
	const promises = [];
	for (let i = 0; i < 5; i++) {
		promises.push(testClient.getAllPatrons());
	}
	
	const results = await Promise.all(promises);
	
	expect(results.length).toBe(5);
	results.forEach(result => {
		expect(result).toEqual(mockPatrons);
	});
	
	testMock.restore();
});

test('server rate limit detection and handling', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, false); // No queueing
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock rate limit response
	testMock.onGet('patrons/uuids').reply(429, 'Too Many Requests', { 'retry-after': '1' });
	
	// This should throw an error since queueing is disabled
	try {
		await testClient.getAllPatrons();
		fail('Expected rate limit error to be thrown');
	} catch (error) {
		expect(error.response.status).toBe(429);
	}
	
	testMock.restore();
});

test('global queue setting control', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, false);
	
	expect(testClient.getQueueing()).toBe(false);
	
	testClient.setQueueing(true);
	expect(testClient.getQueueing()).toBe(true);
	
	testClient.setQueueing(false);
	expect(testClient.getQueueing()).toBe(false);
});

test('per-request queue override', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, false);
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock successful response
	testMock.onGet('patrons/uuids').reply(200, mockPatrons);
	
	// Test that per-request override works
	const queuedResult = await testClient.getAllPatrons({ enableQueueing: true });
	expect(queuedResult).toEqual(mockPatrons);
	
	// Test with global queueing enabled
	const testClientWithQueue = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, true);
	const testMockWithQueue = new MockAdapter(testClientWithQueue.axiosConfig);
	testMockWithQueue.onGet('patrons/uuids').reply(200, mockPatrons);
	
	const nonQueuedResult = await testClientWithQueue.getAllPatrons({ enableQueueing: false });
	expect(nonQueuedResult).toEqual(mockPatrons);
	
	testMock.restore();
});

test('Progress indicator shows wait time during rate limits', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, true);
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock rate limit response with longer retry-after to trigger progress indicator
	testMock.onGet('patrons/uuids')
		.replyOnce(429, { error: 'Rate limited' }, { 'retry-after': '6' }) // 6 second wait to trigger progress
		.onGet('patrons/uuids')
		.reply(200, mockPatrons);
	
	const startTime = Date.now();
	const result = await testClient.getAllPatrons();
	const endTime = Date.now();
	const duration = endTime - startTime;
	
	expect(result).toEqual(mockPatrons);
	expect(duration).toBeGreaterThan(5900); // Should wait at least 5.9 seconds
	expect(duration).toBeLessThan(8000); // But not too long for testing
	
	testMock.restore();
}, 15000); // 15 second timeout for this test


test('parallel execution performance', async () => {
	const testClient = new manacubeApi.ManaCubeApi('https://api.manacube.com/api/', false, true);
	const testMock = new MockAdapter(testClient.axiosConfig);
	
	// Mock fast responses
	testMock.onGet('patrons/uuids').reply(200, mockPatrons);
	
	const startTime = Date.now();
	const promises = [];
	
	for (let i = 0; i < 10; i++) {
		promises.push(testClient.getAllPatrons());
	}
	
	const results = await Promise.all(promises);
	const endTime = Date.now();
	const duration = endTime - startTime;
	
	expect(results.length).toBe(10);
	results.forEach(result => {
		expect(result).toEqual(mockPatrons);
	});
	
	// Should complete quickly with mocked responses
	expect(duration).toBeLessThan(5000);
	
	testMock.restore();
});

