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
  const user = await User.findById(user_id);
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }
  if (user.followers.includes(requester_id)) {
    return res.status(401).json({
      message: 'You are already following this user',
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

const handleFollowRequest = async (req, res) => {
  const token = req.headers['x-access-token'] || req.query.token || req.body.token;
  if (!token) {
    return res.status(401).json({
      message: 'Please provide a token',
    });
  }
  const requestee_id = Tokenizer.userIdFromToken(token);
  if (!requestee_id) {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }
  const { request_id, action } = req.body;
  if (!request_id) {
    return res.status(401).json({
      message: 'Please provide a request_id',
    });
  }
  if (!action) {
    return res.status(401).json({
      message: 'Please provide an action',
    });
  }
  if (action !== 'accept' && action !== 'reject') {
    return res.status(401).json({
      message: 'Please provide a valid action',
    });
  }
  FollowRequest.findById(request_id, (err, request) => {
    if (err) {
      return res.status(500).json({
        message: 'Error finding follow request',
      });
    }
    if (!request) {
      return res.status(404).json({
        message: 'Follow request not found',
      });
    }
    if (request.requestee.toString() !== requestee_id) {
      return res.status(401).json({
        message: 'You are not authorized to accept or reject this follow request',
      });
    }
    if (action === 'accept') {
      User.findById(request.requestee, (err, user) => {
        if (err) {
          return res.status(500).json({
            message: 'Error finding user',
          });
        }
        if (!user) {
          return res.status(404).json({
            message: 'Requestee user not found',
          });
        }
        user.followers.push(request.requester);
        user.save((err, user) => {
          if (err) {
            return res.status(500).json({
              message: 'Error saving user',
            });
          }
          request.remove();
          return res.status(200).json({
            message: 'Follow request accepted',
          });
        });
      });
    } else {
      request.remove();
      return res.status(200).json({
        message: 'Follow request rejected',
      });
    }
  });
};

module.exports = {
  createFollowRequest,
  handleFollowRequest,
};
