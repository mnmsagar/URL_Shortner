const { deleteUserHelper, disableLoginHelper, enableLoginHelper } = require("../services/admin.dataHelper");

const disableLogin = async (req, res) => {
	try {
		const obj = await disableLoginHelper(req.body);
		res.status(obj.statusCode).json(obj.message);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};

const deleteUser = async (req, res) => {
	try {
		const obj = await deleteUserHelper(req.body);
		res.status(obj.statusCode).json(obj.message);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong!!",
		});
	}
};

const enableLogin = async (req, res) => {
	try {
		const obj = await enableLoginHelper(req.body);
		res.status(obj.statusCode).json(obj.message);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};

module.exports = {
	disableLogin,
	deleteUser,
	enableLogin,
};
