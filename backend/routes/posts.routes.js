const express = require('express');
const router = express.Router();
const controller = require('../controllers/posts.controller');

router.get('/', controller.getPostsByUser);
router.get('/liked-by', controller.getPostsLikedByUser);

module.exports = router;
