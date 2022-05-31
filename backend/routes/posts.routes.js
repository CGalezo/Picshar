const express = require('express');
const router = express.Router();
const controller = require('../controllers/posts.controller');

router.get('/', controller.getPostsByUser);

router.post('/', controller.createNewPost);

module.exports = router;
