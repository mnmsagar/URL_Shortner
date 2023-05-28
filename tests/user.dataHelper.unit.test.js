const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectToDb, getDb } = require("../connection");
const { checkBody, userAndPasswordCheck } = require("../services/user.dataHelper");
const { beforeAll, expect, afterAll } = require("@jest/globals");
const { verifyUser, userMail } = require("../services/user.dataHelper");
const { generate } = require("otp-generator");
const { ObjectId } = require("mongodb");
const { isValidEmail, findOTP, isValidString, isValidPassword } = require("../utils/utils");

let mongoServer;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	const uri = mongoServer.getUri();
	await connectToDb(uri);
});

afterAll(async () => {
	await mongoServer.stop();
});

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

describe("verifyUser and userAndPasswordCheck", () => {
	beforeAll(async () => {
		await userMail(mockUserData);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
	});
	afterAll(async () => {
		await getDb().collection("otp").deleteMany({ email: mockUserData.email });
		await getDb().collection("users").deleteMany({ email: mockUserData.email });
	});
	test("when user verify with valid otp", async () => {
		const body = {
			email: mockUserData.email,
			otp: "123456",
		};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
			})
		);
	});
	test("when user verify with invalid otp", async () => {
		const body = {
			email: mockUserData.email,
			otp: "236789",
		};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
			})
		);
	});
	test("when user verify with non-registered email, whether otp is correct or not", async () => {
		const body = {
			email: "sagar@gmail.com",
			otp: "123456",
		};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
			})
		);
	});
	test("when user verify with empty body", async () => {
		const body = {};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
			})
		);
	});

	test("when user verify with registered user with either correct or incorrect otp", async () => {
		const body = {
			email: mockUserData.email,
			otp: "123456",
		};
		const obj = await verifyUser(body);
		expect(obj).toEqual(
			expect.objectContaining({
				statusCode: expect.any(Number),
				message: expect.any(String),
			})
		);
	});

	test("when correct login email and password is used to login", async () => {
		const obj = {
			email: mockUserData.email,
			password: mockUserData.password,
		};
		const result = await userAndPasswordCheck(obj.email, obj.password);
		expect(result).toEqual(
			expect.objectContaining({
				_id: expect.any(ObjectId),
				email: expect.any(String),
			})
		);
	});

	test("when incorrect credentials are used to login", async () => {
		const obj = {
			email: `${generate(7, {
				upperCaseAlphabets: false,
				specialChars: false,
				digits: false,
				lowerCaseAlphabets: true,
			})}@amozix.com`,
			password: generate(8, {
				upperCaseAlphabets: true,
				specialChars: true,
				digits: true,
				lowerCaseAlphabets: true,
			}),
		};
		const result = await userAndPasswordCheck(obj.email, obj.password);
		expect(result).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	});
});

describe("isValidEmail", () => {
	test("when entered a valid email, it will return true", () => {
		const email = "sagar@gmail.com";
		const validEmail = isValidEmail(email);
		expect(validEmail).toBe(true);
	});
	test("when entered a invalid email, it will return false", () => {
		const email = "sagar@gmail";
		const validEmail = isValidEmail(email);
		expect(validEmail).toBe(false);
	});
});

describe("findOTP", () => {
	test("if string contains the otp (length 6), it will return the otp", () => {
		const str = "Hello User, your OTP is 346787";
		expect(findOTP(str)).toEqual("346787");
	});

	test("if string doesn't contains the otp, it will return the string, 'No OTP found'", () => {
		const str = "hi what are you doing";
		expect(findOTP(str)).toEqual("No OTP found");
	});
});

describe("isValidString", () => {
	test("it will return true for valid string and false for invalid string", () => {
		const str1 = "Hello";
		expect(isValidString(str1)).toBe(true);
		const str2 = "@#$%^&*()";
		expect(isValidString(str2)).toBe(false);
	});
});

describe("isValidPassword", () => {
	test("it will return true for valid password and false for invalid password", () => {
		const pass1 = "Abcd1234";
		expect(isValidPassword(pass1)).toBe(true);
		const pass2 = "12345678";
		expect(isValidPassword(pass2)).toBe(false);
	});
});
