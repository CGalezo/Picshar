const User = require('../models/users.model');
const JWT = require('jsonwebtoken');

export const registerUser = async (req, res) => {
  const { username, password, email, birthdate, bio } = req.body;
  if (!username || !password || !email || !birthdate || !bio) {
    return res.status(400).json({
      message: 'Please fill in all necessary fields',
    });
  }
  // Check if user already exists
  await User.findOne({ username }, (err, user) => {
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
      token: JWT.sign(user, process.env.SECRET_KEY),
    });
  });
};
