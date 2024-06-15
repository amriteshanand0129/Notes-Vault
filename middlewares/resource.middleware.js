// Resource upload request body verification for both User and Admin
const verifyUpload = (req, res, next) => {
  if (!req.body.subject_code || req.body.subject_code.length > 10) {
    return res.status(401).send({
      error: "Invalid Subject Code",
      redirectTo: "/uploadResource",
    });
  }
  if (!req.body.subject_name || req.body.subject_name.length > 50) {
    return res.status(401).send({
      error: "Invalid Subject Name",
      redirectTo: "/uploadResource",
    });
  }
  if (!req.body.file_name || req.body.file_name.length > 50) {
    return res.status(401).send({
      error: "Invalid File Name",
      redirectTo: "/uploadResource",
    });
  }
  if (!req.body.description || req.body.description.length > 100) {
    return res.status(401).send({
      error: "Invalid Description",
      redirectTo: "/uploadResource",
    });
  }
  if (!req.file) {
    return res.status(401).send({
      error: "File not selected",
      redirectTo: "/uploadResource",
    });
  } else next();
};

// Contribution Acceptance request body verification for Admin
const verifyContribution = (req, res, next) => {
  if (!req.body._id) {
    return res.status(401).send({
      error: "File Id not available",
      redirectTo: "/",
    });
  }
  if (!req.body.contributedBy) {
    return res.status(401).send({
      error: "Contributor name not available",
      redirectTo: "/",
    });
  }
  if (!req.body.subject_code || req.body.subject_code.length > 10) {
    return res.status(401).send({
      error: "Invalid Subject Code",
      redirectTo: "/",
    });
  }
  if (!req.body.subject_name || req.body.subject_name.length > 50) {
    return res.status(401).send({
      error: "Invalid Subject Name",
      redirectTo: "/",
    });
  }
  if (!req.body.file_name || req.body.file_name.length > 50) {
    return res.status(401).send({
      error: "Invalid Subject Name",
      redirectTo: "/",
    });
  }
  if (!req.body.description || req.body.description.length > 100) {
    return res.status(401).send({
      error: "Invalid Description",
      redirectTo: "/",
    });
  } else next();
};
module.exports = {
  verifyUpload: verifyUpload,
  verifyContribution: verifyContribution,
};
