require("dotenv").config();
const cors = require("cors");
const express = require("express");
const urlHandler = require("./routes/urlroutes");
const userHandler = require("./routes/userRoutes");
const adminHandler = require("./routes/adminRoutes");

const port = process.env.PORT || 3000;
const hostname = "localhost";
const app = express();
app.use(cors());

app.use(express.json());
app.use("/admin", adminHandler.router);
app.use("/users", userHandler.router);
app.use("/", urlHandler.router);
app.all("*", (req, res) => {
	res.status(404).json({
		status: "Failed",
		message: "Can't find the URL",
	});
});

module.exports = {
	app,
	hostname,
	port,
};
