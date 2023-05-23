require("dotenv").config();
const {
	addUserHelper,
	existUser,
	tokenGeneration,
	checkBody,
	userAndPasswordCheck,
} = require("../services/user.dataHelper");
const { sendVerificationMail } = require("../utils/email");
const { isValidEmail } = require("../utils/utils");
const otpGenerator = require("otp-generator");

exports.addUser = async (req, res) => {
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
		const obj = await addUserHelper(req.body);
		const token = tokenGeneration(obj);
		res.status(201).json({
			status: "success",
			hint: "successfully registered",
			token: token,
		});
	} catch (error) {
		res.status(500).json({
			message: "Something went wrong",
			error,
		});
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

exports.emailVerification = async (req, res) => {
	const { name, email, password } = req.body;
	const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
	sendVerificationMail(email, otp, name);
	res.json({
		message: "sent",
	});
};
