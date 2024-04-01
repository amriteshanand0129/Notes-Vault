const express = require("express")
const mongoose = require("mongoose")
const path = require("path")

const server_config = require("./configs/server.config")
const db_config = require("./configs/db.config")

const user_model = require("./models/user.model")
const resource_model = require("./models/resources.model")

const app = express()

app.use(express.json())

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
    return res.render("index")
})

app.get("/resources", async (req, res) => {
    return res.render("resources", {
        subjects : await resource_model.distinct('subject_name')
    })
})

require("./routes/addResources.route")(app)

app.listen(server_config.PORT, () => {
    console.log("Server listening at :", server_config.PORT)
})