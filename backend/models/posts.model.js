/*
  Model for a Post inside PicShar
  A post contains:
  - img_url: A string. Usually a url to an image.
  - bio: A string. the caption for the post
  - author: A user id. The author of the post
  - created_at: A Date object. The date the post was created.
  - comments: An array of comment ids for which the post has been commented on.
*/
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
