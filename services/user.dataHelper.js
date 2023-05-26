require("dotenv").config();
const { getDb } = require("../connection");
const {
	isValidPassword,
	isValidString,
	isValidEmail,
	hashPassword,
	otpGenerator,
	tokenGeneration,
} = require("../utils/utils");
const { notFoundReq, unAuthorisedReq, badRequest, createdReq, okReq } = require("../utils/utils");
const { sendVerificationMail } = require("../utils/email");

const existingUser = async (email) => {
	const obj = await getDb().collection("users").findOne({ email: email });
	return obj;
};

exports.addUserHelper = async (body) => {
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
};

exports.existUser = async (email) => {
	const obj = await getDb().collection("users").findOne({ email: email });
	return obj;
};

exports.checkBody = (body) => {
	const { name, email, password } = body;
	if (!name || !email || !password) {
		badRequest("Enter valid name, email and password");
	}
	if (!isValidString(name)) {
		badRequest("Invalid name, Please use characters only");
	}
	if (!isValidEmail(email)) {
		badRequest("Invalid email, Please type correct email");
	}
	if (!isValidPassword(password)) {
		badRequest(
			"Invalid password, Password should contain : min length of 8 characters, max of 100 characters, Must have uppercase letters, must have lowercase letters, must have at least 2 digits, should not have any spaces"
		);
	}
	return true;
};

exports.userAndPasswordCheck = async (email, password) => {
	password = hashPassword(password);
	const result = await getDb()
		.collection("users")
		.findOne({ email: email, password: password, isRegistered: true }, { projection: { _id: 1, email: 1 } });
	if (!result) {
		return {
			message: "Invalid Credentials",
		};
	}
	return result;
};

exports.userMail = async (body) => {
	let { email, password, name } = body;
	const otp = otpGenerator();
	const hashedPassword = hashPassword(password);
	getDb().collection("users").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 600 });
	getDb().collection("otp").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 120 });
	const user = {
		name,
		email,
		password: hashedPassword,
		isRegistered: false,
		expiresAt: new Date(),
	};
	const userInsert = await getDb().collection("users").insertOne(user);
	if (!userInsert.acknowledged) {
		throw Error("User Insertion Failed!!");
	}
	const otpData = {
		otp,
		email,
		expiresAt: new Date(),
	};
	const otpInsert = await getDb().collection("otp").insertOne(otpData);
	if (!otpInsert.acknowledged) {
		throw Error("OTP Insertion Failed!!");
	}
	await sendVerificationMail(email, otp);
	createdReq("A OTP has been sent to you via your mail address, Please enter the OTP to get authenticated.");
};

exports.verifyUser = async (body) => {
	const { otp, email } = body;
	const OriginalUser1 = await existingUser(email);
	console.log(OriginalUser1);
	if (!OriginalUser1) {
		badRequest("Please Signup first to get verified!!");
	}
	if (OriginalUser1.isRegistered) {
		return { statusCode: 409, message: "Already Registered" };
	}
	if (!otp || !email) {
		badRequest("Please give otp and email both");
	}
	const userOtp = await getDb().collection("otp").findOne({ email, otp });
	if (!userOtp) {
		badRequest("Either email or OTP are incorrect or OTP expired!!, Please Check");
	}
	const updatedObj = await getDb()
		.collection("users")
		.updateOne({ email: email }, { $set: { isRegistered: true }, $unset: { expiresAt: 1 } });
	if (!updatedObj.matchedCount || !updatedObj.modifiedCount) {
		throw new Error("Updation Problem");
	}
	const token = tokenGeneration({ email: OriginalUser1.email, _id: OriginalUser1._id });
	const deletedOTP = await getDb().collection("otp").deleteOne({ email });
	if (!deletedOTP.deletedCount || !deletedOTP.acknowledged) {
		throw Error("Deletion Failed!!");
	}
	return { statusCode: 201, message: "Registration Successful", token };
};

exports.resendOtp = async (body) => {
	const { email } = body;
	const otpObj = await getDb().collection("otp").findOne({ email });
	const otp = otpGenerator();
	sendVerificationMail(email, otp);
	if (!otpObj) {
		return {
			statusCode: 403,
			message: "Session expired, Please Signup again",
		};
	}
	getDb()
		.collection("otp")
		.updateOne({ email: email }, { $set: { otp: otp, createdAt: Date.now(), expireAt: Date.now() + 120000 } });
	createdReq("OTP resend successfully");
};
