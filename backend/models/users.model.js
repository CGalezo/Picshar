/*
  Model for a User inside PicShar
  A user contains:
    - username: A non empty, unique string.
    - password: A non empty string.
    - birthday: A Date object.
    - bio: A string.
    - follows: An array of user ids for which the user is following.
    - followers: An array of user ids for which the user is being followed by.
    - posts: An array of post ids for which the user has posted.
    - liked_posts: An array of post ids for which the user has liked.
*/

const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  birthdate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
  },
  public_likes: {
    type: Boolean,
    required: true,
    default: true,
  },
  saved_posts: {
    type: [Schema.Types.ObjectId],
    ref: 'Post',
  },
  follows: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  followers: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  posts: {
    type: [Schema.Types.ObjectId],
    ref: 'Post',
  },
  liked_posts: {
    type: [Schema.Types.ObjectId],
    ref: 'Post',
  },
});

module.exports = model('User', userSchema);
