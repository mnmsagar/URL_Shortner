const express = require("express");
const {addUser, userlogin, getAllUsers} = require("../controllers/userControllers");

const router = express.Router();

router.route("/reg").post(addUser);
router.route("/login").post(userlogin);



module.exports = {
	router
};
