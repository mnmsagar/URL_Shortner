const express = require("express");
const {
	userlogin,
	signUp,
	verifyMail,
} = require("../controllers/userControllers");

const router = express.Router();

router.route("/signup").post(signUp);
// router.route("/reg").post(addUser);
router.route("/login").post(userlogin);
// router.route("/forgotPassword").post(forgotPassword);
// router.route("/resetPassword").post(resetPassword);
router.route("/verify-email").post(verifyMail);

module.exports = {
	router,
};
