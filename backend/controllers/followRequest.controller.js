const Tokenizer = require('../utils/token.util');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const FollowRequest = require('../models/followRequest.model');

const createFollowRequest = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
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
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(401).json({
      message: 'Please provide a user_id',
    });
  }
  if (requester_id === user_id) {
    return res.status(401).json({
      message: 'You cannot follow yourself, you dumb bastard',
    });
  }
  const followRequest = await FollowRequest.findOne({
    requester: requester_id,
    requestee: user_id,
  });
  if (followRequest) {
    return res.status(401).json({
      message: 'You have already requested to follow this user, please wait for their response',
    });
  }
  const newFollowRequest = new FollowRequest({
    requester: requester_id,
    requestee: user_id,
  });
  await newFollowRequest.save();
  return res.status(200).json({
    message: 'Follow request sent',
  });
};

module.exports = {
  createFollowRequest,
};
