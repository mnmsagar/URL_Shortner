const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectToDb, getDb } = require("../connection");
const { checkBody } = require("../services/user.dataHelper");
const { beforeAll } = require("@jest/globals");
const { verifyUser, userMail } = require("../services/user.dataHelper");

let mongoServer;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await connectToDb(uri);
});

afterAll(async () => {
	await mongoServer.stop();
});

describe("bodyCheck", () => {
	it("when body is invalid either password, email or password not valid", () => {
		const body = {
			name: "Sagar Mishra",
			email: "sagar@gmail.com",
			password: "12345678",
		};
		expect(checkBody(body).statusCode).toBe(400);
	});
	it("when body is vaild", () => {
		const body = {
			name: "Sagar Mishra",
			email: "sagar@gmail.com",
			password: "Sagar@123",
		};
		expect(checkBody(body)).toBeTruthy();
	});
});

describe("verifyMail", () => {
	beforeEach(async () => {
		const obj = {
			name: "Sagar Mishra",
			email: "sagar@gmail.com",
			passsword: "Sagar@123",
		};
		await userMail(obj);
		await getDb()
			.collection("otp")
			.updateOne({ email: obj.email }, { $set: { otp: "123456" } });
	});
	afterEach(async () => {
		getDb().collection("otp").deleteOne({ email: "sagar@gmail.com" });
		getDb().collection("users").deleteOne({ email: "sagar@gmail.com" });
	});
	it("when user verify with valid otp", async () => {
		const body = {
			email: "sagar@gmail.com",
			otp: "123456",
		};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
				token: expect.any(String),
			})
		);
	});
});
