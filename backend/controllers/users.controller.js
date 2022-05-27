const User = require('../models/users.model');
const Tokenizer = require('../utils/token.util');

const registerUser = async (req, res) => {
  const { username, password, email, birthdate, bio } = req.body;
  if (!username || !password || !email || !birthdate || !bio) {
    return res.status(400).json({
      message: 'Please fill in all necessary fields',
    });
  }
  // Check if user already exists
  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking if user exists',
      });
    }
    if (user) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }
  });
  // create user
  const newUser = new User({
    username,
    password, //TODO: hash password
    email,
    birthdate: new Date(birthdate),
    bio,
  });
  await newUser.save((err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'Error saving user',
      });
    }
    return res.status(201).json({
      message: 'User created',
      token: Tokenizer.tokenFromUser(user),
    });
  });
};

const getUser = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      message: 'Please provide an id',
    });
  } else {
    User.findById(id, (err, user) => {
      if (err) {
        return res.status(500).json({
          message: 'Error getting user',
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }
      return res.status(200).json({
        message: 'User found',
        id: user._id,
        username: user.username,
        email: user.email,
        birthdate: user.birthdate,
        bio: user.bio,
        follow_count: user.follows.length,
        follower_count: user.followers.length,
        post_count: user.posts.length,
        liked_post_count: user.liked_posts.length,
      });
    });
  }
};

module.exports = { registerUser, getUser };
