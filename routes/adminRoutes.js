const express = require("express");
const { disableLogin, deleteUser, enableLogin } = require("../controllers/adminControllers");
const { checkUserAuth } = require("../auth-middleware");
const { isAdmin } = require("../isAdmin.middleware");

const router = express.Router();

router.route("/disable-login").post(checkUserAuth, isAdmin, disableLogin);
router.route("/delete-user").post(checkUserAuth, isAdmin, deleteUser);
router.route("/enable-login").post(checkUserAuth, isAdmin, enableLogin);

module.exports = {
	router,
};
