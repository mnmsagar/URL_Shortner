const express = require("express");
const { userlogin, signUp, verifyMail, resendOtp } = require("../controllers/userControllers");

const router = express.Router();

router.route("/signup").post(signUp);
router.route("/login").post(userlogin);
router.route("/verify-email").post(verifyMail);
router.route("/resendotp").post(resendOtp);

module.exports = {
	router,
};
