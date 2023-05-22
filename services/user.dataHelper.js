require("dotenv").config();
const { getDb } = require("../connection");
const jwt = require("jsonwebtoken");
const { isValidPassword, isValidString, isValidEmail, hashPassword } = require("../utils/utils");

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
	console.log(result);
	return result;
};
