const { MongoMemoryServer } = require("mongodb-memory-server");
const { disableLoginHelper, deleteUserHelper, enableLoginHelper } = require("../services/admin.dataHelper");
const { connectToDb, getDb } = require("../connection");
const { userMail, verifyUser } = require("../services/user.dataHelper");
const { generate } = require("otp-generator");
const { writeToDb } = require("../services/dataHelper");

const findUrlById = async (email) => {
	return await getDb().collection("urlshortner").find({ email: email }).toArray();
};

const mockUserData = {
	name: "Sagar Mishra",
	email: `${generate(7, {
		upperCaseAlphabets: false,
		specialChars: false,
		digits: false,
		lowerCaseAlphabets: true,
	})}@amozix.com`,
	password: "Sagar@123",
};

const mockUrl = {
	url: "https://www.google.com",
};

let mongoServer;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await connectToDb(uri);
	await userMail(mockUserData);
	await getDb()
		.collection("otp")
		.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
	await verifyUser({ email: mockUserData.email, otp: "123456" });
	await writeToDb(mockUrl.url, mockUserData.email);
});

const validUser = {
	email: mockUserData.email,
};
const invalidUser = {
	email: "xyz@mancompany.com",
};

afterAll(async () => {
	await mongoServer.stop();
});

describe("Tests for disableLoginHelper", () => {
	test("should disable login for a user and return success response", async () => {
		const disableLoginObj = await disableLoginHelper(validUser);
		expect(disableLoginObj.statusCode).toBe(201);
	});
	test("should return bad request if user is not found", async () => {
		const disableLoginObj = await disableLoginHelper(invalidUser);
		expect(disableLoginObj.statusCode).toBe(400);
	});
});

describe("Tests for enableLoginHelper", () => {
	test("should enable login for a user and return success response", async () => {
		const enableLoginObj = await enableLoginHelper(validUser);
		expect(enableLoginObj.statusCode).toBe(201);
	});
	test("should return bad request if user is not found", async () => {
		const enableLoginObj = await enableLoginHelper(invalidUser);
		expect(enableLoginObj.statusCode).toBe(400);
	});
});

describe("Test for deleteUserHelper", () => {
	test("should return bad request if user does not exist", async () => {
		const deletedUserObj = await deleteUserHelper(invalidUser);
		expect(deletedUserObj.statusCode).toBe(400);
	});
	test("should delete user and associated URLs successfully", async () => {
		const UrlsBeforeDeletion = await findUrlById(validUser.email);
		expect(UrlsBeforeDeletion).not.toHaveLength(0);
		const deletedUserObj = await deleteUserHelper(validUser);
		expect(deletedUserObj.statusCode).toBe(201);
		const UrlsAfterDeletion = await findUrlById(validUser.email);
		expect(UrlsAfterDeletion).toHaveLength(0);
	});
});
