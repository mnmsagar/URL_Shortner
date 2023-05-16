const express = require("express");
const { port, app } = require("./app");
const { connectToDb } = require("./connection");


connectToDb((err) => {
	if (!err) {
		app.listen(port, () => {
			console.log(`Server is running on port number - ${port}`);
		})
	}
})




