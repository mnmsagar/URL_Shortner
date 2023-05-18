const { MongoClient, Timestamp } = require('mongodb');

let dbConnection;
module.exports = {
    connectToDb : async (dbUrl)=>{
       const client =  await MongoClient.connect(dbUrl);
       console.log("Connected to Database");
       dbConnection = client.db('url');
    },
    getDb : ()=> dbConnection
}