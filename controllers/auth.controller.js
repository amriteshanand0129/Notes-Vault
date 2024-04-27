const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth_config = require("../configs/auth.config");
var user_model = require("../models/user.model");

const signup = async (req, res) => {
  const request_body = req.body;
  const userObj = {
    name: request_body.name,
    userId: request_body.userId,
    userType: request_body.userType,
    password: bcrypt.hashSync(request_body.password, 8),
  };
  try {
    const user_created = await user_model.create(userObj);
    res.status(201).send({
      message: "Thanks " + user_created.name + "! You can now login using your userId : " + user_created.userId,
      redirectTo: "/"
    });
  } catch (err) {
    console.log("Error: User Registration Failed", err);
    res.status(501).send({
      error: "Error: User Registration Failed"
    });
  }
};
const signin = async (req, res) => {
  const user = await user_model.findOne({ userId: req.body.userId });
  if (user == null) {
    return res.status(401).send({
      error: "User not found"
    });
  }
  try {
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        error: "Incorrect password"
      });
    }

    const token = jwt.sign({ id: user.userId }, auth_config.secret, { expiresIn: 3600 });
    res.status(201).cookie("token", token);
    res.send({
      message: "Logged In Successfully",
      redirectTo: "/",
    });
  } catch (error) {
    console.log("Error: Password Validation failed", error);
    res.status(501).send({
        error: "Error: Password Validation Failed"
    })
  }
};
module.exports = {
  signup: signup,
  signin: signin,
};
