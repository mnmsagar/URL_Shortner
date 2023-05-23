require("dotenv").config();
const { getDb } = require("../connection");
const jwt = require("jsonwebtoken");
const { isValidPassword, isValidString, isValidEmail, hashPassword } = require("../utils/utils");
const otpGenerator = require("otp-generator");
const { sendVerificationMail } = require("../utils/email");

exports.addUserHelper = async (body) => {
	try {
		const { email, password, name } = body;
		const hashedPassword = hashPassword(password);
		const user = {
			email: email,
			name: name,
			password: hashedPassword,
		};
		const obj = user;
		// const newObj = { ...obj };
		await getDb().collection("users").insertOne(obj);
		delete obj._id;
		return obj;
	} catch (error) {
		console.error("An error occurred: ", error);
		throw error;
	}
};

exports.existUser = async (email) => {
	const obj = await getDb().collection("users").findOne({ email: email });
	return obj;
};

exports.tokenGeneration = (obj) => {
	const token = jwt.sign({ email: obj.email, userID: obj._id }, process.env.SECRET_KEY);
	return token;
};

exports.checkBody = (body) => {
	const { name, email, password } = body;
	if (!isValidString(name)) {
		return {
			message: "Invalid name, Please use characters only",
			statusCode: 400,
		};
	}
	if (!isValidEmail(email)) {
		return {
			message: "Invalid email, Please type correct email",
			statusCode: 400,
		};
	}
	if (!isValidPassword(password)) {
		return {
			message:
				"Invalid password, Password should contain : min length of 8 characters, max of 100 characters, Must have uppercase letters, must have lowercase letters, must have at least 2 digits, should not have any spaces",
			statusCode: 400,
		};
	}
	return true;
};

exports.userAndPasswordCheck = async (email, password) => {
	password = hashPassword(password);
	// console.log(password);
	const result = await getDb()
		.collection("users")
		.findOne({ email: email, password: password }, { projection: { _id: 1, email: 1 } });
	if (!result) {
		return {
			message: "Invalid Credentials",
		};
	}
	return result;
};

exports.userMail = async (body) => {
	let { email, password, name } = body;
	let otp = otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		specialChars: false,
		lowerCaseAlphabets: false,
	});
	await sendVerificationMail(email, otp, name);
	password = hashPassword(password);
	otp = hashPassword(otp);
	const user = {
		name,
		email,
		password,
		otp,
	};
	await getDb().collection("otp").insertOne(user);
};

exports.verifyHandler = async (body) => {
	const { email, otp } = body;
	const user = await getDb()
		.collection("otp")
		.findOne({ email: email, otp: hashPassword(otp) });
	delete user.otp;
	await getDb().collection("users").insertOne(user);
	await getDb().collection("otp").deleteMany({});
};
