require("dotenv").config();
const {
	addUserHelper,
	existUser,
	tokenGeneration,
	checkBody,
	userAndPasswordCheck,
} = require("../services/user.dataHelper");
const { isValidEmail } = require("../utils/utils");

exports.addUser = async (req, res) => {
	const { email } = req.body;
	const response = checkBody(req.body);
	if (response === true) {
		const existingUser = await existUser(email);
		if (existingUser) {
			res.status(409).json({
				message: "User already Exists",
			});
			return;
		}
		const obj = await addUserHelper(req.body);
		const token = tokenGeneration(obj);
		res.status(201).json({
			status: "success",
			hint: "successfully registered",
			token: token,
		});
	} else {
		res.status(response.statusCode).json(response.message);
	}
};

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
		console.log(obj);
		const token = tokenGeneration(obj);
		res.status(200).json({ message: "Logged In Successfully", token: token });
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "something went wrong",
		});
	}
};
