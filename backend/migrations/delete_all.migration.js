const { connectDB, disconnectDB } = require('../configs/db.config');
const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const FollowRequest = require('../models/followRequest.model');

// connect to database
connectDB();
