const { MongoMemoryServer } = require("mongodb-memory-server");
const { connectToDb, getDb } = require("../connection");
const {
	checkBody,
	userAndPasswordCheck,
	updatePass,
	forgetPass,
	verifyUser,
	userMail,
	resetPass,
} = require("../services/user.dataHelper");
const { beforeAll, expect, afterAll, describe, test } = require("@jest/globals");
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

describe("updatePassword", () => {
	beforeAll(async () => {
		await userMail(mockUserData);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
		await verifyUser({ email: mockUserData.email, otp: "123456" });
	});

	afterAll(async () => {
		await getDb().collection("otp").deleteMany({ email: mockUserData.email });
		await getDb().collection("users").deleteMany({ email: mockUserData.email });
	});

	test("should return badRequest if old password is incorrect", async () => {
		const body = {
			oldPassword: "Sam@1234",
			newPassword: "Prateek@123",
		};
		const updatedPassObj = await updatePass(mockUserData.email, body.oldPassword, body.newPassword);
		expect(updatedPassObj.statusCode).toBe(400);
	});
	test("should return badRequest if new password is invalid", async () => {
		const body = {
			oldPassword: "Sagar@123",
			newPassword: "Prateek",
		};
		const updatedPassObj = await updatePass(mockUserData.email, body.oldPassword, body.newPassword);
		expect(updatedPassObj.statusCode).toBe(400);
	});
	test("should update password and return created response", async () => {
		const body = {
			oldPassword: "Sagar@123",
			newPassword: "Prateek@123",
		};
		const updatedPassObj = await updatePass(mockUserData.email, body.oldPassword, body.newPassword);
		expect(updatedPassObj.statusCode).toBe(201);
	});
});

describe("resetPass", () => {
	beforeAll(async () => {
		await userMail(mockUserData);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
		await verifyUser({ email: mockUserData.email, otp: "123456" });
	});
	test("should return 'invalid body' when body is missing required fields", async () => {
		await forgetPass(mockUserData.email);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
		const body = {
			email: mockUserData.email,
			otp: "123456",
		};
		const resetPassObj = await resetPass(body);
		expect(resetPassObj.statusCode).toBe(400);
	});

	test("should return 'Either invalid otp or user not registered!!' when otpUser is not found", async () => {
		await forgetPass(mockUserData.email);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });

		const invalidOtp = {
			email: mockUserData.email,
			otp: "876548",
			newPassword: "Prateek@123",
		};
		const resetPassObj1 = await resetPass(invalidOtp);
		expect(resetPassObj1.statusCode).toBe(400);

		const unRegisteredUser = {
			email: `${generate(7, {
				upperCaseAlphabets: false,
				specialChars: false,
				digits: false,
				lowerCaseAlphabets: true,
			})}@amozix.com`,
			otp: "123456",
			newPassword: "Prateek@123",
		};
		const resetPassObj2 = await resetPass(unRegisteredUser);
		expect(resetPassObj2.statusCode).toBe(400);
	});

	test("should return 'password successfully updated!!' when all operations succeed", async () => {
		await forgetPass(mockUserData.email);
		await getDb()
			.collection("otp")
			.updateOne({ email: mockUserData.email }, { $set: { otp: "123456" } });
		const body = {
			email: mockUserData.email,
			otp: "123456",
			newPassword: "Prateek@123",
		};
		const resetPassObj = await resetPass(body);
		expect(resetPassObj.statusCode).toBe(201);
	});
});
