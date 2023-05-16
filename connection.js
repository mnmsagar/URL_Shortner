const { MongoClient } = require('mongodb');

let dbConnection;
module.exports = {
    connectToDb : async (dbUrl)=>{
       const client =  await MongoClient.connect(dbUrl);
       dbConnection = client.db('url');
    },
    getDb : ()=> dbConnection
}
