const dataHelper = require("../services/dataHelper.js");
const isUrlHttp = require("is-url-http");
const dbConnect = require("../connection.js");

exports.addURL = async (req, res) => {
	if (!dataHelper.checkBodyandURL(req.body)) {
		res.status(400).json({
			status: "Failed",
			hint_text: "Either no input or URL is not valid",
		});

		return {error:"new Error"};
	}

	let obj = await dataHelper.writeToFile(req.body.url);
	res.status(200).send(obj);
};

exports.getLink = async (req, res) => {
	let id = req.params.id;
	if (id === " ") {
		res.status(404).json({
			status: "Not found",
		});
	}
	const obj = await dataHelper.getObjById(id);
	if (obj === undefined) {
		res.status(404).json({
			status: "Not Found any URL, Checck your ShortId",
		});
		return;
	}
	res.redirect(301, obj.longUrl);
	// res.status(201).send(obj);
};

exports.getAll = async (req, res) => {
	let data = await dbConnect();
	data = await data.find().toArray();
	res.json(data);
};
