const { MongoClient } = require("mongodb");

const databaseName = "url";
const url = "mongodb://0.0.0.0:27017/";
const client = new MongoClient(url);

async function dbConnect (){
    const result = await client.connect();
    db = result.db(databaseName);
    return db.collection('urlshortner');
}

module.exports = dbConnect;

