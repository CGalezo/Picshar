const express = require('express');
const UserRoutes = require('../routes/users.routes');
const FollowRoutes = require('../routes/follows.routes');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const FollowRequest = require('../models/followRequest.model');
const Tokenizer = require('../utils/token.util');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../configs/db.config');

const app = new express();
app.use(express.json());
app.use('/users', UserRoutes);
app.use('/follows', FollowRoutes);

beforeAll(async () => {
  await connectDB();
  const GLOBAL_TEST_USER = new User({
    username: 'testUser10',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail10@gmail.com',
  });
  const GLOBAL_TEST_USER_2 = new User({
    username: 'testUser20',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail20@gmail.com',
  });
  const GLOBAL_TEST_USER_3 = new User({
    username: 'testUser30',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail30@gmail.com',
  });
  const post1 = new Post({
    img_url: 'test url10',
    bio: 'test post bio',
    author: GLOBAL_TEST_USER._id,
  });
  const post2 = new Post({
    img_url: 'test url 20',
    bio: 'test post bio',
    author: GLOBAL_TEST_USER._id,
  });
  const post3 = new Post({
    img_url: 'test url 30',
    bio: 'test post bio',
    author: GLOBAL_TEST_USER_2._id,
  });
  // Add posts to user
  GLOBAL_TEST_USER.posts.push(post1);
  GLOBAL_TEST_USER.posts.push(post2);

  //User 1 likes post 3
  GLOBAL_TEST_USER.liked_posts.push(post3);

  // make users follow eachother
  GLOBAL_TEST_USER.follows.push(GLOBAL_TEST_USER_2._id);
  GLOBAL_TEST_USER.followers.push(GLOBAL_TEST_USER_2._id);
  GLOBAL_TEST_USER_2.follows.push(GLOBAL_TEST_USER._id);
  GLOBAL_TEST_USER_2.followers.push(GLOBAL_TEST_USER._id);

  // user 3 requests to follow user 1 and user 2
  const followRequest1 = new FollowRequest({
    requester: GLOBAL_TEST_USER_3._id,
    requestee: GLOBAL_TEST_USER._id,
  });
  const followRequest2 = new FollowRequest({
    requester: GLOBAL_TEST_USER_3._id,
    requestee: GLOBAL_TEST_USER_2._id,
  });

  Promise.all([
    GLOBAL_TEST_USER.save(),
    GLOBAL_TEST_USER_2.save(),
    GLOBAL_TEST_USER_3.save(),
    post1.save(),
    post2.save(),
    post3.save(),
    followRequest1.save(),
    followRequest2.save(),
  ]);
});

describe('Follows Testing', () => {
  it("Should fetch an user's follower list when proper credentials are given", async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(token);
    const rsp2 = await request(app).get(`/follows/followers?id=${id}`).set('x-access-token', token);
    expect(rsp2.status).toBe(200);
    expect(rsp2.body.followers.length).toBe(1);
    expect(rsp2.body.followers[0].username).toBe('testUser20');
  });
  it("Should fail to fetch an user's follower list when proper credentials are not given", async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser30',
      password: 'testPassword',
    });
    const response2 = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const user10Id = Tokenizer.userIdFromToken(response2.body.token);
    const { token } = rsponse.body;
    const id = Tokenizer.userIdFromToken(token);
    const rsp2 = await request(app)
      .get(`/follows/followers?id=${user10Id}`)
      .set('x-access-token', token);
    expect(rsp2.status).toBe(401);
    expect(rsp2.body.message).toBe(
      "Not following, you're not authorized to see this user's followers"
    );
  });

  it("Should fetch an user's follow list when proper credentials are given", async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(token);
    const rsp2 = await request(app).get(`/follows/following?id=${id}`).set('x-access-token', token);
    expect(rsp2.status).toBe(200);
    expect(rsp2.body.follows.length).toBe(1);
    expect(rsp2.body.follows[0].username).toBe('testUser20');
  });
});

describe('Follow request Testing', () => {
  it('Should successfully create a follow request', async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const response2 = await request(app).post('/users/login').send({
      username: 'testUser30',
      password: 'testPassword',
    });
    const id = Tokenizer.userIdFromToken(response2.body.token);
    const rsp2 = await request(app).post(`/follows/request`).set('x-access-token', token).send({
      user_id: id,
    });
    expect(rsp2.status).toBe(200);
    expect(rsp2.body.message).toBe('Follow request sent');
  });

  it('Should fail gracefully when following yourself', async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(token);
    const rsp2 = await request(app).post(`/follows/request`).set('x-access-token', token).send({
      user_id: id,
    });
    expect(rsp2.status).toBe(401);
  });

  it('Should fail gracefully when creating a FR for someone you follow', async () => {
    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const response2 = await request(app).post('/users/login').send({
      username: 'testUser20',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(response2.body.token);
    const rsp2 = await request(app).post(`/follows/request`).set('x-access-token', token).send({
      user_id: id,
    });
    expect(rsp2.status).toBe(401);
    expect(rsp2.body.message).toBe('You are already following this user');
  });
});

describe('Follow Request handling Testing', () => {
  it('Should successfully accept a follow request', async () => {
    const GLOBAL_TEST_USER_4 = new User({
      username: 'testUser40',
      password: 'testPassword',
      birthdate: new Date(),
      bio: 'test bio 40',
      email: 'testmail40@gmail.com',
    });
    await GLOBAL_TEST_USER_4.save();

    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(rsponse.body.token);
    const fr = new FollowRequest({
      requester: GLOBAL_TEST_USER_4._id,
      requestee: id,
    });
    await fr.save();
    const rsp3 = await request(app).post(`/follows/response`).set('x-access-token', token).send({
      request_id: fr._id.toString(),
      action: 'accept',
    });
    expect(rsp3.status).toBe(200);
    expect(rsp3.body.message).toBe('Follow request accepted');
  });

  it('Should successfully rejected a follow request', async () => {
    const GLOBAL_TEST_USER_5 = new User({
      username: 'testUser40',
      password: 'testPassword',
      birthdate: new Date(),
      bio: 'test bio 40',
      email: 'testmail40@gmail.com',
    });
    await GLOBAL_TEST_USER_5.save();

    const rsponse = await request(app).post('/users/login').send({
      username: 'testUser10',
      password: 'testPassword',
    });
    const token = rsponse.body.token;
    const id = Tokenizer.userIdFromToken(rsponse.body.token);
    const fr = new FollowRequest({
      requester: GLOBAL_TEST_USER_5._id,
      requestee: id,
    });
    await fr.save();
    const rsp3 = await request(app).post(`/follows/response`).set('x-access-token', token).send({
      request_id: fr._id.toString(),
      action: 'reject',
    });
    expect(rsp3.status).toBe(200);
    expect(rsp3.body.message).toBe('Follow request rejected');
  });

});

afterEach(async () => {});
