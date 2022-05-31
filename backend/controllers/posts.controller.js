const Tokenizer = require('../utils/token.util');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');

const getPostsByUser = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  const { author } = req.query;

  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
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


const createNewPost = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const { img_url, bio, author } = req.body;
  const newPost = new Post({
    img_url,
    bio,
    author,
    created_at: Date.now(),
    comments: [],
  });
  await newPost.save((err, post) => {
    if (err) {
      return res.status(500).json({
        message: "Error saving post",
      });
    }
    return res.status(201).json({
      message: "Post created",
      post,
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
  console.log(user._id, requester_id);
  if (user.public_likes || author === requester_id) {
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

const getPostsSavedByUser = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  const user_id = req.query.user_id || req.query.author;
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
  if (user_id !== requester_id) {
    return res.status(401).json({
      message: "You are not authorized to view this user's saved posts",
    });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }
  Post.find({ _id: { $in: user.saved_posts } }, (err, posts) => {
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
      message: 'Saved Posts retrieved',
      posts,

    });
  });
};


module.exports = { getPostsByUser, createNewPost };

