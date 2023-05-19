require("dotenv").config();
const cors = require("cors");
const express = require("express");
const urlhandler = require("./routes/urlroutes");
const userhandler = require("./routes/userRoutes");
const { connectToDb } = require("./connection");

const port = process.env.PORT || 3000;
const hostname = "localhost";
const app = express();
app.use(cors());

app.use(express.json());

app.use("/users", userhandler.router);
app.use("/", urlhandler.router);
app.all("*", (req, res) => {
	res.status(404).json({
		status: "Failed",
		message: "Can't find the URL"
	});
});

connectToDb(process.env.URI).then(() => {
	try {
		app.listen(port, () => {
			console.log(`Server is started at port - ${port}`);
		})
	} catch (error) {
		console.log("Can't connect to the server!");
	}
}).catch((error) => {
	console.log("Invalid Database Connection");
})


module.exports = {
	app,
	hostname,
	port
};


