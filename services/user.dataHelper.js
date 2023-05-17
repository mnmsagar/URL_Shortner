require("dotenv").config();
const { getDb } = require('../connection');
const jwt = require('jsonwebtoken');

exports.addUserHelper = async (body) => {
    const obj = body;
    const newObj = { ...obj };
    await getDb().collection('users').insertOne(obj);
    // Generate JWT Token
    const token = jwt.sign({ userID : obj._id, email : obj.email }, process.env.SECRET_KEY , { expiresIn: '5d' });
    return token;
}