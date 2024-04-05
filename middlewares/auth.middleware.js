/**
 * A middleware to check if the authorisation requests' body is proper and correct
 */

const user_model = require("../models/user.model")
const jwt = require("jsonwebtoken")
const auth_config = require("../configs/auth.config")

const verifySignUpBody = async (req, res, next) => {
    try {

        // Check for name
        if(!req.body.name) {
            return res.status(400).send({
                message : "Failed! Name was not provided"
            })
        }

        // Check for userID
        if(!req.body.userId) {
            return res.status(400).send({
                message : "Failed! UserId was not provided"
            })
        }

        if(!req.body.password) {
            return res.status(400).send({
                message : "Failed! UserId was not provided"
            })
        }

        // Check for user with same userId is already present
        const user = await user_model.findOne({userId : req.body.userId})
        if(user) {
            return res.status(400).send({
                message :   "Failed! UserId was already present"
            })
        }

        next()
    }catch(err) {
        
        console.log("Error while validating request object", err)
        res.status(500).send({
            message : "Error while validating request body"
        })
    }
}

const verifySignInBody = async (req, res, next) => {
    if(!req.body.userId) {
        return res.status(400).send({
            message : "User Id is not provided"
        })
    }
    if(!req.body.password) {
        return res.status(400).send({
            message : "User Password is not provided"
        })
    }
    next()
}

const verifyToken = (req, res, next) => {
    /**
     * 1. Check if the token is present in the header
     * 2. Check if the token is valid
     */

    const token = req.headers["access_token"]

    if(!token) {
        console.log(token)
        return res.status(403).send({
            message : "Unauthorised : No token found"
        })
    }

    jwt.verify(token, auth_config.secret, async (err, decoded) => {
        if(err) {
            return res.status(401).send({
                message : "Unauthorised"
            })
        }
        const user = await user_model.findOne({userId : decoded.id})
        if(!user) {
            return res.status(400).send({
                message : "Unauthorized, the user for this token does not exist"
            })
        }  

        // Set the user info in the req body for the next isAdmin check
        req.user = user
        next()
    })
}

const isAdmin = (req, res, next) => {
    const user = req.user
    if(user && user.userType == "ADMIN") {
        next()
    }
    else {
        return res.status(403).send({
            message : "Only ADMIN user are allowed to access this endpoint"
        })
    }
}
module.exports = {
    verifySignUpbody : verifySignUpBody,
    verifySignInBody : verifySignInBody,
    verifyToken : verifyToken,
    isAdmin : isAdmin
}