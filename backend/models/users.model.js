const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
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
  },
  { collection: 'users' }
);

module.exports = model('User', userSchema);
