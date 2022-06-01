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

const loginUser = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  if (token) {
    const user_id = Tokenizer.userIdFromToken(token);
    if (user_id) {
      return res.status(200).json({
        message: 'User already logged in',
        token,
      });
    } else {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      message: 'Please fill in all necessary fields',
    });
  }
  User.findOne({ username }, (err, user) => {
    if (err) {
      return res.status(500).json({
        message: 'Error checking if user exists',
      });
    }
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    if (user.password !== password) {
      return res.status(401).json({
        message: 'Invalid password',
      });
    }
    return res.status(200).json({
      message: 'User logged in',
      token: Tokenizer.tokenFromUser(user),
    });
  });
};

const getFollowers = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  if (!token) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const requester_id = Tokenizer.userIdFromToken(token);
  console.log(requester_id);
  if (!requester_id) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      message: 'Please provide an id',
    });
  }
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
    if (user.followers.indexOf(requester_id) === -1) {
      return res.status(401).json({
        message: "Not following, you're not authorized to see this user's followers",
      });
    }
    User.find({ _id: { $in: user.followers } }, (err, users) => {
      if (err) {
        return res.status(500).json({
          message: 'Error getting followers',
        });
      }
      return res.status(200).json({
        message: 'Followers found',
        followers: users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          birthdate: user.birthdate,
          bio: user.bio,
          follow_count: user.follows.length,
          follower_count: user.followers.length,
          post_count: user.posts.length,
          liked_post_count: user.liked_posts.length,
        })),
      });
    });
  });
};

const getFollows = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  if (!token) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const requester_id = Tokenizer.userIdFromToken(token);
  if (!requester_id) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({
      message: 'Please provide an id',
    });
  }
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
    if (user.followers.indexOf(requester_id) === -1 && id !== requester_id) {
      return res.status(401).json({
        message: "Not following, you're not authorized to see this user's follows",
      });
    }
    User.find({ _id: { $in: user.follows } }, (err, users) => {
      if (err) {
        return res.status(500).json({
          message: 'Error getting follows',
        });
      }
      return res.status(200).json({
        message: 'Follows found',
        follows: users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
          birthdate: user.birthdate,
          bio: user.bio,
          follow_count: user.follows.length,
          follower_count: user.followers.length,
          post_count: user.posts.length,
          liked_post_count: user.liked_posts.length,
        })),
      });
    });
  });
};

module.exports = { registerUser, getUser, loginUser, getFollowers, getFollows };
