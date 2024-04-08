const user_model = require("../models/user.model")
const jwt = require("jsonwebtoken")
const auth_config = require("../configs/auth.config")

const verifySignUpBody = async (req, res, next) => {
    try {
        if(!req.body.name) {
            return res.status(400).send({
                message : "Failed! Name was not provided"
            })
        }
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
        const user = await user_model.findOne({userId : req.body.userId})
        if(user) {
            return res.status(400).send({
                message :   "Failed! UserId was already present"
            })
        }

        next()
    }catch(err) {
        
        console.log("Error while validating request object", err)
        res.status(501).send({
            error : "Error while validating request body"
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

/**
 * Checks if token is present, to decide which homepage to render
 * Adds user data to request body if token found and is valid
 */
const findToken = (req, res, next) => {
    if(req.cookies?.token) {
        const token = req.cookies.token
        jwt.verify(token, auth_config.secret, async (err, decoded) => {
            if(err) {
                return next()
            }
            try {
                const user = await user_model.findOne({userId : decoded.id})
                if(!user) {
                    return res.status(401).send({
                        error : "Unauthorized, the user for this token does not exist"
                    })
                }  
                req.user = user
                next()
            }catch(error) {
                console.log("Error while searching user in database", error)
                res.status(501).send({
                    error : "Error while searching user in database"
                })
            }
        })
    }
    else {
        next()
    }
}

const verifyToken = (req, res, next) => {
    if(req.cookies?.token) {
        const token = req.cookies.token
        jwt.verify(token, auth_config.secret, async (err, decoded) => {
            if(err) {
                return res.redirect("/login")
            }
            try {
                const user = await user_model.findOne({userId : decoded.id})
                if(!user) {
                    return res.status(400).send({
                        message : "Unauthorized, the user for this token does not exist"
                    })
                }  
                req.user = user
                next()
            }catch(error) {
                console.log("Error while searching for user in database", error)
                return res.status(501).send({
                    error : "Error while searching for user in database"
                })
            }
        })
    }
    else {
        res.redirect("/login")
    }
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
    findToken : findToken,
    verifyToken : verifyToken,
    isAdmin : isAdmin
}