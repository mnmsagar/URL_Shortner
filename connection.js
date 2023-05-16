const { MongoClient } = require('mongodb');

let dbConnection;
module.exports = {
    connectToDb : (cb)=>{
        const url = process.env.MONGO_URL;
        MongoClient.connect('mongodb://0.0.0.0:27017/url')
        .then((client)=>{
            dbConnection = client.db();
            
            return cb()
        })
        .catch(err => { 
            console.log(err);
            return cb(err)
        })
    },
    getDb : ()=> dbConnection
}
