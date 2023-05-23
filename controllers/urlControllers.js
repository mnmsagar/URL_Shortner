const { writeToDb, getObjById, checkBodyandURL } = require("../services/dataHelper.js");

exports.addURL = async (req, res) => {
	try {
		if (!checkBodyandURL(req.body)) {
			res.status(400).json({
				status: "Failed",
				hint_text: "Either no input or URL is not valid",
			});
			return { error: "new Error" };
		}
		let obj = await writeToDb(req.body.url);
		console.log(obj);
		res.status(200).send(obj);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Something went wrong",
			error: error.message,
		});
	}
};

exports.getLink = async (req, res) => {
	try {
		let id = req.params.id;
		if (id === " ") {
			res.status(404).json({
				status: "Not found",
			});
			return;
		}
		const obj = await getObjById(id);
		// we need to use null here not undefined (important)
		if (obj === null) {
			res.status(404).json({
				status: "Not Found any URL, Check your ShortId",
			});
			return { error: "new Error" };
		}
		res.redirect(301, obj.longUrl);
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong!",
			error: error.stack,
		});
	}
};
