require("dotenv").config();
const { addUserHelper, matchPass, existUser, tokenGeneration, checkBody } = require("../services/user.dataHelper");

exports.addUser = async (req, res) => {
    const { email, password, name } = req.body;
    const response = await checkBody(req.body);
    if (response === true) {
        const existingUser = await existUser(email);
        if (existingUser) {
            res.status(404).json({
                message: "User already Exists"
            })
            return;
        }
        const obj = await addUserHelper(req.body);
        const token = tokenGeneration(obj);
        res.status(201).json({
            status: "success",
            hint: "successfully registered",
            token: token
        })
    } else {
        res.status(response.statusCode).json(response.message);
    }

}

exports.userlogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await existUser(email);
        if (!existingUser) {
            return res.status(404).json({
                message: "User not found!"
            })
        }
        const matchPassword = await matchPass(password, existingUser);
        if (!matchPassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }
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
