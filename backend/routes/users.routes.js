const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const controller = require('../controllers/users.controller');

router.post('/', controller.registerUser);

router.get("/login", (req, res) => {
  res.json({ mensaje: "LoginPage" });
});

router.post("/login", (req, res) => {
  const user = req.body;
  jwt.sign({ user }, "secretkey", (err, token) => {
    res.json({
      token,
    });
  });
});

module.exports = router;
