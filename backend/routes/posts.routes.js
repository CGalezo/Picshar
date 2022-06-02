const express = require('express');
const router = express.Router();
const controller = require('../controllers/posts.controller');

router.get('/', controller.getPostById);


router.post('/', controller.createNewPost);

router.get('/liked-by', controller.getPostsLikedByUser);
router.get('/saved-by', controller.getPostsSavedByUser);


module.exports = router;
