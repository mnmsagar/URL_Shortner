const dataHelper = require("../services/dataHelper.js");
const isUrlHttp = require("is-url-http");

exports.addURL = async (req, res) => {
	if (!dataHelper.checkBodyandURL(req.body)) {
		res.status(400).json({
			status: "Failed",
			hint_text: "Either no input or URL is not valid",
		});
		return { error: "new Error" };
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
	// we need to use null here not undefined (important) 
	if (obj === null) {
		res.status(404).json({
			status: "Not Found any URL, Check your ShortId",
		});
		return { error: "new Error" };
	}
	res.redirect(301, obj.longUrl);
};

exports.getAll = async (req, res) => {
	const data = await dataHelper.getAll();
	res.send(data);
}
