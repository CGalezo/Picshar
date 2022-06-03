const express = require('express');
const UserRoutes = require('../routes/users.routes');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Tokenizer = require('../utils/token.util');
const request = require('supertest');
const { connectDB, disconnectDB, drop_all } = require('../configs/db.config');

const app = new express();
app.use(express.json());
app.use('/users', UserRoutes);

beforeAll(async () => {
  jest.setTimeout(10000);
  await connectDB();
  const GLOBAL_TEST_USER = new User({
    username: 'testUser',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail@gmail.com',
  });
  const GLOBAL_TEST_USER_2 = new User({
    username: 'testUser2',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail2@gmail.com',
  });
  const post1 = new Post({
    img_url: 'test url',
    bio: 'test post bio',
    author: GLOBAL_TEST_USER._id,
  });
  const post2 = new Post({
    img_url: 'test url 2',
    bio: 'test post bio',
    author: GLOBAL_TEST_USER._id,
  });
  const post3 = new Post({
    img_url: 'test url 3',
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

  Promise.all([GLOBAL_TEST_USER.save(), GLOBAL_TEST_USER_2.save(), post1.save(), post2.save()]);
});

describe('User Login Testing', () => {
  it('Should properly get a token after logging in', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'testUser',
      password: 'testPassword',
    });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('Should fail gracefully when user does not exist', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'testUser3',
      password: 'testPassword',
    });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('Should fail gracefully when password is incorrect', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'testUser',
      password: 'testPassword2',
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid password');
  });

  it('Should login properly when supplied a valid token', async () => {
    const response = await request(app).post('/users/login').send({
      username: 'testUser',
      password: 'testPassword',
    });
    const token = response.body.token;
    const response2 = await request(app).post('/users/login').set('x-access-token', token);
    expect(response2.status).toBe(200);
    expect(response2.body.token).toBeDefined();
  });
});

describe('User Registration testing', () => {
  it('Should properly register a user with valid info', async () => {
    const response = await request(app).post('/users/').send({
      username: 'testUser4',
      password: 'testPassword',
      email: 'email3@mail.com',
      birthdate: new Date(),
      bio: 'test bio 3',
    });
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created');
    expect(response.body.token).toBeDefined();
  });

  it('Should fail gracefully when username is already taken', async () => {
    const response = await request(app).post('/users/').send({
      username: 'testUser2',
      password: 'testPassword',
      email: 'anothermail@mail.com',
      birthdate: new Date(),
      bio: 'test bio 2',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('Should fail gracefully when info provided is not sufficient', async () => {
    const response = await request(app).post('/users/').send({
      username: 'testUser2',
      password: 'testPassword',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Please fill in all necessary fields');
  });
});

describe('User Profile testing', () => {
  it("Should properly fetch an user's information", async () => {
    // login as testUser
    const response = await request(app).post('/users/login').send({
      username: 'testUser',
      password: 'testPassword',
    });
    const token = response.body.token;
    const id = Tokenizer.userIdFromToken(token);
    const response2 = await request(app).get(`/users?user_id=${id}`).set('x-access-token', token);
    expect(response2.status).toBe(200);
    expect(response2.body.username).toBe('testUser');
    expect(response2.body.email).toBe('testmail@gmail.com');
    expect(response2.body.bio).toBe('test bio');
    expect(response2.body.post_count).toBe(2);
    expect(response2.body.follow_count).toBe(1);
    expect(response2.body.follower_count).toBe(1);
    expect(response2.body.liked_post_count).toBe(1);
    expect(response2.body.birthdate).toBeUndefined();
  });
});

afterAll(async () => {});
