const { connectDB, disconnectDB } = require('../configs/db.config');
const dotenv = require('dotenv');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');
const FollowRequest = require('../models/followRequest.model');

// connect to database
dotenv.config({ path: `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}` });
connectDB()
  .then(async () => {
    try {
      // delete all users
      await User.deleteMany({});
      console.log('Deleted all users');
      // Delete all posts
      await Post.deleteMany({});
      console.log('Deleted all posts');
      // Delete all comments
      await Comment.deleteMany({});
      console.log('Deleted all comments');
      // Delete all follow requests
      await FollowRequest.deleteMany({});
      console.log('Deleted all follow requests');
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .finally(() => {
    console.log('Finished deleting all');
    disconnectDB();
  });
