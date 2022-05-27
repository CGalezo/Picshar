/*
  Model for a Comment inside PicShar
  A comment contains:
    - author: A user id. The author of the comment
    - post: A post id. The post the comment belongs to
    - content: A string. The content of the comment
    - created_at: A Date object. The date the comment was created.
*/

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
