const dataHelper = require("../services/dataHelper.js");
const isUrlHttp = require("is-url-http");
const {checkBody} = require("../services/dataHelper.js");

exports.addURL = (req, res) => {
	if(!checkBody(req.body)){
		res.status(401).json({
			status : "Failed",
			message : "Either you haven't input anything or you are not entering URL"
		});
		return;
	}
	let isValidUrl = isUrlHttp(req.body.url);
	if (!isValidUrl) {
		res.status(404).json({ status: "Failed", hint_text: "Check your URL, Enter a Valid URL" });
		return;
	}
	let obj = dataHelper.writeToFile(req.body.url);
	res.status(200).json(obj);
};

exports.getLink = (req, res) => {
	let id = req.params.id;
	if (id === " ") {
		res.status(404).json({
			status: "Not found",
		});
	}
	const obj = dataHelper.getObjById(id);
	if (obj === undefined) {
		res.status(404).json({
			status: "Not Found any URL, Checck your ShortId",
		});
		return;
	}
	// res.status(301).redirect(obj.longUrl);
	res.status(201).send(obj);
};


