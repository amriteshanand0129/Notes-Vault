const multer = require("multer");
const resource_controller = require("../controllers/resource.controller");
const resource_middleware = require("../middlewares/resource.middleware");
const auth_middleware = require("../middlewares/auth.middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

module.exports = (app) => {
  app.post("/upload", [upload.single("fileInput"), auth_middleware.verifyToken, resource_middleware.verifyUpload], resource_controller.uploadResource);
  app.post("/acceptContribution", [upload.none(), auth_middleware.verifyToken, auth_middleware.isAdmin, resource_middleware.verifyContribution], resource_controller.acceptContribution);
  app.post("/rejectContribution", [upload.none(), auth_middleware.verifyToken, auth_middleware.isAdmin], resource_controller.rejectContribution);
  app.delete("/deleteResource/:id", [auth_middleware.verifyToken, auth_middleware.isAdmin], resource_controller.deleteResource);
};
