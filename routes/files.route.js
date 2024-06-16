// Database model modules
const resource_model = require("../models/resources.model");
const pending_resource_model = require("../models/pending_resource.model");

// Middleware modules
const auth_middleware = require("../middlewares/auth.middleware");

module.exports = (app) => {
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
};
