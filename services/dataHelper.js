const fs = require("fs");
const data = JSON.parse(fs.readFileSync(`${__dirname}/../models/data.json`));
const randomstring = require("randomstring");

module.exports = {
	writeToFile: (url) => {
		let id = randomstring.generate(8);
		let obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
		};
		data.push(obj);
		// Make it synchorous and convert it into a promise
		fs.writeFile(`${__dirname}/../models/data.json`, JSON.stringify(data), (err) => {});
		return obj;
	},
};

