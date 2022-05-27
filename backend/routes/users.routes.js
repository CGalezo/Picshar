const express = require('express');
const router = express.Router();
const controller = require('../controllers/users.controller');

router.post('/', controller.registerUser);
router.get('/', controller.getUser);

module.exports = router;
