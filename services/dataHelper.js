require("dotenv").config();
const randomstring = require("randomstring");
const isUrlHttp = require("is-url-http");
const { getDb } = require("../connection");

module.exports = {
	writeToDb: async (url, email) => {
		const id = randomstring.generate(8);
		const obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
			email: email,
		};
		const insertData = await getDb().collection("urlshortner").insertOne(obj);
		if (!insertData.acknowledged) {
			throw new Error("Insertion Failed in URL writing in Db");
		}
		delete obj._id;
		delete obj.email;
		return obj;
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
