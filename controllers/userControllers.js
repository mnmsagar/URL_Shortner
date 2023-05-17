require("dotenv").config();
const jwt = require("jsonwebtoken");
const { addUserHelper, matchPass, exisUser, tokenGeneration } = require("../services/user.dataHelper");



exports.addUser = async (req, res) => {
    const { email } = req.body;
    const existingUser = exisUser(email);
    if (!existingUser) {
        res.status(404).json({
            message: "User already Exists"
        })
        return;
    }
    const obj = await addUserHelper(req.body);
    const token = tokenGeneration(obj);
    console.log(token);
    res.status(201).json({
        status: "success",
        hint: "successfully registered",
        token: token
    })
}

exports.userlogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await exisUser(email);
        console.log(existingUser);
        if (!existingUser) {
            return res.status(404).json({
                message: "User not found!"
            })
        }
        const matchPassard = await matchPass(password);
        if (!matchPassard) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
        console.log(existingUser);
        const token = tokenGeneration(existingUser);
        res.status(201).json({ user: existingUser, token: token });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "something went wrong"
        })
    }
}
