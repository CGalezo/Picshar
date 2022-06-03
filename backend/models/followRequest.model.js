/*
  Model for a Follow Request inside PicShar
  A follow request contains:
    - requester: A user id. The user who requested to follow
    - requestee: A user id. The user who is being (attempted to be) followed
    - created_at: A Date object. The date the follow request was created.
*/

const { Schema, model } = require('mongoose');

const followRequestSchema = new Schema({
  requester: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = model('FollowRequest', followRequestSchema);
