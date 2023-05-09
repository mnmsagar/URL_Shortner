const fs = require("fs");
const data = JSON.parse(fs.readFileSync(`${__dirname}/../models/data.json`));
const randomstring = require("randomstring");
const { writeFileAsync } = require("./fileHelper");
const isUrlHttp = require("is-url-http");

module.exports = {
	writeToFile: (url) => {
		let id = randomstring.generate(8);
		let obj = {
			urlCode: id,
			longUrl: url,
			shortUrl: `http://localhost:${process.env.PORT || 3000}/${id}`,
		};
		data.push(obj);

		writeFileAsync(data)
			.then((result) => {
				console.log(result);
			})
			.catch((err) => {
				console.log(err);
			});

		return obj;
	},
	getObjById: (id) => {
		const object = data.find((ele) => {
			return ele.urlCode === id;
		});
		console.log(object);
		return object;
	},

	checkBodyandURL: (body) => {
		if (body.url) {
			let isValidURl = isUrlHttp(body.url);
			return isValidURl;
		}
		return false;
	}
};
