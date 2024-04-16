const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookie_parser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const server_config = require("./configs/server.config");
const db_config = require("./configs/db.config");

const user_model = require("./models/user.model");
const resource_model = require("./models/resources.model");
const pending_resource_model = require("./models/pending_resource.model");
const approved_contributions_model = require("./models/approved_contributions");
const rejected_contributions_model = require("./models/rejected_contribution.model");
const auth_middleware = require("./middlewares/auth.middleware");

const app = express();

app.use(cookie_parser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));
app.use(express.static("images"));

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
app.set("views", path.resolve("./views"));

app.get("/", auth_middleware.findToken, async (req, res) => {
  if (req.user) {
    if (req.user.userType == "CUSTOMER") {
      return res.render("homepage_signed", {
        user: req.user,
      });
    } else if (req.user.userType == "ADMIN") {
      try {
        const pending_resources = await pending_resource_model.find();
        return res.render("homepage_admin", {
          user: req.user,
          pending_resources: pending_resources,
        });
      } catch (error) {
        console.log(error);
        return res.status(501).send({
          error: "Error while searching pending contributions in database",
        });
      }
    }
  }
  return res.render("homepage");
});

app.get("/resources", auth_middleware.findToken, async (req, res) => {
  try {
    const subjects = await resource_model.aggregate([
      {
        $group: {
          _id: "$subject_name",
          subject_codes: { $addToSet: "$subject_code" },
        },
      },
    ]);
    let user = undefined;
    if (req.user) {
      user = req.user;
    }
    return res.render("resources", {
      subjects: subjects,
      user: user,
    });
  } catch (error) {
    console.log("Error while searching for resources in database", error);
    return res.status(501).send({
      error: "Error while searching for resources in database",
    });
  }
});

app.get("/resources/subject/:subject_name", auth_middleware.findToken, async (req, res) => {
  try {
    const subject_name = req.params.subject_name;
    const subject_files = await resource_model.find({ subject_name: subject_name });
    let user = undefined;
    if (req.user) {
      user = req.user;
    }
    return res.render("subject", {
      subject_files: subject_files,
      user : user
    });
  } catch (error) {
    console.log("Error while searching for subject files in database", error);
    return res.status(501).send({
      error: "Error while searching for subject files in database",
    });
  }
});

app.get("/resources/subject/:subject_name/:file_id", async (req, res) => {
  const file_id = req.params.file_id;
  try {
    const subject_file = await resource_model.findOne({ _id: file_id });
    return res.render("pdf", {
      _id: subject_file._id,
      subject_code: subject_file.subject_code,
      subject_name: subject_file.subject_name,
      file_name: subject_file.file_name,
      description: subject_file.description,
    });
  } catch (error) {
    console.log("Error while searching for file in database", error);
    return res.status(501).send({
      error: "Error while searching for file in database",
    });
  }
});

app.get("/downloadfile/:_id", async (req, res) => {
  const file_id = req.params._id;
  try {
    const resource = await resource_model.findOne({ _id: file_id });
    res.setHeader("Content-Disposition", `attachment; filename="${resource.file_name}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.send(resource.filebuffer);
  } catch (error) {
    console.log("Error while searching for file in database", error);
    return res.status(501).send({
      error: "Error while searching for file in database",
    });
  }
});

app.get("/fetchfile/:_id", async (req, res) => {
  const file_id = req.params._id;
  try {
    const resource = await resource_model.findOne({ _id: file_id });
    res.setHeader("Content-Type", "application/pdf");
    return res.send(resource.filebuffer);
  } catch (error) {
    console.log("Error while searching for file in database", error);
    return res.status(501).send({
      error: "Error while searching for file in database",
    });
  }
});

app.get("/download_pendingfile/:_id", auth_middleware.verifyToken, async (req, res) => {
  const file_id = req.params._id;
  try {
    const resource = await pending_resource_model.findOne({ _id: file_id });
    res.setHeader("Content-Disposition", `attachment; filename="${resource.file_name}.pdf"`);
    res.setHeader("Content-Type", "application/pdf");
    return res.send(resource.filebuffer);
  } catch (error) {
    console.log("Error while searching for pending file in database", error);
    return res.status(501).send({
      error: "Error while searching for pending file in database",
    });
  }
});

app.get("/fetch_pendingfile/:id", [auth_middleware.verifyToken, auth_middleware.isAdmin], async (req, res) => {
  const file_id = req.params.id;
  try {
    const resource = await pending_resource_model.findOne({ _id: file_id });
    res.setHeader("Content-Type", "application/pdf");
    return res.send(resource.filebuffer);
  } catch (error) {
    console.log("Error while searching for pending file in database", error);
    return res.status(501).send({
      error: "Error while searching for pending file in database",
    });
  }
});

// app.get("/addContribution/:id", [auth_middleware.verifyToken, auth_middleware.isAdmin], async (req, res) => {
//   try {
//     const pending_resource = await pending_resource_model.findOne({ _id: req.params.id });
//     return res.render("addContribution", {
//       pending_resource: pending_resource,
//     });
//   } catch (error) {
//     console.log("Error while loading contribution data", error);
//     return res.status(501).send({
//       error: "Error while loading contribution data",
//     });
//   }
// });

app.get("/rejectContribution/:id", [auth_middleware.verifyToken, auth_middleware.isAdmin], async (req, res) => {
  try {
    const pending_resource = await pending_resource_model.findOne({ _id: req.params.id });
    return res.render("rejectContribution", {
      pending_resource: pending_resource,
    });
  } catch (error) {
    console.log("Error while loading contribution data", error);
    return res.status(501).send({
      error: "Error while loading contribution data",
    });
  }
});

app.get("/login", async (req, res) => {
  return res.render("login");
});

app.get("/addResources", auth_middleware.verifyToken, async (req, res) => {
  const user = req.user;
  return res.render("addResources", {
    user: user,
  });
});

app.get("/profile", [auth_middleware.verifyToken], async (req, res) => {
  const user = req.user;
  try {
    const pending_contributions = await pending_resource_model.find({ contributerId: user._id });
    const approved_contributions_ids = await approved_contributions_model.find({ contributerId: user._id });
    const approved_contributions = [];
    const promises = approved_contributions_ids.map(async (approved_contribution) => {
      const approved_resource = await resource_model.findOne({ _id: approved_contribution.contributionId });
      return approved_resource;
    });

    const results = await Promise.all(promises);

    approved_contributions.push(...results);

    const rejected_contributions = await rejected_contributions_model.find({ contributerId: user._id });
    return res.render("profile", {
      user: req.user,
      pending_contributions: pending_contributions,
      approved_contributions: approved_contributions,
      rejected_contributions: rejected_contributions,
    });
  } catch (error) {
    console.log("Error while fetching contributions from database", error);
    return res.status(501).send({
      error: "Error while fetching contributions from database",
    });
  }
});

require("./routes/resources.route")(app);
require("./routes/auth.route")(app);
app.listen(server_config.PORT, () => {
  console.log("Server listening at :", server_config.PORT);
});
