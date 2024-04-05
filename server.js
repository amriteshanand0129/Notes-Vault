const express = require("express")
const mongoose = require("mongoose")
const path = require("path")

const server_config = require("./configs/server.config")
const db_config = require("./configs/db.config")

const user_model = require("./models/user.model")
const resource_model = require("./models/resources.model")

const app = express()

app.use(express.json())
app.use(express.static("public"))

mongoose.connect(db_config.DB_URL)
const db = mongoose.connection

db.on("error", () => {
    console.log("Error while connecting to database")
})
db.once("open", () => {
    console.log("Connected to database ", db_config.DB_URL)
    init()
})

async function init() {
    try {
        const admin = await user_model.findOne({userType : "ADMIN"})
        if(admin) 
            console.log("Admin Active")
        
        else {
            const new_admin = await user_model.create({
                name : "Amritesh Anand",
                userId : "amritesh",
                password : "amritesh",
                userType : "ADMIN"
            })
            console.log("New Admin Created")
        }
    } catch(err) {
        console.log("Error while searching ADMIN: ", err)
    }
}

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

app.get("/", (req, res) => {
    return res.render("homepage")
})
app.get("/resources", async (req, res) => {
    return res.render("resources", {
        subjects : await resource_model.distinct('subject_name')
    })
})
app.get("/subject/:subject_name", async (req, res) => {
    const subject_name = req.params.subject_name
    res.render("subject", {
        files : await resource_model.find({subject_name : subject_name})
    })
})
app.get("/subject/:subject_name/:file_id", async (req, res) => {
    const file_id = req.params.file_id
    const resource = await resource_model.findOne({_id : file_id})
    res.render("pdf", {
        _id : resource._id,
        subject_code : resource.subject_code,
        subject_name : resource.subject_name,
        file_name : resource.file_name,
        description : resource.description,  
    })
})
app.get("/fetchfile/:_id", async (req, res) => {
    const file_id = req.params._id
    const resource = await resource_model.findOne({_id : file_id})
    res.setHeader('Content-Type', 'application/pdf');
    res.send(resource.filebuffer);
})
app.get("/downloadfile/:_id", async (req, res) => {
    const file_id = req.params._id
    const resource = await resource_model.findOne({_id : file_id})
    res.setHeader('Content-Disposition', `attachment; filename="${resource.file_name}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(resource.filebuffer);

})
app.get("/signup", async (req, res) => {
    return res.render("signup")
})
app.get("/login", async (req, res) => {
    return res.render("login")
})
app.get("/addResources", async (req, res) => {
    return res.render("addResources")
})

require("./routes/resources.route")(app)
require("./routes/auth.route")(app)
require("./routes/subjects.route")(app)
app.listen(server_config.PORT, () => {
    console.log("Server listening at :", server_config.PORT)
})