const express = require("express");
const {addUser, userlogin, forgotPassword, resetPassword, emailVerification} = require("../controllers/userControllers");

const router = express.Router();

router.route("/reg").post(addUser);
router.route("/login").post(userlogin);
// router.route("/forgotPassword").post(forgotPassword);
// router.route("/resetPassword").post(resetPassword);
router.route("/verify-email").post(emailVerification);


module.exports = {
	router
};
