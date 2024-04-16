const auth_Controller = require("../controllers/auth.controller")
const auth_Middleware = require("../middlewares/auth.middleware")
const multer = require("multer")
const upload = multer()

module.exports = (app) => {
    app.post("/signup_user", [upload.none(), auth_Middleware.verifySignUpbody], auth_Controller.signup)
    app.post("/login_user", [upload.none(), auth_Middleware.verifySignInBody], auth_Controller.signin)
}