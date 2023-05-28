const { validate } = require("email-validator");
const passwordValidator = require("password-validator");
const { createHmac } = require("crypto");
const { sign } = require("jsonwebtoken");
const { generate } = require("otp-generator");

const myHeaders = new Headers();
myHeaders.append("apikey", "nMO6iHmcwxvPl4MiDtjKbDuvKFJhFPC3");

const isValidString = (str) => {
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

const isValidPassword = (password) => {
	return schema.validate(password);
};

const hashPassword = (password) => {
	const hmac = createHmac("sha512", process.env.HASH_KEY);
	hmac.update(password);
	const passwordHash = hmac.digest("hex");
	return passwordHash;
};

const isValidEmail = (email) => {
	return validate(email);
};

const tokenGeneration = (obj) => {
	const token = sign({ email: obj.email, userID: obj._id }, process.env.SECRET_KEY);
	return token;
};

const otpGenerator = () => {
	const generatedOTP = generate(6, {
		upperCaseAlphabets: false,
		specialChars: false,
		lowerCaseAlphabets: false,
	});
	return generatedOTP;
};

const badRequest = (message) => {
	return { message: message, statusCode: 400 };
};

const createdResp = (message) => {
	return {
		message,
		statusCode: 201,
	};
};

const findOTP = (str) => {
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

const requestOptions = {
	method: "GET",
	redirect: "follow",
	headers: myHeaders,
};

const fetchData = async (hashed_mail) => {
	try {
		const response = await fetch(`https://api.apilayer.com/temp_mail/mail/id/${hashed_mail}`, requestOptions);
		const result = await response.text();
		const data = JSON.parse(result);
		const otp = findOTP(data[data.length - 1].mail_text);
		return otp;
	} catch (error) {
		console.log("error", error);
	}
};

module.exports = {
	findOTP,
	fetchData,
	createdResp,
	badRequest,
	isValidString,
	isValidPassword,
	otpGenerator,
	tokenGeneration,
	isValidEmail,
	hashPassword,
};
