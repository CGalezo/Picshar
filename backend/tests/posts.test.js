const express = require('express');
const UserRoutes = require('../routes/users.routes');
const PostRoutes = require('../routes/posts.routes');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Tokenizer = require('../utils/token.util');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../configs/db.config');

const app = new express();
app.use(express.json());
app.use('/users', UserRoutes);
app.use('/posts', PostRoutes);

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

describe('Like Post Testing', () => {
    it("Should properly add the liked post to user", async () => {
        const post4 = new Post({
            img_url: 'test url',
            bio: 'test post bio',
            author: GLOBAL_TEST_USER._id,
        });
        await post4.save();
        // login as testUser
        const response = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response.body.token;
        const response2 = await request(app).post(`/posts/like`).set('x-access-token', token).send({
            post_id: post4._id,
        });
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe('Post liked');
    });
});

afterEach(async () => {});
