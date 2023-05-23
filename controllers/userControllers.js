require("dotenv").config();
const {
	addUserHelper,
	existUser,
	tokenGeneration,
	checkBody,
	userAndPasswordCheck,
	userMail,
	verifyHandler,
} = require("../services/user.dataHelper");
const { isValidEmail, hashPassword } = require("../utils/utils");

// exports.addUser = async (req, res) => {
// 	try {
// 		const { email } = req.body;
// 		const result = checkBody(req.body);

// 		if (result.message) {
// 			res.status(result.statusCode).json(result.message);
// 			return;
// 		}
// 		const existingUser = await existUser(email);
// 		if (existingUser) {
// 			res.status(409).json({
// 				message: "User already Exists",
// 			});
// 			return;
// 		}
// 		const obj = await addUserHelper(req.body);
// 		const token = tokenGeneration(obj);
// 		res.status(201).json({
// 			status: "success",
// 			hint: "successfully registered",
// 			token: token,
// 		});
// 	} catch (error) {
// 		res.status(500).json({
// 			message: "Something went wrong",
// 			error: error.stack,
// 		});
// 	}
// };

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
		res.status(500).json({
			message: "Something went wrong",
			error,
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

// exports.emailVerification = async (req, res) => {
// 	const { name, email, password } = req.body;
// 	const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
// 	sendVerificationMail(email, otp, name);
// 	res.json({
// 		message: "sent",
// 	});
// };

exports.signUp = async (req, res) => {
	try {
		let { email, name, password } = req.body;
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
		await userMail(req.body);
		res.status(200).json({
			message: `A OTP has been sent to you via your mail address, Please enter the OTP to get authenticated. Please use this link to enter your otp : http://localhost/${process.env.PORT}/users/verify-email`,
		});
	} catch (error) {
		res.status(500).json({
			message: "something went wrong",
			error: error.stack,
		});
	}
};

exports.verifyMail = async (req, res) => {
	console.log(req.body);
	await verifyHandler(req.body);

	res.status(201).json({
		message: "user successfully registered",
	});
};
