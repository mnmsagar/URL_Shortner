require("dotenv").config();
const { verify } = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { findUser } = require("./user.dataHelper");

exports.auth = async (authorization) => {
	const token = authorization.split(" ")[1];
	const { userID } = verify(token, process.env.SECRET_KEY);
	const obj = await findUser([{ _id: new ObjectId(userID) }]);
	return obj;
};
