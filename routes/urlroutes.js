const express = require("express");
const { addURL, getLink } = require("../controllers/urlControllers");
const { checkUserAuth } = require("../auth-middleware");

const router = express.Router();

router.use("/shorten", checkUserAuth);

router.route("/:id").get(getLink);
router.route("/shorten").post(addURL);

module.exports = {
	router,
};
