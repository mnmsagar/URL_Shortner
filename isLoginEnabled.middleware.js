const { findUser } = require("./services/user.dataHelper");
exports.isLoginEnabled = async (req, res, next) => {
	const user = await findUser({ email: req.user.email, isLoginEnabled: true });
	if (!user) {
		res.status(400).json({
			status: "failed",
			message: "you are disabled by admin, pls contact administrator!!",
		});
		return;
	}
	next();
};
