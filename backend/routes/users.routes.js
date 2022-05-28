const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const controller = require("../controllers/users.controller");


router.post("/", controller.registerUser);

router.post("/login", (req, res) => {
  const user = req.body;
  jwt.sign({ user }, "secretkey", (err, token) => {
    res.json({
      token,
    });
  });
});

const verifytoken = (req, res, next) => {
  const bearerHeader = req.headers[authorization];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};


module.exports = router;
