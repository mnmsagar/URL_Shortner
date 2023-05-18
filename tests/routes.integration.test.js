const request = require("supertest");
const { app } = require("../app");


describe("GET Testing", () => {
	test("Get by Id", async () => {
		const obj = {
			url: "https://www.google.com",
		};
		const response = await request(app).post("/shorten").send(obj);
		const data = await request(app).get(`/${response.body.urlCode}`);
		expect(data.statusCode).toBe(301);

	});
	it("When We try to use Empty Short ID", async () => {
		const id = " ";
		const data = await request(app).get(`/${id}`);
		expect(data.statusCode).toBe(404);
	});
	it("When you enter invalid Short ID", async () => {
		const id = "jiukdfbvf";
		const data = await request(app).get(`/${id}`);
		expect(data.statusCode).toBe(404);
	});
});

describe("Post Testing",()=>{
	it("When you post the url correctly", async () => {
		const obj = {
			url: "https://www.google.com",
		};
		const data = await request(app).post("/shorten").send(obj);
		expect(data.body).toEqual(
				expect.objectContaining({
					urlCode : expect.any(String),
					longUrl : expect.any(String),
					shortUrl :expect.any(String)
				})
		)
		expect(data.statusCode).toBe(200);
	});
	it("When request body is empty", async () => {
		const obj = {};
		const data = await request(app).post("/shorten").send(obj);
		expect(data.statusCode).toBe(400);
	});
	it("when request body is invalid", async () => {
		const obj = {
			url: "www.google.com",
		};
		const data = await request(app).post("/shorten").send(obj);
		expect(data.statusCode).toBe(400);
	});
});