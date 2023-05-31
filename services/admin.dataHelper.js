const { getDb } = require("../connection");
const { isValidEmail, badRequest, createdResp } = require("../utils/utils");

const disableLoginHelper = async (body) => {
	const { email } = body;
	if (!isValidEmail(email)) {
		return badRequest("Invalid email type!!");
	}
	const user = await getDb().collection("users").findOne({ email });
	if (!user) {
		return badRequest("user not exist!!");
	}
	const updatedObj = await getDb()
		.collection("users")
		.updateOne({ email }, { $set: { isLoginEnabled: false } });
	if (!updatedObj) {
		throw new Error("Error in updation in disableLoginHelper");
	}
	return createdResp("user successfully disabled !!");
};

const deleteUserHelper = async (body) => {
	const { email } = body;
	if (!isValidEmail(email)) {
		return badRequest("Invalid email type!!");
	}
	const user = await getDb().collection("users").findOne({ email });
	if (!user) {
		return badRequest("user not exist!!");
	}
	const deletedUser = await getDb().collection("users").deleteOne({ email });
	if (!deletedUser) {
		throw new Error("Error in deletion of User in deleteUserHelper");
	}
	const deletedUrls = await getDb().collection("urlshortner").deleteMany({ email });
	if (!deletedUrls) {
		throw new Error("Error in deletion of Urls in deleteUserHelper");
	}
	return createdResp("user successfully deleted !!");
};

module.exports = {
	disableLoginHelper,
	deleteUserHelper,
};
