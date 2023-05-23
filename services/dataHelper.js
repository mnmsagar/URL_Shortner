const randomstring = require("randomstring");
const isUrlHttp = require("is-url-http");
const { getDb } = require("../connection");

module.exports = {
	writeToDb: async (url) => {
		try {
			const id = randomstring.generate(8);
			const obj = {
				urlCode: id,
				longUrl: url,
				shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
			};
			await getDb().collection("urlshortner").insertOne(obj);
			delete obj._id;
			return obj;
		} catch (error) {
			console.error("Error Occurred");
			throw error;
		}
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
