const { validate } = require('email-validator');
const passwordValidator = require('password-validator');
const crypto = require('crypto');

exports.isValidString = (str) => {
    if (str.trim().length === 0) {
        return false;
    }
    if (/[\d~`!@#$%^&*()_+=[\]{};':"\\|,.<>/?]+/.test(str)) {
        return false;
    }
    return true;
}

const schema = new passwordValidator();
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces

exports.isValidPassword = (password) => {
    return schema.validate(password);
}

exports.hashPassword = (password) => {
    const hmac = crypto.createHmac('sha512', process.env.HASH_KEY);
    hmac.update(password);
    const passwordHash = hmac.digest('hex');
    return passwordHash;
}

exports.isValidEmail = (email) => {
    return validate(email);
}