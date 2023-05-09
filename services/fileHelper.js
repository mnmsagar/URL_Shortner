const fs = require("fs");
module.exports = {
	writeFileAsync: (data) => {
		return new Promise((resolve, reject) => {
			// fs.writeFile(`${__dirname}/../models/data.json`, JSON.stringify(data), (err) => {
			// 	if (err) {
			// 		reject(err);
			// 	} else {
			// 		resolve("File written Successfully");
			// 	}
			// });
		});
	},
};