// Dependencies
const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");

// Database model modules
const user_model = require("../models/user.model");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("../views"));

// Signup request body verification
const verifySignUpBody = async (req, res, next) => {
  try {
    if (!req.body.name) {
      return res.status(401).send({
        error: "Invalid Name",
      });
    }
    if (!req.body.userId) {
      return res.status(401).send({
        error: "Invalid Username",
      });
    }
    if (!req.body.password) {
      return res.status(401).send({
        error: "Invalid Password",
      });
    }
    if (req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
      });
    }
    const user = await user_model.findOne({ userId: req.body.userId });
    if (user) {
      return res.status(401).send({
        error: "Username not available. Try different UserId",
      });
    }
    next();
  } catch (err) {
    console.log("Error: SignUp Request body validation failed", err);
    return res.status(501).send({
      error: "Error: SignUp Request body validation failed",
    });
  }
};

// Signin request body verification
const verifySignInBody = (req, res, next) => {
  try {
    if (!req.body.userId) {
      return res.status(401).send({
        error: "Invalid UserId",
      });
    }
    if (!req.body.password) {
      return res.status(401).send({
        error: "Invalid Password",
      });
    }
    next();
  } catch (err) {
    console.log("Error: SignIn Request body validation failed", err);
    return res.send(501).send({
      error: "Error: SignIn Request body validation failed",
      redirectTo: "/login",
    });
  }
};

const verifyChangePasswordBody = async (req, res, next) => {
  try {
    if (!req.body.userId) {
      return res.status(401).send({
        error: "Invalid Username",
      });
    }
    if (!req.body.password) {
      return res.status(401).send({
        error: "Invalid Password",
      });
    }
    if (req.body.password.length < 8 || req.body.password.length > 16) {
      return res.status(401).send({
        error: "Password size should be 8 to 16 characters",
      });
    }
    const user = await user_model.findOne({ userId: req.body.userId });
    if (!user) {
      return res.status(401).send({
        error: "Username not available. Try different UserId",
      });
    }
    else
      req.user = user;
    next();
  } catch (err) {
    console.log("Error: Password change request body validation failed", err);
    return res.status(501).send({
      error: "Error: Password change request body validation failed",
    });
  }
}

/**
 * Checks if token is present, to decide which homepage to render
 * Adds user data to request body if token found and is valid
 */
const findToken = (req, res, next) => {
  try {
    if (req.cookies?.token) {
      const token = req.cookies.token;
      jwt.verify(token, process.env.secret, async (err, decoded) => {
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

// Token verification middleware for login required pages
const verifyToken = (req, res, next) => {
  if (req.cookies?.token) {
    const token = req.cookies.token;
    jwt.verify(token, process.env.secret, async (err, decoded) => {
      if (err) {
        return res.render("login", {
          server_message: "You must be logged in",
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
    return res.render("login", {
      server_message: "You must be logged in",
    });
  }
};

// Admin verification
const isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user && user.userType == "ADMIN") {
      next();
    } else {
      return res.status(403).send({
        warning: "Only ADMIN user are allowed to access this endpoint",
        redirectTo: "/",
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
  verifyChangePasswordBody: verifyChangePasswordBody,
  findToken: findToken,
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
