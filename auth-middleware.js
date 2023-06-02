const { auth } = require("./services/auth.dataHelper");

exports.checkUserAuth = async (req, res, next) => {
	const { authorization } = req.headers;
	if (authorization && authorization.startsWith("Bearer")) {
		try {
			req.user = await auth(authorization);
			// console.log(req.user);
			next();
		} catch (error) {
			console.error(error);
			res.status(401).json({
				message: "Unauthorised User",
			});
		}
	} else {
		res.status(401).json({
			status: "Failed",
			hint: "Token not sent, Unauthorised User",
		});
	}
};
