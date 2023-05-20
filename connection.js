const { MongoClient, Timestamp } = require('mongodb');

let dbConnection;
let client;
module.exports = {
    connectToDb : async (dbUrl)=>{
       client =  await MongoClient.connect(dbUrl);
       console.log("Connected to Database");
       dbConnection = client.db('url');
    },
    clientDB : ()=>{return client},  
    getDb : ()=> {return dbConnection}
}