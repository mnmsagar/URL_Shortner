const randomstring = require("randomstring");
const isUrlHttp = require("is-url-http");
const { getDb } = require("../connection");


module.exports = {
	writeToFile: async (url) => {
		const id = randomstring.generate(8);
		const obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
		};
		const newObj = {
			...obj
		}
		await getDb().collection('urlshortner').insertOne(obj);
		return newObj;

	},
	getObjById: async (id) => {
		const obj = await getDb().collection('urlshortner').findOne({ urlCode: id });
		return obj;
	},

	checkBodyandURL: (body) => {
		if (body.url) {
			let isValidURl = isUrlHttp(body.url);
			return isValidURl;
		}
		return false;
	}
}
