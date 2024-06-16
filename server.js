// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookie_parser = require("cookie-parser");
const bcrypt = require("bcryptjs");

// Configuration modules
const server_config = require("./configs/server.config");
const db_config = require("./configs/db.config");

// Database model modules
const user_model = require("./models/user.model");

const app = express();

app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/js", express.static("public"));
app.use("/images", express.static("images"));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

// Database connnection initiation
mongoose.connect(db_config.DB_URL);
const db = mongoose.connection;

db.on("error", () => {
  console.log("Error while connecting to database");
});
db.once("open", () => {
  console.log("Connected to database ", db_config.DB_URL);
  init();
});

async function init() {
  try {
    const admin = await user_model.findOne({ userType: "ADMIN" });
    if (admin) console.log("Admin Active");
    else {
      const new_admin = await user_model.create({
        name: "Amritesh Anand",
        userId: "amritesh",
        password: bcrypt.hashSync("amritesh", 8),
        userType: "ADMIN",
      });
      console.log("New Admin Created");
    }
  } catch (err) {
    console.log("Error while searching ADMIN: ", err);
  }
}

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));

require("./routes/resources.route")(app);
require("./routes/auth.route")(app);
require("./routes/search.route")(app);
require("./routes/views.route")(app);
require("./routes/files.route")(app);

app.listen(server_config.PORT, () => {
  console.log("Server listening at :", server_config.PORT);
});