exports.isLoginEnabled = async (req, res, next) => {
	if (!req.user.isLoginEnabled) {
		res.status(400).json({
			status: "failed",
			message: "you are disabled by admin, pls contact administrator!!",
		});
		return;
	}
	next();
};
