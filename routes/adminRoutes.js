const express = require("express");
const { disableLogin, deleteUser, enableLogin } = require("../controllers/adminControllers");
const { checkUserAuth } = require("../auth-middleware");
const { isAdmin } = require("../isAdmin.middleware");
const { isValid } = require("../isValid.middleware");

const router = express.Router();

router.route("/disable-login").post(checkUserAuth, isAdmin, isValid, disableLogin);
router.route("/delete-user").post(checkUserAuth, isAdmin, isValid, deleteUser);
router.route("/enable-login").post(checkUserAuth, isAdmin, isValid, enableLogin);

module.exports = {
	router,
};
