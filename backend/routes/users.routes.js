const express = require('express');
const Tokenizer = require('../utils/token.util');
const router = express.Router();
const controller = require('../controllers/users.controller');

router.post('/', controller.registerUser);

router.post('/login', controller.loginUser);

module.exports = router;
