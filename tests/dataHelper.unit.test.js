const datahelper = require("../services/dataHelper");

describe("Check URL", () => {
	it("URL Checking when body is not present", () => {
		let body = {};
		expect(datahelper.checkBodyandURL(body)).toEqual(false);
	});
	it("URL Checking when body have invalid URL", () => {
		const body1 = {
			url: "www.google.com",
		};
		expect(datahelper.checkBodyandURL(body1)).toEqual(false);
		const body2 = {
			url: "google.com",
		};
		expect(datahelper.checkBodyandURL(body2)).toEqual(false);
	});
	it("URL Checking when body and URL are valid", () => {
		let body = {
			url: "https://www.google.com",
		};
		expect(datahelper.checkBodyandURL(body)).toBe(true);
	});
});

describe("Write to File", () => {
	it("When URL is entered", () => {
		let url = "https://www.google.com";
		expect(datahelper.writeToFile(url)).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});
});

describe("Get by ID", () => {
	it("when ID is correct", () => {
		let mainUrl = "https://www.google.com";
		const { urlCode, shortUrl, url } = datahelper.writeToFile(mainUrl);
		let id = urlCode;
		expect(datahelper.getObjById(id)).toEqual(
			expect.objectContaining({
				urlCode: expect.any(String),
				longUrl: expect.any(String),
				shortUrl: expect.any(String),
			})
		);
	});
	it("When ID is incorrect", () => {
		let id = "hjdvjbs";
		expect(datahelper.getObjById(id)).toBeUndefined();
	});
});
