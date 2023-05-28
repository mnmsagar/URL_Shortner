require("dotenv").config();
const { getDb } = require("../connection");
const { isValidPassword, isValidString, isValidEmail, hashPassword, otpGenerator } = require("../utils/utils");
const { badRequest, createdResp } = require("../utils/utils");
const { sendVerificationMail } = require("../utils/email");

const existingUser = async (email) => {
	const obj = await getDb().collection("users").findOne({ email: email });
	return obj;
};

const checkBody = (body) => {
	const { name, email, password } = body;
	if (!name || !email || !password) {
		return badRequest("Invalid name, Please use characters only");
	}
	if (!isValidString(name)) {
		return badRequest("Invalid name, Please use characters only");
	}
	if (!isValidEmail(email)) {
		return badRequest("Invalid email, Please type correct email");
	}
	if (!isValidPassword(password)) {
		return badRequest(
			"Invalid password, Password should contain : min length of 8 characters, max of 100 characters, Must have uppercase letters, must have lowercase letters, must have at least 2 digits, should not have any spaces"
		);
	}
	return true;
};

const userAndPasswordCheck = async (email, password) => {
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

const userMail = async (body) => {
	let { email, password, name } = body;
	const otp = otpGenerator();
	const hashedPassword = hashPassword(password);
	const user = {
		name,
		email,
		password: hashedPassword,
		isRegistered: false,
		expiresAt: new Date(),
	};
	const userInsert = await getDb().collection("users").insertOne(user);
	if (!userInsert.acknowledged) {
		throw Error("User Insertion Error in userMail!!");
	}
	const otpData = {
		otp,
		email,
		expiresAt: new Date(),
	};
	const otpInsert = await getDb().collection("otp").insertOne(otpData);
	if (!otpInsert.acknowledged) {
		throw Error("OTP Insertion Error in userMail!!");
	}
	await sendVerificationMail(email, otp, name);
	return createdResp("A OTP has been sent to you via your mail address, Please enter the OTP to get authenticated.");
};

const verifyUser = async (body) => {
	const { otp, email } = body;
	if (!otp || !email) {
		return badRequest("Invalid Body");
	}
	const userExisting = await existingUser(email);
	if (!userExisting) {
		return badRequest(
			"Please Signup first to get verified!! Maybe you haven't registered yet or your session expired !!"
		);
	}
	if (userExisting.isRegistered) {
		return { statusCode: 409, message: "Already Registered" };
	}
	const userOtp = await getDb().collection("otp").findOne({ email, otp });
	if (!userOtp) {
		return badRequest("Either email or OTP are incorrect or OTP expired!!, Please Check");
	}
	const updatedObj = await getDb()
		.collection("users")
		.updateOne({ email: email }, { $set: { isRegistered: true }, $unset: { expiresAt: 1 } });
	if (!updatedObj.matchedCount || !updatedObj.modifiedCount) {
		throw new Error("Updation Error in verifyUser");
	}
	const deletedOTP = await getDb().collection("otp").deleteOne({ email });
	if (!deletedOTP.deletedCount || !deletedOTP.acknowledged) {
		throw Error("Deletion Error in verifyUser!!");
	}
	return createdResp("Registration Successful!!");
};

const resendOtp = async (body) => {
	const { email } = body;
	const user = await existingUser(email);
	const otp = otpGenerator();
	if (!user) {
		return badRequest("Session expired or user not signedUp");
	}
	if (user.isRegistered) {
		return badRequest("User already registerted");
	}
	const updatedOtp = await getDb()
		.collection("otp")
		.updateOne({ email: email }, { $set: { otp: otp, expiresAt: new Date() } }, { upsert: true });
	if ((!updatedOtp.matchedCount || !updatedOtp.modifiedCount) && !updatedOtp.upsertedCount) {
		throw new Error("OTP updation error in resendOtp");
	}
	await sendVerificationMail(email, otp, user.name);
	return createdResp("OTP resend successfully");
};

module.exports = {
	existingUser,
	checkBody,
	userAndPasswordCheck,
	userMail,
	verifyUser,
	resendOtp,
};
