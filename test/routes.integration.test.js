const request = require("supertest");
const express = require("express");
const route = require("../routes/routes");
const {expect} = require("jest");

const app = express();
app.use(express.json());
app.use("/", route.router); 

describe("integration tests for the URL API",()=>{
	it("GET /:id",async ()=>{
		const {body, statusCode} = await request(app).get("/:id");
		expect(body).toEqual({
			expect.objectContaining({
				urlCode :expect.any("string"),
				longUrl : expect.any("string"),
				shortUrl :expect.any("string")
			})
		})
		expect(statusCode).toBe(200);
	})
})

  