module.exports = (app) => {
  app.get("/subject/:subject_name", (req, res) => {
    console.log(req.params.subject_name);
    res.render("")
  });
};
