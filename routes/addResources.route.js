const multer = require("multer")
const express = require("express")
const addResources_Controller = require("../controllers/addResource.controller")
const addResources_Middleware = require("../middlewares/addResource.middleware")

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
    app.use(express.urlencoded({extended: false}))
    app.post("/upload", [upload.single("fileInput"), addResources_Middleware.verifyUploadFile], addResources_Controller)
}