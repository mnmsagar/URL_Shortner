const dataHelper = require("../services/dataHelper.js");
const isUrlHttp = require("is-url-http");

exports.addURL = (req, res) => {
	if(!(dataHelper.checkBodyandURL(req.body))){
		res.status(400).json({
			status : "Failed",
			hint_text : "Either no input or URL is not valid"
		})
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
	res.redirect(301,obj.longUrl);
	// res.status(201).send(obj);
};


