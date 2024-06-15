const auth_controller = require("../controllers/auth.controller");
const auth_middleware = require("../middlewares/auth.middleware");
const multer = require("multer");
const upload = multer();

module.exports = (app) => {
  app.post("/signup_user", [upload.none(), auth_middleware.verifySignUpbody], auth_controller.signup);
  app.post("/login_user", [upload.none(), auth_middleware.verifySignInBody], auth_controller.signin);
};
