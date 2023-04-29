const fs = require("fs");
const data = JSON.parse(fs.readFileSync(`${__dirname}/../models/data.json`));
const randomstring = require("randomstring");
const { writeFileAsync } = require("./fileHelper");

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
		// fs.writeFile(`${__dirname}/../models/data.json`, JSON.stringify(data), (err) => {
		// 	console.log(err);
		// });
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
		return object;
	},
	// urlCheck: (url) => {
	// 	let value = urlCheck(url);
	// 	if (value === true) {
	// 		return url;
	// 	} else {
	// 		this.status.json({
	// 			status: "Enter Correct URL",
	// 		});
	// 		return;
	// 	}
	// },
	checkBody : (body)=>{
		if(body.url){
			return true;
		}
		return false;
	}
};