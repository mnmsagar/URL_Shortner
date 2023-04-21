const express = require("express");
const { addURL, getLink } = require("../controllers/urlControllers");

const router = express.Router();

router.route("/:id").get(getLink);
router.route("/shorten").post(addURL);

module.exports = {
	router,
};

// /system/:id
// /user/shorten
