const Tokenizer = require('../utils/token.util');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');

const getPostsByUser = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  const { author } = req.query;

  if (!token) {
    return res.status(401).json({
      message: 'Please provide a token',
    });
  }
  const user_id = Tokenizer.userIdFromToken(token);
  if (!user_id) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  if (author !== user_id) {
    return res.status(401).json({
      message: "You are not authorized to view this user's posts",
    });
  }
  Post.find({ author }, (err, posts) => {
    if (err) {
      return res.status(500).json({
        message: 'Error getting posts',
      });
    }
    if (!posts) {
      return res.status(404).json({
        message: 'No posts found',
      });
    }
    return res.status(200).json({
      message: 'Posts retrieved',
      posts,
    });
  });
};

const getPostsLikedByUser = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  const { author } = req.query;
  if (!token) {
    return res.status(401).json({
      message: 'Please provide a token',
    });
  }
  const requester_id = Tokenizer.userIdFromToken(token);
  if (!requester_id) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const user = await User.findById(author);
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }
  if (user.public_likes || user._id === requester_id) {
    Post.find({ _id: { $in: user.liked_posts } }, (err, posts) => {
      if (err) {
        return res.status(500).json({
          message: 'Error getting posts',
        });
      }
      if (!posts) {
        return res.status(404).json({
          message: 'No posts found',
        });
      }
      return res.status(200).json({
        message: 'Liked Posts retrieved',
        posts,
      });
    });
  } else {
    return res.status(401).json({
      message: "You are not authorized to view this user's liked posts",
    });
  }
};

module.exports = { getPostsByUser, getPostsLikedByUser };
