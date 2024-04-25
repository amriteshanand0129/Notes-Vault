const user_model = require("../models/user.model");
const jwt = require("jsonwebtoken");
const auth_config = require("../configs/auth.config");

const verifySignUpBody = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(401).send({
        error: "Failed! Name was not provided",
        redirectTo: "/login",
      });
    }
    if (!req.body.userId) {
      return res.status(401).send({
        error: "Failed! UserId was not provided",
        redirectTo: "/login",
      });
    }
    if (!req.body.password) {
      return res.status(401).send({
        error: "Failed! Password was not provided",
        redirectTo: "/login",
      });
    }
    if (req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
        redirectTo: "/login",
      });
    }
    const user = await user_model.findOne({ userId: req.body.userId });
    if (user) {
      return res.status(401).send({
        error: "Failed! UserId was already present",
        redirectTo: "/login",
      });
    }
    next();
  } catch (err) {
    console.log("Error while validating request object", err);
    return res.status(501).send({
      error: "Error while validating request body",
      redirectTo: "/login",
    });
  }
};

const verifySignInBody = (req, res, next) => {
  try {
    if (!req.body.userId) {
      return res.status(401).send({
        error: "UserId is not provided",
        redirectTo: "/login",
      });
    }
    if (!req.body.password) {
      return res.status(401).send({
        error: "Password is not provided",
        redirectTo: "/login",
      });
    }
    next();
  } catch (err) {
    console.log("Error while valiating request body", err);
    return res.send(501).send({
      error: "Error while validating request body",
      redirectTo: "/login",
    });
  }
};

/**
 * Checks if token is present, to decide which homepage to render
 * Adds user data to request body if token found and is valid
 */
const findToken = (req, res, next) => {
  try {
    if (req.cookies?.token) {
      const token = req.cookies.token;
      jwt.verify(token, auth_config.secret, async (err, decoded) => {
        if (err) {
          return next();
        }
        try {
          const user = await user_model.findOne({ userId: decoded.id });
          if (!user) {
            return res.status(401).send({
              error: "Unauthorized, the user for this token does not exist DELETE BROWSER TOKEN AND RETRY",
              redirectTo: "/login",
            });
          }
          req.user = user;
          next();
        } catch (error) {
          console.log("Error while searching user in database", error);
          res.status(501).send({
            error: "Error while searching user in database",
            redirectTo: "/login",
          });
        }
      });
    } else {
      next();
    }
  } catch (err) {
    console.log("Error while accessing token");
    return res.status(501).send({
      error: "Error while accessing token",
      redirectTo: "/login",
    });
  }
};

const verifyToken = (req, res, next) => {
  if (req.cookies?.token) {
    const token = req.cookies.token;
    jwt.verify(token, auth_config.secret, async (err, decoded) => {
      if (err) {
        return res.status(401).send({
          warning: "You must be logged in",
          redirectTo: "/login",
        });
      }
      try {
        const user = await user_model.findOne({ userId: decoded.id });
        if (!user) {
          return res.status(401).send({
            error: "Unauthorized, the user for this token does not exist",
            redirectTo: "/",
          });
        }
        req.user = user;
        next();
      } catch (error) {
        console.log("Error while searching for user in database", error);
        return res.status(501).send({
          error: "Error while searching for user in database",
          redirectTo: "/login",
        });
      }
    });
  } else {
    return res.status(401).send({
      warning: "You must be logged in",
      redirectTo: "/login",
    });
  }
};

const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.userType == "ADMIN") {
      next();
    } else {
      return res.status(403).send({
        warning : "Only ADMIN user are allowed to access this endpoint",
        redirectTo : "/"
      });
    }
  } catch (err) {
    console.log("Error while validating ADMIN");
    return res.status(401).send({
      error: "Error while validating ADMIN",
      redirectTo: "/login",
    });
  }
};

module.exports = {
  verifySignUpbody: verifySignUpBody,
  verifySignInBody: verifySignInBody,
  findToken: findToken,
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
