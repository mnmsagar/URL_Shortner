require("dotenv").config();
const request = require("supertest");
const { app } = require("../app");
const { beforeAll } = require("@jest/globals");
const { connectToDb, getDb, getClient } = require("../connection");
const { fetchData } = require("../utils/utils");
const { generate } = require("otp-generator");
const md5 = require("md5");

const signUp = async (obj) => {
	return await request(app).post("/users/signup").send(obj);
};

const loginUser = async (obj) => {
	return await request(app).post("/users/login").send(obj);
};

const verifyUser = async (obj) => {
	return await request(app).post("/users/verify-email").send(obj);
};

const addUrl = async (obj, token) => {
	return await request(app).post("/shorten").set("Authorization", `Bearer ${token}`).send(obj);
};

const getObjById = async (id) => {
	return request(app).get(`/${id}`);
};

beforeAll(async () => {
	await connectToDb(process.env.URI);
});

afterAll(async () => {
	await getDb().collection("users").deleteMany({ email: mockUserData.email });
	await getDb().collection("otp").deleteMany({ email: mockUserData.email });
	await getDb().collection("urlshortner").deleteMany({ longUrl: "https://www.google.com" });
	await getClient().close();
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
const hash = md5(mockUserData.email);

const mockUrl = {
	url: "https://www.google.com",
};

const loginCredentials = {
	email: mockUserData.email,
	password: mockUserData.password,
};

describe("All test flow wise", () => {
	test("When user sign up using either invalid name, email or password", async () => {
		const user1 = {
			name: "Sagar1 Mis4shra",
			email: "mishra@gmail.com",
			password: "Sagar@123",
		};
		const respName = await signUp(user1);
		expect(respName.statusCode).toBe(400);

		const user2 = {
			name: "Sagar Mishra",
			email: "mishra@gmai",
			password: "Sagar@123",
		};
		const respEmail = await signUp(user2);
		expect(respEmail.statusCode).toBe(400);

		const user3 = {
			name: "Sagar Mishra",
			email: "mishra@gmail.com",
			password: "123456789",
		};
		const respPass = await signUp(user3);
		expect(respPass.statusCode).toBe(400);
	});
	test("when user signup correctly", async () => {
		const result = await signUp(mockUserData);
		expect(result.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	});

	test("when user try to verify with invalid otp or invalid email id or both", async () => {
		const obj = {
			email: mockUserData.email,
			otp: generate(6, {
				upperCaseAlphabets: false,
				specialChars: false,
				digits: true,
				lowerCaseAlphabets: false,
			}),
		};
		const verifiedObj = await verifyUser(obj);
		expect(verifiedObj.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	});

	test("when user try to verify with empty body", async () => {
		const obj = {};
		const verifiedObj = await verifyUser(obj);
		expect(verifiedObj.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	});

	test("when user try to verify before signup", async () => {
		const obj = {
			email: "sagar@gmail.com",
			otp: "123456",
		};
		const verifiedObj = await verifyUser(obj);
		expect(verifiedObj.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	});

	test("when user uses correct email and otp for verification", async () => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const otp = await fetchData(hash);
		const obj = {
			email: mockUserData.email,
			otp: otp,
		};
		const verifiedObj = await verifyUser(obj);
		expect(verifiedObj.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	}, 6000);

	test("when already verified user tries to signup or verify", async () => {
		const result = await signUp(mockUserData);
		expect(result.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const otp = await fetchData(hash);
		const obj = {
			email: mockUserData.email,
			otp: otp,
		};
		const verifiedObj = await verifyUser(obj);
		expect(verifiedObj.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
	}, 6000);

	test("when user try to login with correct credentials", async () => {
		const resp = await loginUser(loginCredentials);
		expect(resp.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
				token: expect.any(String),
			})
		);
	});
	test("when user try to login with incorrect credentials", async () => {
		const loginCredentials = {
			email: `${generate(8, {
				upperCaseAlphabets: true,
				specialChars: false,
				digits: true,
				lowerCaseAlphabets: true,
			})}@amozix.com`,
			password: generate(8, {
				upperCaseAlphabets: true,
				specialChars: true,
				digits: true,
				lowerCaseAlphabets: true,
			}),
		};
		const resp = await loginUser(loginCredentials);
		expect(resp.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
			})
		);
		expect(resp.statusCode).toBe(401);
	});

	test("when user try to login with empty body", async () => {
		const obj = {};
		const resp = await loginUser(obj);
		expect(resp.statusCode).toBe(400);
	});

	test("When user tried to access post url enpoint using token", async () => {
		const resp = await loginUser(loginCredentials);
		const authToken = resp.body.token;
		const data = await addUrl(mockUrl, authToken);
		expect(data.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});

	test("when user tried to access post url endpoint using correct token and then access shortUrl", async () => {
		const resp = await loginUser(loginCredentials);
		const authToken = resp.body.token;
		const data = await addUrl(mockUrl, authToken);
		const id = data.body.urlCode;
		const get = await request(app).get(`/${id}`);
		expect(get.statusCode).toBe(301);
	});

	test("When user login but uses incorrect token", async () => {
		const response = await loginUser(loginCredentials);
		let authToken = response.body.token;
		authToken = authToken.concat("Hello");
		const result = await addUrl(mockUrl, authToken);
		expect(result.statusCode).toBe(401);
	});

	test("When user login but no token used in post /shorten", async () => {
		const response = await loginUser(loginCredentials);
		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
				token: expect.any(String),
			})
		);
		const authToken = "";
		const result = await addUrl(mockUrl, authToken);
		expect(result.statusCode).toBe(401);
	});

	test("When user login and generate token but in url post request enters an empty body", async () => {
		const response = await loginUser(loginCredentials);
		const authToken = response.body.token;
		const obj = {};
		const data = await addUrl(obj, authToken);
		expect(data.statusCode).toBe(400);
	});
	test("When user login and generate token but in url post request enters an invalid body", async () => {
		const response = await loginUser(loginCredentials);
		const authToken = response.body.token;
		const obj = {
			url: "www.google.com",
		};
		const data = await addUrl(obj, authToken);
		expect(data.statusCode).toBe(400);
	});
	test("when user login and generate token and post the url correctly but in get request enter invalid id", async () => {
		const response = await loginUser(loginCredentials);
		const authToken = response.body.token;
		const result = await addUrl(mockUrl, authToken);
		expect(result.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
		const id = "jiukdfbvf";
		const data = await getObjById(id);
		expect(data.statusCode).toBe(404);
	});

	test("when user login and generate token and post the url correctly but in get request enter empty id", async () => {
		const response = await loginUser(loginCredentials);
		const authToken = response.body.token;
		const result = await addUrl(mockUrl, authToken);
		expect(result.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
		const id = "";
		const data = await getObjById(id);
		expect(data.statusCode).toBe(404);
	});
});
