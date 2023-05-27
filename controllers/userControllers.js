require("dotenv").config();
const {
	existUser,
	checkBody,
	userAndPasswordCheck,
	userMail,
	verifyUser,
	resendOtp,
} = require("../services/user.dataHelper");
const { isValidEmail, tokenGeneration } = require("../utils/utils");

exports.userlogin = async (req, res) => {
	const { email, password } = req.body;
	try {
		if (!isValidEmail(email)) {
			res.status(400).json({
				status: "failed",
				message: "Invalid email type",
			});
			return;
		}
		const obj = await userAndPasswordCheck(email, password);
		if (obj.message) {
			res.status(401).json(obj);
			return;
		}
		const token = tokenGeneration(obj);
		res.status(200).json({ message: "Logged In Successfully", token: token });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Something went wrong",
		});
	}
};

exports.signUp = async (req, res) => {
	try {
		const { email } = req.body;
		const result = checkBody(req.body);
		if (result.message) {
			res.status(result.statusCode).json(result.message);
			return;
		}

		const existingUser = await existUser(email);
		if (existingUser) {
			res.status(409).json({
				message: "User already Exists",
			});
			return;
		}
		const obj = await userMail(req.body);
		if (obj.statusCode === 500) {
			res.status(obj.statusCode).json({
				message: obj.message,
			});
			return;
		}
		res.status(obj.statusCode).json({
			message: obj.message,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};

exports.verifyMail = async (req, res) => {
	try {
		const obj = await verifyUser(req.body);
		res.status(obj.statusCode).json({
			message: obj.message,
			token: obj.token,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};

exports.resendOtp = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			res.status(400).json({ message: "Enter email please!" });
			return;
		}
		const resendObj = await resendOtp(req.body);
		res.status(resendObj.statusCode).json(resendObj.message);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};
