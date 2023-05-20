require("dotenv").config();
const { addUserHelper, existUser, tokenGeneration, checkBody, existingUserAndPasswordCheck, isEmailValid } = require("../services/user.dataHelper");

exports.addUser = async (req, res) => {
    const { email, password, name } = req.body;
    const response = checkBody(req.body);
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
        if (isEmailValid(email)) {
            const obj = await existingUserAndPasswordCheck(email, password);
            if (obj.status) {
                const token = tokenGeneration(obj.user);
                res.status(200).json({ message: "Logged In Successfully", token: token });
            } else {
                res.status(404).json(obj);
            }
        } else {
            res.status(404).json({
                status: "failed",
                message: "Invalid email type"
            })
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "something went wrong"
        })
    }
}
