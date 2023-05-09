const fs = require("fs");
// const data = JSON.parse(fs.readFileSync(`${__dirname}/../models/data.json`));

const dbConnect = require("../connection.js");
const randomstring = require("randomstring");
const { writeFileAsync } = require("./fileHelper");
const isUrlHttp = require("is-url-http");

module.exports = {
	writeToFile: async (url) => {
		const id = await randomstring.generate(8);
		const obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
		};
		const newObj = {
			...obj
		}
		let data = await dbConnect();
		await data.insertOne(obj);
		return newObj;
		
	},
	getObjById: async (id) => {
		const data = await dbConnect();
		const obj = data.findOne({ urlCode: id });
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
