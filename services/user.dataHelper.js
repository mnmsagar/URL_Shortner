require("dotenv").config();
const { getDb } = require('../connection');
const jwt = require('jsonwebtoken');
const { hash, compare } = require('bcrypt');

exports.addUserHelper = async (body) => {
    const { email, password, name } = body
    const hashedPassword = await hash(password, 10);
    const user = {
        email: email,
        name: name,
        password: hashedPassword
    }
    const obj = user;
    const newObj = { ...obj };
    await getDb().collection('users').insertOne(obj);
    return obj;
    // Generate JWT Token
}

exports.exisUser = async (email) => {
    const obj = await getDb().collection('users').findOne({ email: email });
    console.log(obj);
    return obj;
}

exports.matchPass = async (password) => {
    const obj = await compare(password, existingUser.password);
    return obj;
}

exports.tokenGeneration =  (obj) => {
    const token = jwt.sign({ email: obj.email, userID: obj._id }, process.env.SECRET_KEY);
    return token;
}