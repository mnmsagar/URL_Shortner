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

exports.checkBody = (body) => {
	const { name, email, password } = body;
	if (!name || !email || !password) {
		return { message: "Enter valid name, email and password", statusCode: 400 };
	}
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
	const otp = otpGenerator();
	sendVerificationMail(email, otp, name);
	const hashedPassword = hashPassword(password);
	const user = {
		name,
		email,
		password: hashedPassword,
		isRegistered: false,
	};
	const userInsert = await getDb().collection("users").insertOne(user);
	if (!userInsert.acknowledged) {
		throw Error("Insertion Failed!!");
	}
	const otpData = {
		otp,
		email,
		createdAt: Date.now(),
		expireAt: Date.now() + 120000,
	};
	const otpInsert = await getDb().collection("otp").insertOne(otpData);
	if (!otpInsert.acknowledged) {
		throw Error("Insertion Failed!!");
	}
};

exports.verifyHandler = async (body) => {
	const { otp, email } = body;
	const originalUser = await getDb().collection("users").findOne({ email });
	if (!originalUser) {
		return { statusCode: 400, message: "Please Signup to get verified!!" };
	}
	if (originalUser.isRegistered) {
		return { statusCode: 400, message: "Already Registered" };
	}
	if (!otp || !email) {
		return { statusCode: 400, message: "Please give otp and email both" };
	}
	const user = await getDb().collection("otp").findOne({ email, otp });
	if (!user) {
		return {
			statusCode: 401,
			message: "Either email or OTP are incorrect or OTP or User not found!!, Please Check",
		};
	}
	if (user.expireAt < Date.now()) {
		await getDb().collection("otp").deleteOne(user);
		return { statusCode: 401, message: "OTP Expired" };
	}
	const updatedObj = await getDb()
		.collection("users")
		.updateOne({ email: email }, { $set: { isRegistered: true } });
	if (!updatedObj.matchedCount && !updatedObj.modifiedCount) {
		throw new Error("Updation Problem");
	}
	const token = tokenGeneration({ email: originalUser.email, _id: originalUser._id });
	const deletedOTP = await getDb().collection("otp").deleteOne({ email });
	if (!deletedOTP.deletedCount || !deletedOTP.acknowledged) {
		throw Error("Deletion Failed!!");
	}
	return { statusCode: 201, message: "Registration Successful", token };
};

exports.resendOtpHandler = async (body) => {
	const { email } = body;
	const otpObj = await getDb().collection("otp").findOne({ email });
	const otp = otpGenerator();
	sendVerificationMail(email, otp, "Sagar Mishra");
	if (!otpObj) {
		getDb()
			.collection("otp")
			.insertOne({ email: email, otp: otp, createdAt: Date.now(), expireAt: Date.now() + 120000 });
		return {
			statusCode: 201,
			message: "OTP resend successfully",
		};
	}
	getDb()
		.collection("otp")
		.updateOne({ email: email }, { $set: { otp: otp, createdAt: Date.now(), expireAt: Date.now() + 120000 } });
	return {
		statusCode: 201,
		message: "OTP resend successfully",
	};
};
