const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = model('Comment', commentSchema);
