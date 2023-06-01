const { getDb } = require("../connection");
const { isValidEmail, badRequest, createdResp } = require("../utils/utils");

const disableLoginHelper = async (body) => {
	const { email } = body;
	if (!isValidEmail(email)) {
		return badRequest("Invalid email type!!");
	}
	const user = await getDb().collection("users").findOne({ email: email, isAdmin: false, isLoginEnabled: true });
	if (!user) {
		return badRequest("Either user not registered or No enabled login users found !!");
	}
	const updatedObj = await getDb()
		.collection("users")
		.updateOne({ email }, { $set: { isLoginEnabled: false } });
	if (!updatedObj.modifiedCount || !updatedObj.matchedCount) {
		throw new Error("Error in updation in disableLoginHelper");
	}
	return createdResp("user successfully disabled !!");
};

const deleteUserHelper = async (body) => {
	const { email } = body;
	if (!isValidEmail(email)) {
		return badRequest("Invalid email type!!");
	}
	const user = await getDb().collection("users").findOne({ email: email, isAdmin: false });
	if (!user) {
		return badRequest("user not exist!!");
	}
	const deletedUser = await getDb().collection("users").deleteOne({ email });
	console.log(deletedUser);
	if (!deletedUser.deletedCount || !deletedUser.acknowledged) {
		throw new Error("Error in deletion of User in deleteUserHelper");
	}
	const deletedUrls = await getDb().collection("urlshortner").deleteMany({ email });
	if (!deletedUrls.deletedCount || !deletedUrls.acknowledged) {
		throw new Error("Error in deletion of Urls in deleteUserHelper");
	}
	return createdResp("user successfully deleted !!");
};

const enableLoginHelper = async (body) => {
	const { email } = body;
	if (!isValidEmail(email)) {
		return badRequest("Invalid email type!!");
	}
	const user = await getDb().collection("users").findOne({ email: email, isAdmin: false, isLoginEnabled: false });
	if (!user) {
		return badRequest("Either user not registered or No disabled login users found !!");
	}
	const updatedUser = await getDb()
		.collection("users")
		.updateOne({ email: email }, { $set: { isLoginEnabled: true } });
	if (!updatedUser.modifiedCount || !updatedUser.matchedCount) {
		throw new Error("Error in user updation in enableLoginHelper");
	}
	createdResp("User login enabled successfully!!");
};

module.exports = {
	disableLoginHelper,
	deleteUserHelper,
	enableLoginHelper,
};
