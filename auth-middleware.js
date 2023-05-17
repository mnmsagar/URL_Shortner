require("dotenv").config();
const jwt = require('jsonwebtoken');
const { getDb, connectToDb } = require('./connection');
const {auth} = require("./services/auth.dataHelper");



exports.checkUserAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith('Bearer ')) {
        try{
            const obj = auth(authorization);
            req.user== await getDb().collection('urlshortner').findOne({userID : obj._id});
            next();
        }catch(error){
            console.log(error);
            res.json({
                mesaage: "Unauthorised User"
            })
        }
    }
    else {
        res.json({
            status: "Failed",
            hint: "Token not sent, Unauthorised User"
        })
    }
}