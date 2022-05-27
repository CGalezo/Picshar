const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../configs/db.config');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');
const FollowRequest = require('../models/followRequest.model');

dotenv.config();
connectDB()
  .then(async () => {
    // create likes
    console.log('Creating likes...');
    try {
      for (let i = 0; i < 500; i++) {
        let user = await User.aggregate([{ $sample: { size: 1 } }]);
        let post = await Post.aggregate([{ $sample: { size: 1 } }]);
        user = user[0];
        post = post[0];
        if (user.liked_posts.indexOf(post._id) === -1) {
          await User.findByIdAndUpdate(user._id, {
            $push: { likedPosts: post._id },
          });
        }
        console.log('User', user.username, 'liked post', post._id);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .then(async () => {
    console.log('Finished creating likes');
    console.log('Creating comments...');
    // create comments
    try {
      for (let i = 0; i < 500; i++) {
        let user = await User.aggregate([{ $sample: { size: 1 } }]);
        let post = await Post.aggregate([{ $sample: { size: 1 } }]);
        user = user[0];
        post = post[0];
        let comment = new Comment({
          author: user._id,
          post: post._id,
          content: faker.lorem.sentence(),
        });
        await comment.save();
        console.log('User', user.username, 'commented on post', post._id);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .then(async () => {
    console.log('Finished creating comments');
    console.log('Creating follows');
    // create follows
    try {
      for (let i = 0; i < 200; i++) {}
      // fetch 2 random users
      let users = await User.aggregate([{ $sample: { size: 2 } }]);
      // add them into each other's follows if not already
      if (users[0].follows.indexOf(users[1]._id) === -1) {
        await User.findByIdAndUpdate(users[0]._id, {
          $push: { follows: users[1]._id },
        });
        await User.findByIdAndUpdate(users[1]._id, {
          $push: { followers: users[0]._id },
        });
        console.log('User', users[0].username, 'followed user', users[1].username);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .then(async () => {
    console.log('Finished creating follows');
    console.log('creating follow requests');
    // create follow requests
    try {
      for (let i = 0; i < 150; i++) {
        // fetch 2 random users
        let users = await User.aggregate([{ $sample: { size: 2 } }]);
        // create follow request from user[0] to user[1]
        if (users[0].follows.indexOf(users[1]._id) === -1) {
          let followRequest = new FollowRequest({
            requester: users[0]._id,
            requestee: users[1]._id,
          });
          await followRequest.save();
          console.log('User', users[0].username, 'requested to follow user', users[1].username);
        }
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .finally(() => {
    disconnectDB();
    console.log('Created records');
  });
