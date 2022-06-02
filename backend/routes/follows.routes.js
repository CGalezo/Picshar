const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const frController = require('../controllers/followRequest.controller');

router.get('/following', userController.getFollows);
router.get('/followers', userController.getFollowers);
router.post('/request', frController.createFollowRequest);
router.post('/response', frController.handleFollowRequest);

module.exports = router;
