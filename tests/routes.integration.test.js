require("dotenv").config();
const request = require("supertest");
const { app } = require("../app");
const { beforeAll, afterAll } = require("@jest/globals");
const { connectToDb, getDb, getClient } = require("../connection");

const mockUserData = {
	name: "Sagar Mishra",
	email: "sagar785mishra@gmail.com",
	password: "Sagar@123",
};

const mockUrl = {
	url: "https://wwww.google.com",
};

// const postURL = async (token, body) => {
//     const result = await request(app).post("/shorten")
// }

describe("Tests", () => {
	beforeAll(async () => {
		await connectToDb(process.env.URI);
	});
	afterAll(async () => {
		const db = getDb();
		await db.collection("users").deleteMany({ email: "sagar785mishra@gmail.com" });
		await db.collection("urlshortner").deleteMany({ longUrl: "https://www.google.com" });
		await getClient().close();
	});

	it("When user tries to signUp it will return object", async () => {
		const response = await request(app).post("/users/reg").send(mockUserData);
		expect(response.body).toEqual(
			expect.objectContaining({
				status: expect.any(String),
				hint: expect.any(String),
				token: expect.any(String),
			})
		);
		expect(response.statusCode).toBe(201);
	});

	it("When user sign up using either invalid name, email or password", async () => {
		const user1 = {
			name: "Sagar1 Mis4shra",
			email: "mishra@gmail.com",
			password: "Sagar@123",
		};
		const respName = await request(app).post("/users/reg").send(user1);
		expect(respName.statusCode).toBe(400);

		const user2 = {
			name: "Sagar Mishra",
			email: "mishra@gmai",
			password: "Sagar@123",
		};
		const respEmail = await request(app).post("/users/reg").send(user2);
		expect(respEmail.statusCode).toBe(400);

		const user3 = {
			name: "Sagar Mishra",
			email: "mishra@gmail.com",
			password: "123456789",
		};
		const respPass = await request(app).post("/users/reg").send(user3);
		expect(respPass.statusCode).toBe(400);
	});

	it("when user tried to sign up with existing email", async () => {
		const result = await request(app).post("/users/reg").send(mockUserData);
		expect(result.statusCode).toBe(409);
	});

	it("When user tries to login with registered email", async () => {
		const result = await request(app).post("/users/login").send(mockUserData);
		expect(result.statusCode).toBe(200);
	});

	it("when user tries to login with non-registered email", async () => {
		const user = {
			name: "Sagar Mishra",
			email: "sagar786mishra@gmail.com",
			password: "123456789",
		};
		const response = await request(app).post("/users/login").send(user);
		expect(response.statusCode).toBe(401);
	});

	it("When user enters incorrect password", async () => {
		const user = {
			name: "Sagar Mishra",
			email: "sagar785mishra@gmail.com",
			password: "1234567",
		};
		const response = await request(app).post("/users/login").send(user);
		expect(response.statusCode).toBe(401);
	});
	it("When user tried to access post url enpoint using token", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		expect(result.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});

	it("when user tried to access post url endpoint using correct token and then access shortUrl", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		const id = result.body.urlCode;
		const get = await request(app).get(`/${id}`);
		expect(get.statusCode).toBe(301);
	});

	it("When user login but uses incorrect token", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		let authToken = response.body.token;
		authToken = authToken.concat("Hello");
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		expect(result.statusCode).toBe(401);
	});

	it("When user login but no token used", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		expect(response.body).toEqual(
			expect.objectContaining({
				message: expect.any(String),
				token: expect.any(String),
			})
		);
		const authToken = "";
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		expect(result.statusCode).toBe(401);
	});

	it("When user login and generate token but in url post request enters an empty body", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const obj = {};
		const data = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(obj);
		expect(data.statusCode).toBe(400);
	});
	it("When user login and generate token but in url post request enters an invalid body", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const obj = {
			url: "www.google.com",
		};
		const data = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(obj);
		expect(data.statusCode).toBe(400);
	});
	it("when user login and generate token and post the url correctly but in get request enter invalid id", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		expect(result.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
		const id = "jiukdfbvf";
		const data = await request(app).get(`/${id}`);
		expect(data.statusCode).toBe(404);
	});

	it("when user login and generate token and post the url correctly but in get request enter empty id", async () => {
		const response = await request(app).post("/users/login").send(mockUserData);
		const authToken = response.body.token;
		const result = await request(app).post("/shorten").set("Authorization", `Bearer ${authToken}`).send(mockUrl);
		expect(result.body).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
		const id = "";
		const data = await request(app).get(`/${id}`);
		expect(data.statusCode).toBe(404);
	});
});
