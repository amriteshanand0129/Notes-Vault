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

        // Registering the user in the database
        const user_created = await user_model.create(userObj)

        // Creating a copy of user details as a response without user password for security
        const res_obj = {
            name : user_created.name,
            userId : user_created.userId,
        }

        res.status(201).send(res_obj)
    }catch(err) {
        console.log("Error while registering the user", err)
        res.status(500).send({
            message : "Some error happened while registering the user"
        })
    }
}
const signin = async (req, res) => {
    /**
     * Logic to signin a user
     * 1. Check if the user if is present in the system
     * 2. Check if password is correct
     * 3. Using JWT create the access token with a given Time to live and return
     */

    const user = await user_model.findOne({userId : req.body.userId})
    
    if(user == null) {
        return res.status(400).send({
            message : "User id is not a valid user"
        })
    }

    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password) 

    if(!isPasswordValid) {
        return res.status(401).send({
            message : "Wrong password passed"
        })
    }

    /**
     * sign method will return the access token after accepting
     * 1. payload
     * 2. secret (to avoid possibility of duplicacy)
     * 3. TTL (in seconds)
     */
    const token = jwt.sign({id : user.userId}, auth_config.secret, {expiresIn : 120})

    res.status(200).send({
        name : user.name,
        userId : user.userId,
        userType : user.userType,
        accessToken : token
    })
}
module.exports = {
    signup : signup,
    signin : signin
}