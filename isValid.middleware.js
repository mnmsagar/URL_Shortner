const { isValidEmail } = require("./utils/utils");
exports.isValid = async (req, res, next) => {
	const { email } = req.body;
	if (!email) {
		res.status(400).json({
			message: "invalid body!",
		});
		return;
	}
	if (!isValidEmail(req.body.email)) {
		res.status(400).json({
			message: "Invalid email type",
		});
		return;
	}
	next();
};
