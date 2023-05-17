require("dotenv").config();
const { getDb } = require("../connection");
const jwt = require("jsonwebtoken");
const { addUserHelper } = require("../services/user.dataHelper");
const {hash} = require('bcrypt');



exports.addUser = async (req, res) => {
    const{email, password, name} = req.body;
    const existingUser = await getDb().collection('users').findOne({email : email});
    if(existingUser){
        res.status(404).json({
            message : "User already Exists"
        })
        return;
    }
    const hashedPassword = await hash(password, 10);
    const user = {
        email : email,
        name : name,
        password : hashedPassword
    }
    const token = await addUserHelper(user);
    res.status(201).json({
        status: "success",
        hint: "successfully registered",
        token: token
    })
}

exports.userlogin = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    if (email && password) {
        const user = await getDb().collection('users').findOne({ email: req.body.email });
        if (user != null) {
            if (user.email === req.body.email && user.password === req.body.password) {
                const token = jwt.sign({ userID : user._id, email : user.email }, process.env.SECRET_KEY, { expiresIn: '5d' });
                res.json({
                    status: "success",
                    hint: "logged in successfully",
                    token: token
                })
            } else {
                res.json({
                    status: "failed",
                    hint: "Either email or password is not correct"
                })
            }
        } else {
            res.json({
                status: "Failed",
                hint: "You are not registered user"
            })
        }
    }
    else {
        res.json({
            status: "failed",
            hint: "enter email and password"
        })
    }
}
