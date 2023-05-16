require('dotenv').config();
const express = require("express");
const { port, app } = require("./app");
const { connectToDb } = require("./connection");

connectToDb(process.env.URI).then(() => {
	try {
		app.listen(port, () => {
			console.log(`Server is running on - ${port}`);
		})
	} catch (error) {
		console.log("Can't connect to the server!");
	}
}).catch((error) => {
	console.log("Invalid Database Connection");
})




