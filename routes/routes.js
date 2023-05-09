const express = require("express");
const { addURL, getLink, getAll } = require("../controllers/urlControllers");

const router = express.Router();

router.route("/:id").get(getLink);
router.route("/shorten").post(addURL);
router.route("/").get(getAll);

module.exports = {
	router,
};

// /system/:id
// /user/shorten
