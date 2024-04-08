const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const auth_config = require("../configs/auth.config")
var user_model = require("../models/user.model")

const signup = async (req, res) => {
    const request_body = req.body
    const userObj = {
        name : request_body.name,
        userId : request_body.userId,
        userType : request_body.userType,
        password : bcrypt.hashSync(request_body.password, 8)
    }
    try {
        const user_created = await user_model.create(userObj)
        res.status(201).send({
            name : user_created.name,
            userId : user_created.userId
        })
    }catch(err) {
        console.log("Error while registering the user", err)
        res.status(501).send({
            error : "Some error happened while registering the user"
        })
    }
}
const signin = async (req, res) => {

    const user = await user_model.findOne({userId : req.body.userId})
    if(user == null) {
        return res.status(401).send({
            message : "Not a valid user"
        })
    }
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password) 

    if(!isPasswordValid) {
        return res.status(401).send({
            message : "Wrong password"
        })
    }

    const token = jwt.sign({id : user.userId}, auth_config.secret, {expiresIn : 3600})
    res.status(200).cookie("token", token)
    res.redirect("/")
}
module.exports = {
    signup : signup,
    signin : signin
}