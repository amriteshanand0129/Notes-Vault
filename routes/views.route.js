// Database model modules
const resource_model = require("../models/resources.model");
const pending_resource_model = require("../models/pending_resource.model");
const approved_contributions_model = require("../models/approved_contributions");
const rejected_contributions_model = require("../models/rejected_contribution.model");

// Middleware modules
const auth_middleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
  app.get("/", auth_middleware.findToken, async (req, res) => {
    if (req.user && req.user.userType == "ADMIN") {
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
    } else {
      let user = undefined;
      if (req.user) {
        user = req.user;
      }
      return res.render("homepage", {
        user: user,
      });
    }
  });

  app.get("/subject_catalog", auth_middleware.findToken, async (req, res) => {
    try {
      const subjects = await resource_model
        .aggregate([
          {
            $group: {
              _id: "$subject_name",
              subject_codes: { $addToSet: "$subject_code" },
            },
          },
        ])
        .sort({ subject_codes: 1 });
      let user = undefined;
      if (req.user) {
        user = req.user;
      }
      return res.render("subject_catalog", {
        subjects: subjects,
        user: user,
        searchvalue: "",
      });
    } catch (error) {
      console.log("Error while searching for resources in database", error);
      return res.status(501).send({
        error: "Error while searching for resources in database",
      });
    }
  });

  app.get("/subject_catalog/subject/:subject_name", auth_middleware.findToken, async (req, res) => {
    try {
      const subject_name = req.params.subject_name;
      const subject_files = await resource_model.find({ subject_name: subject_name }).select("file_name description filesize contributedBy").sort({ file_name: 1 });
      let user = undefined;
      if (req.user) {
        user = req.user;
      }
      return res.render("subject_files", {
        subject_name: subject_name,
        subject_files: subject_files,
        user: user,
        searchvalue: "",
      });
    } catch (error) {
      console.log("Error while searching for subject files in database", error);
      return res.status(501).send({
        error: "Error while searching for subject files in database",
      });
    }
  });

  app.get("/subject_catalog/subject/:subject_name/:file_id", auth_middleware.findToken, async (req, res) => {
    const file_id = req.params.file_id;
    let user = undefined;
    if (req.user) {
      user = req.user;
    }
    try {
      const subject_file = await resource_model.findOne({ _id: file_id });
      return res.render("pdf_viewer", {
        user: user,
        _id: subject_file._id,
        subject_code: subject_file.subject_code,
        subject_name: subject_file.subject_name,
        file_name: subject_file.file_name,
        description: subject_file.description,
        filesize: subject_file.filesize,
      });
    } catch (error) {
      console.log("Error while searching for file in database", error);
      return res.status(501).send({
        error: "Error while searching for file in database",
      });
    }
  });

  app.get("/login", async (req, res) => {
    return res.render("login", {
      server_message: "",
    });
  });

  app.get("/uploadResource", auth_middleware.verifyToken, async (req, res) => {
    const user = req.user;
    res.render("uploadResource", {
      user: req.user,
    });
  });

  app.get("/profile", [auth_middleware.verifyToken], async (req, res) => {
    const user = req.user;
    try {
      const pending_contributions = await pending_resource_model.find({ contributerId: user._id });
      const approved_contributions_ids = await approved_contributions_model.find({ contributerId: user._id }).sort({ createdAt: 1 });
      const approved_contributions = [];
      const promises = approved_contributions_ids.map(async (approved_contribution) => {
        if (approved_contribution.status == true) {
          const approved_resource = await resource_model.findOne({ _id: approved_contribution.contributionId });
          return approved_resource;
        } else {
          return approved_contribution;
        }
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
};