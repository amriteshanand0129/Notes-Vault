const multer = require("multer")
const express = require("express")
const addResources_Controller = require("../controllers/addResource.controller")
const addResources_Middleware = require("../middlewares/addResource.middleware")
const auth_middleware = require("../middlewares/auth.middleware")

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        return cb(null, "./uploads")
    },
    filename : function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage : storage})

module.exports = (app) => {
    app.post("/upload", [upload.single("fileInput"), auth_middleware.verifyToken, addResources_Middleware.verifyUploadFile], addResources_Controller.addResource)
    app.post("/addContribution", [upload.none(), auth_middleware.verifyToken, auth_middleware.isAdmin, addResources_Middleware.verifyContribution], addResources_Controller.addContribution)
    app.post("/rejectContribution", [upload.none(), auth_middleware.verifyToken, auth_middleware.isAdmin], addResources_Controller.rejectContribution)
}