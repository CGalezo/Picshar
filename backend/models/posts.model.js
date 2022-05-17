const { Schema, model } = require('mongoose');

const postSchema = new Schema({
  img_url: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  comments: {
    type: [Schema.Types.ObjectId],
    ref: 'Comment',
  },
});

module.exports = model('Post', postSchema);
