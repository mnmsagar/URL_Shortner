const { validate } = require("email-validator");
const passwordValidator = require("password-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

exports.isValidString = (str) => {
	if (str.trim().length === 0) {
		return false;
	}
	if (/[\d~`!@#$%^&*()_+=[\]{};':"\\|,.<>/?]+/.test(str)) {
		return false;
	}
	return true;
};

const schema = new passwordValidator();
schema
	.is()
	.min(8) // Minimum length 8
	.is()
	.max(100) // Maximum length 100
	.has()
	.uppercase() // Must have uppercase letters
	.has()
	.lowercase() // Must have lowercase letters
	.has()
	.digits(2) // Must have at least 2 digits
	.has()
	.not()
	.spaces(); // Should not have spaces

exports.isValidPassword = (password) => {
	return schema.validate(password);
};

exports.hashPassword = (password) => {
	const hmac = crypto.createHmac("sha512", process.env.HASH_KEY);
	hmac.update(password);
	const passwordHash = hmac.digest("hex");
	return passwordHash;
};

exports.isValidEmail = (email) => {
	return validate(email);
};

exports.tokenGeneration = (obj) => {
	const token = jwt.sign({ email: obj.email, userID: obj._id }, process.env.SECRET_KEY);
	return token;
};

exports.otpGenerator = () => {
	const generatedOTP = otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		specialChars: false,
		lowerCaseAlphabets: false,
	});
	return generatedOTP;
};

exports.badRequest = (message) => {
	return { message: message, statusCode: 400 };
};

exports.unAuthorisedReq = (message) => {
	return {
		message,
		statusCode: 401,
	};
};

exports.notFoundReq = (message) => {
	return {
		message,
		statusCode: 404,
	};
};

exports.createdReq = (message) => {
	return {
		message,
		statusCode: 201,
	};
};

exports.okReq = (message) => {
	return {
		message,
		statusCode: 200,
	};
};

exports.findOTP = (str) => {
	let otp = "";
	for (let i = 0; i < str.length; i++) {
		let currentChar = parseInt(str[i]);
		if (!isNaN(currentChar) && currentChar >= 0 && currentChar <= 9) {
			otp += currentChar.toString();
			if (otp.length === 6) {
				return otp;
			}
		} else {
			otp = "";
		}
	}
	return "No OTP found";
};
