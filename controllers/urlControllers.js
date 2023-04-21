const dataHelper = require("../services/dataHelper.js");

exports.addURL = (req, res) => {
	let obj = dataHelper.writeToFile(req.body.url);
	res.status(200).json(obj);
};

exports.getLink = (req, res) => {
	if (req.params.id === " ") {
		res.json({
			status: "Sagar",
		});
		return;
	}
	const object = data.find((ele) => {
		return ele.shortId === req.params.id;
	});
	if (object === undefined) {
		res.status(404).json({
			status: "Not Found",
		});
		return;
	}
	res.status(301).redirect(object.url);
	// console.log(object);
	// console.log(object.url);
	// res.send("Hello");
};
