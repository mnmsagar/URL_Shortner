const { MongoClient } = require("mongodb");

let dbConnection;
let client;
module.exports = {
	connectToDb: async (dbUrl) => {
		client = await MongoClient.connect(dbUrl);
		console.log("Connected to Database");
		dbConnection = client.db("url");
		dbConnection.collection("users").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 120 });
		dbConnection.collection("otp").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 60 });
	},
	getClient: () => {
		return client;
	},
	getDb: () => {
		return dbConnection;
	},
};
