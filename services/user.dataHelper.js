require("dotenv").config();
const { getDb } = require("../connection");
const { isValidPassword, isValidString, isValidEmail, hashPassword, otpGenerator } = require("../utils/utils");
const { badRequest, createdResp } = require("../utils/utils");
const { sendForgetPasswordEmail, sendResendOtpMail, sendVerificationEmail } = require("../utils/email");

const findUser = async (arr) => {
	return await getDb().collection("users").findOne(arr[0], arr[1]);
};
const insertUser = async (obj) => {
	return await getDb().collection("users").insertOne(obj);
};
const deleteUser = async (obj) => {
	return await getDb().collection("users").deleteOne(obj);
};
const updateUser = async (arr) => {
	return await getDb().collection("users").updateOne(arr[0], arr[1], arr[2]);
};

const findOtp = async (obj) => {
	return await getDb().collection("otp").findOne(obj);
};

const insertOtp = async (obj) => {
	return await getDb().collection("otp").insertOne(obj);
};

const deleteOtp = async (obj) => {
	return await getDb().collection("otp").deleteOne(obj);
};

const updateOtp = async (arr) => {
	return await getDb().collection("otp").updateOne(arr[0], arr[1], arr[2]);
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
	const result = await findUser([
		{ email: email, password: password, isRegistered: true },
		{ projection: { _id: 1, email: 1, isLoginEnabled: 1 } },
	]);
	if (!result) {
		return {
			message: "Invalid Credentials",
		};
	}
	if (!result.isLoginEnabled) {
		return {
			message: "User is disabled for login, Pls contact admin!!",
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
		isLoginEnabled: true,
		expiresAt: new Date(),
		isAdmin: false,
	};
	const userInsert = await insertUser(user);
	if (!userInsert.acknowledged) {
		throw Error("User Insertion Error in userMail!!");
	}
	const otpData = {
		otp,
		email,
		expiresAt: new Date(),
	};
	const otpInsert = await insertOtp(otpData);
	if (!otpInsert.acknowledged) {
		throw Error("OTP Insertion Error in userMail!!");
	}
	await sendVerificationEmail(name, email, otp);
	return createdResp("A OTP has been sent to you via your mail address, Please enter the OTP to get authenticated.");
};

const verifyUser = async (body) => {
	const { otp, email } = body;
	if (!otp || !email) {
		return badRequest("Invalid Body");
	}
	const userExisting = await findUser([{ email }]);
	if (!userExisting) {
		return badRequest(
			"Please Signup first to get verified!! Maybe you haven't registered yet or your session expired !!"
		);
	}
	if (userExisting.isRegistered) {
		return { statusCode: 409, message: "Already Registered" };
	}
	const userOtp = await findOtp({ email, otp });
	if (!userOtp) {
		return badRequest("Either email or OTP are incorrect or OTP expired!!, Please Check");
	}
	const updatedObj = await updateUser([{ email: email }, { $set: { isRegistered: true }, $unset: { expiresAt: 1 } }]);
	if (!updatedObj.matchedCount || !updatedObj.modifiedCount) {
		throw new Error("Updation Error in verifyUser");
	}
	const deletedOTP = await deleteOtp({ email });
	if (!deletedOTP.deletedCount || !deletedOTP.acknowledged) {
		throw Error("Deletion Error in verifyUser!!");
	}
	return createdResp("Registration Successful!!");
};

const resendOtp = async (body) => {
	const { email } = body;
	const user = await findUser([{ email }]);
	const otp = otpGenerator();
	if (!user) {
		return badRequest("Session expired or user not signedUp");
	}
	if (user.isRegistered) {
		return badRequest("User already registerted");
	}
	const updatedOtp = await updateOtp([
		{ email: email },
		{ $set: { otp: otp, expiresAt: Date.now(), isResendOtp: true } },
		{ upsert: true },
	]);
	if ((!updatedOtp.matchedCount || !updatedOtp.modifiedCount) && !updatedOtp.upsertedCount) {
		throw new Error("OTP updation error in resendOtp");
	}
	await sendResendOtpMail(user.name, email, otp);
	return createdResp("OTP resend successfully");
};

const forgetPass = async (email) => {
	if (!isValidEmail(email)) {
		return badRequest("invalid email !!");
	}
	const user = await findUser([{ email: email, isRegistered: true }]);
	if (!user) {
		return badRequest("User not registered !!");
	}
	const otp = otpGenerator();
	const updatedOtp = await updateOtp([
		{ email: email },
		{ $set: { otp: otp, expiresAt: Date.now(), isforgetPassOtp: true } },
		{ upsert: true },
	]);
	if ((!updatedOtp.matchedCount || !updatedOtp.modifiedCount) && !updatedOtp.upsertedCount) {
		throw new Error("Error in updation/upsert in forget password !!");
	}
	await sendForgetPasswordEmail(user.name, email, otp);
	return createdResp("OTP Successfully sent to your email");
};

const resetPass = async (body) => {
	const { email, otp, newPassword } = body;
	if (!email || !otp || !newPassword) {
		return badRequest("invalid body");
	}
	const otpUser = await findOtp({ email: email, otp: otp });
	if (!otpUser) {
		return badRequest("Either invalid otp or user not registered!!");
	}
	const hashedPassword = hashPassword(newPassword);
	const updatedObj = await updateUser([
		{ email: otpUser.email, isRegistered: true },
		{ $set: { password: hashedPassword } },
	]);
	if (!updatedObj.modifiedCount || !updatedObj.matchedCount) {
		throw new Error("Updation failed in resetPass helper");
	}
	const deletedObj = await deleteOtp({ email: otpUser.email });
	if (!deletedObj.deletedCount || !deletedObj.acknowledged) {
		throw new Error("deletion failed in resetPass helper");
	}
	return createdResp("password succesfully updated!!");
};

const updatePass = async (email, oldPassword, newPassword) => {
	const hashedOldPassword = hashPassword(oldPassword);
	const user = await findUser([{ email: email, password: hashedOldPassword }]);
	if (!user) {
		return badRequest("old password is incorrect");
	}
	if (!isValidPassword(newPassword)) {
		return badRequest(
			"Invalid password, Password should contain : min length of 8 characters, max of 100 characters, Must have uppercase letters, must have lowercase letters, must have at least 2 digits, should not have any spaces"
		);
	}
	const hashedNewPassword = hashPassword(newPassword);
	const updatedObj = await updateUser([{ email: email }, { $set: { password: hashedNewPassword } }]);
	if (!updatedObj.modifiedCount || !updatedObj.matchedCount) {
		throw new Error("updation failed in updatePass helper!!");
	}
	return createdResp("Password Successfully changed");
};

module.exports = {
	findUser,
	deleteUser,
	updateUser,
	insertUser,
	checkBody,
	userAndPasswordCheck,
	userMail,
	verifyUser,
	resendOtp,
	forgetPass,
	resetPass,
	updatePass,
	findOtp,
	updateOtp,
	deleteOtp,
	insertOtp,
};
