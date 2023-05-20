require("dotenv").config();
const { getDb } = require('../connection');
const jwt = require('jsonwebtoken');
const { validate } = require('email-validator');
const passwordValidator = require('password-validator');
const crypto = require('crypto');

const schema = new passwordValidator();
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces


const isValidString = (str) => {
    if (str.trim().length === 0) {
        return false;
    }
    if (/[\d~`!@#$%^&*()_+=[\]{};':"\\|,.<>/?]+/.test(str)) {
        return false;
    }
    return true;
}

exports.addUserHelper = async (body) => {
    const { email, password, name } = body
    const hashedPassword = hashPassword(password);
    const user = {
        email: email,
        name: name,
        password: hashedPassword
    }
    const obj = user;
    const newObj = { ...obj };
    await getDb().collection('users').insertOne(obj);
    return obj;
}

exports.existUser = async (email) => {
    const obj = await getDb().collection('users').findOne({ email: email });
    return obj;
}

// exports.matchPass = async (password, existingUser) => {
//     const obj = await compare(password, existingUser.password);
//     return obj;
// }

exports.tokenGeneration = (obj) => {
    const token = jwt.sign({ email: obj.email, userID: obj._id }, process.env.SECRET_KEY);
    return token;
}

exports.checkBody = (body) => {
    const { name, email, password } = body;
    if (isValidString(name)) {
        if (validate(email)) {
            if (schema.validate(password)) {
                return true;
            } else {
                return {
                    message: "Invalid password, Password should contains : min length of 8 characters, max of 100 characters, Must have uppercase letters, must have lowercase letters, must have atleast 2 digits, should not have any spaces",
                    statusCode: 404
                }
            }
        } else {
            return {
                message: "Invalid email, Please type correct email",
                statusCode: 404
            }
        }
    } else {
        return {
            message: "Invalid name, Please use characters only",
            statusCode: 404
        }
    }
}

exports.existingUserAndPasswordCheck = async (email, password) => {
    const obj = await getDb().collection('users').findOne({ email: email });
    if (!obj) {
        return {
            message: "Incorrect Credentials"
        }
    } else {
        if (verifyPassword(password, obj.password)) {
            return {
                status: 'Success',
                user: obj
            };
        } else {
            return { message: "Incorrect Credentials" }
        }
    }
}

const hashPassword = (password) => {
    const hmac = crypto.createHmac('sha512', process.env.HASH_KEY);
    hmac.update(password);
    const passwordHash = hmac.digest('hex');
    return passwordHash;
}

const verifyPassword = (password, storedHash) => {
    const hmac = crypto.createHmac('sha512', process.env.HASH_KEY);
    hmac.update(password);
    const passwordHash = hmac.digest('hex');
    return passwordHash === storedHash;
}

exports.isEmailValid = (email) => {
    return validate(email);
}
