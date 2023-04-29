require("dotenv").config();
const express = require("express");
const handler = require("./routes/routes");

const port = process.env.PORT || 3000;
const hostname = "localhost";
const app = express();

// fs.readFile(`${__dirname}/data.json`,(err,data)=>{

// })
app.use(express.json());

app.use("/", handler.router);
app.all("*",(req,res)=>{
	res.status(404).json({
		status :"Failed",
		message : "Can't find the URL"
	});
});


module.exports = {
	app,
	hostname,
	port,
};
