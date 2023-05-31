exports.isAdmin = async (req, res, next) => {
	if (!req.user.isAdmin) {
		res.status(400).json({
			message: "You are not admin !",
		});
		return;
	}
	next();
};
