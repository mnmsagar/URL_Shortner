const express = require("express");
const {
	userlogin,
	signUp,
	verifyMail,
	resendOtp,
	forgetPassword,
	confmForgetPass,
	updatePassword,
} = require("../controllers/userControllers");
const { checkUserAuth } = require("../auth-middleware");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(userlogin);
router.route("/verify-email").post(verifyMail);
router.route("/resendotp").post(resendOtp);
router.route("/forget-password").post(forgetPassword);
router.route("/confirm-forget-password").post(confmForgetPass);
router.route("/passwordUpdate").post(checkUserAuth, updatePassword);

module.exports = {
	router,
};
