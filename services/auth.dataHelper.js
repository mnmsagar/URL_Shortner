require("dotenv").config();
const { verify } = require("jsonwebtoken");
const { getDb } = require("../connection");
const { ObjectId } = require("mongodb");

exports.auth = async (authorization) => {
	const token = authorization.split(" ")[1];
	const { userID } = verify(token, process.env.SECRET_KEY);
	const obj = await getDb()
		.collection("users")
		.findOne({ _id: new ObjectId(userID) });
	return obj;
};
