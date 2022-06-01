const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');

router.get('/following', userController.getFollows);
router.get('/followers', userController.getFollows);

module.exports = router;
