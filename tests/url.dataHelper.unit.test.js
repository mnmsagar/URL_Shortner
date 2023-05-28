const { MongoMemoryServer } = require("mongodb-memory-server");
const { getObjById, writeToDb, checkBodyandURL } = require("../services/dataHelper");
const { connectToDb } = require("../connection");

let mongoServer;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await connectToDb(uri);
});

afterAll(async () => {
	await mongoServer.stop();
});

describe("Check URL", () => {
	test("URL Checking when body is not present", () => {
		let body = {};
		expect(checkBodyandURL(body)).toEqual(false);
	});
	test("URL Checking when body have invalid URL", () => {
		const body1 = {
			url: "www.google.com",
		};
		expect(checkBodyandURL(body1)).toEqual(false);
		const body2 = {
			url: "google.com",
		};
		expect(checkBodyandURL(body2)).toEqual(false);
	});
	test("URL Checking when body and URL are valid", () => {
		let body = {
			url: "https://www.google.com",
		};
		expect(checkBodyandURL(body)).toBe(true);
	});
});
describe("Write to Database", () => {
	test("Should return object when added", async () => {
		const url = "https://www.google.com";
		const obj = await writeToDb(url);
		expect(obj).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});
});
describe("Get by ID", () => {
	test("should return the object with the given id", async () => {
		// Insert a test document into the database
		const url = "http://example.com";
		const obj = await writeToDb(url);

		// Call the function with the test id
		const result = await getObjById(obj.urlCode);

		expect(result).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});

	test("should return null when id is incorrect", async () => {
		const id = "ghsdvhjcvsd";
		const result = await getObjById(id);
		expect(result).toBeNull();
	});
});