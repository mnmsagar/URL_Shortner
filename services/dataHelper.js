const randomstring = require("randomstring");
const isUrlHttp = require("is-url-http");
const { getDb } = require("../connection");

module.exports = {
	writeToDb: async (url) => {
		const id = randomstring.generate(8);
		const obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
		};
		const newObj = {
			...obj,
		};
		const result = await getDb().collection("urlshortner").insertOne(obj);
		if (!result.acknowledged) {
			return {
				message: "Database disconnected",
			};
		}
		return newObj;
	},
	getObjById: async (id) => {
		const obj = await getDb().collection("urlshortner").findOne({ urlCode: id });
		return obj;
	},

	checkBodyandURL: (body) => {
		if (body.url) {
			let isValidURl = isUrlHttp(body.url);
			return isValidURl;
		}
		return false;
	},
};
