const Tokenizer = require("../utils/token.util");
const User = require("../models/users.model");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");

const getPostsByUser = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const { author } = req.query;

  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const user_id = Tokenizer.userIdFromToken(token);
  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token",
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
        message: "Error getting posts",
      });
    }
    if (!posts) {
      return res.status(404).json({
        message: "No posts found",
      });
    }
    return res.status(200).json({
      message: "Posts retrieved",
      posts,
    });
  });
};

const createNewPost = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const { img_url, bio, author } = req.body;
  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const user_id = Tokenizer.userIdFromToken(token);
  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
  if (author !== user_id) {
    return res.status(401).json({
      message: "You are not authorized to create a post for this author",
    });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  } else {
    const post = new Post({
      img_url,
      bio,
      author: user_id, // user_id is the author of the post
    });
    post.save((err, post) => {
      if (err) {
        return res.status(500).json({
          message: "Error creating post",
        });
      }
      return res.status(201).json({
        message: "Post created",
        post,
      });
    });
  }
};

const getPostsLikedByUser = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const { author } = req.query;
  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const requester_id = Tokenizer.userIdFromToken(token);
  if (!requester_id) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
  const user = await User.findById(author);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  console.log(user._id, requester_id);
  if (user.public_likes || author === requester_id) {
    Post.find({ _id: { $in: user.liked_posts } }, (err, posts) => {
      if (err) {
        return res.status(500).json({
          message: "Error getting posts",
        });
      }
      if (!posts) {
        return res.status(404).json({
          message: "No posts found",
        });
      }
      return res.status(200).json({
        message: "Liked Posts retrieved",
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
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const user_id = req.query.user_id || req.query.author;
  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const requester_id = Tokenizer.userIdFromToken(token);
  if (!requester_id) {
    return res.status(401).json({
      message: "Invalid token",
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
      message: "User not found",
    });
  }
  Post.find({ _id: { $in: user.saved_posts } }, (err, posts) => {
    if (err) {
      return res.status(500).json({
        message: "Error getting posts",
      });
    }
    if (!posts) {
      return res.status(404).json({
        message: "No posts found",
      });
    }
    return res.status(200).json({
      message: "Saved Posts retrieved",
      posts,
    });
  });
};

const getPostById = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;

  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const user_id = Tokenizer.userIdFromToken(token);
  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
  const { post_id } = req.body;
  const post = await Post.findById(post_id);
  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }
  const [img_url, bio, author] = [post.img_url, post.bio, post.author];
  const likes = await User.find(
    { liked_posts: { $in: [post_id] } },
    "username"
  );
  return res.status(200).json({
    message: "Post retrieved",
    img_url,
    bio,
    author,
    likes,
    comment: post.comments,
  });
};

const likePost = async (req, res) => {
  const token =
    req.headers["x-access-token"] || req.query.token || req.body.token;
  const { post_id } = req.body;
  if (!token) {
    return res.status(401).json({
      message: "Please provide a token",
    });
  }
  const user_id = Tokenizer.userIdFromToken(token);
  if (!user_id) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const post = await Post.findById(post_id);
  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }
  if (user.liked_posts.includes(post_id)) {
    return res.status(401).json({
      message: "You have already liked this post",
    });
  }
  user.liked_posts.push(post_id);
  user.save((err, user) => {
    if (err) {
      return res.status(500).json({
        message: "Error liking post",
      });
    }
    return res.status(200).json({
      message: "Post liked",
      user,
    });
  });
};

module.exports = {
  getPostsByUser,
  createNewPost,
  getPostsLikedByUser,
  getPostsSavedByUser,
  getPostById,
  likePost,
};
