require("dotenv").config();
const {
	addUserHelper,
	existUser,
	tokenGeneration,
	checkBody,
	userAndPasswordCheck,
} = require("../services/user.dataHelper");
const { isValidEmail, createPasswordResetToken } = require("../utils/utils");

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
		const token = tokenGeneration(obj);
		res.status(200).json({ message: "Logged In Successfully", token: token });
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Something went wrong",
		});
	}
};

// exports.forgotPassword = async (req, res, next) => {
// 	const {email} = req.body;
// 	// 1. Get user based on posted email
// 	const user = await getDb().collection('users').findOne({email});
// 	if(!user){
// 		res.status(404).json({
// 			message : "user not found"
// 		});
// 	}
// 	// 2. Generate the random reset token
// 	const resetToken = createPasswordResetToken();
// 	// 3. Send it to the user's mail
// };

// exports.resetPassword = (req, res, next) => {};

exports.emailVerification = async (req, res) => {
	console.log(req.params);
	console.log(req.body);
	res.json({
		message: "Hello",
	});
};
