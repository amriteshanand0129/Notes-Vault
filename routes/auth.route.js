const auth_Controller = require("../controllers/auth.controller")
const auth_Middleware = require("../middlewares/auth.middleware")
module.exports = (app) => {
    app.post("/signup_user", auth_Middleware.verifySignUpbody, auth_Controller.signup)
    app.post("/login_user", auth_Middleware.verifySignInBody, auth_Controller.signin)
}