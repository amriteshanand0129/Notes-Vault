const resource_model = require("../models/resources.model");
module.exports = (app) => {
    app.get("/searchcatalog", async (req, res) => {
        const searchvalue = req.query.searchvalue;
        try {
          const subjects = await resource_model.aggregate([
            {
              $group: {
                _id: "$subject_name",
                subject_codes: { $addToSet: "$subject_code" },
              },
            },
          ]);
          const filteredSubjects = subjects.filter((subject) => subject.subject_codes.includes(searchvalue));
          let user = undefined;
          if (req.user) {
            user = req.user;
          }
          return res.render("subject_catalog", {
            subjects: filteredSubjects,
            user: user,
            searchvalue: searchvalue,
          });
        } catch (error) {
          console.log(error);
          res.status(501).send({
            error: "Error accessing subjects",
          });
        }
      });

      app.get("/subject_catalog/subject/searchfiles/:subject_name", async (req, res) => {
        const searchvalue = req.query.searchvalue;
        const subject_name = req.params.subject_name;
        try {
          const subject_files = await resource_model.find({ subject_name: subject_name }).select("file_name description filesize contributedBy").sort({ file_name: 1 });
          let user = undefined;
          if (req.user) {
            user = req.user;
          }
          const filteredSubjectfiles = subject_files.filter((subjectfile) => subjectfile.file_name.includes(searchvalue));
          return res.render("subject_files", {
            subject_name: subject_name,
            subject_files: filteredSubjectfiles,
            user: user,
            searchvalue: searchvalue,
          });
        } catch (error) {
          console.log("Error while searching for subject files in database", error);
          return res.status(501).send({
            error: "Error while searching for subject files in database",
          });
        }
      });
}