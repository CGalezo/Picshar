const express = require('express');
const UserRoutes = require('../routes/users.routes');
const PostRoutes = require('../routes/posts.routes');
const User = require('../models/users.model');
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');
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
      // Private liked posts
      public_likes: false,
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
    
    //User 2 likes post 1
    GLOBAL_TEST_USER_2.liked_posts.push(post1);

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

describe('Liked Posts of an User Testing', () => {
    it("Should fetch an user's liked posts when proper credentials are given", async () => {
        // login as testUser2
        const response = await request(app).post('/users/login').send({
            username: 'testUser2',
            password: 'testPassword',
        });
        const token = response.body.token;
        const id = Tokenizer.userIdFromToken(token);
        const response2 = await request(app).get(`/posts/liked-by?user_id=${id}`).set('x-access-token', token);
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe("Liked Posts retrieved");
        expect(response2.body.posts.length).toBe(1);
        expect(response2.body.posts[0].img_url).toBe('test url');
        expect(response2.body.posts[0].bio).toBe('test post bio');
    });

    it("Should fail when liked posts are not public and another user try to watch them", async () => {
        // login as testUser
        const response1 = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response1.body.token;
        // login as testUser2
        const response2 = await request(app).post('/users/login').send({
            username: 'testUser2',
            password: 'testPassword',
        });
        const id = Tokenizer.userIdFromToken(response2.body.token);
        const response3 = await request(app).get(`/posts/liked-by?user_id=${id}`).set('x-access-token', token);
        expect(response3.status).toBe(401);
        expect(response3.body.message).toBe("You are not authorized to view this user's liked posts");
    });
});

describe('Save Post Testing', () => {
    it("Should properly add the saved post to user", async () => {
        // New post
        const post5 = new Post({
            img_url: 'test url',
            bio: 'test post bio',
            author: GLOBAL_TEST_USER._id,
        });
        await post5.save();
        // login as testUser
        const response = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response.body.token;
        const response2 = await request(app).post(`/posts/save`).set('x-access-token', token).send({
            post_id: post5._id,
        });
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe('Post saved');
    });
});

describe('Saved Posts of an User Testing', () => {
    it("Should fetch an user's saved posts when itself access", async () => {
        // login as testUser
        const response = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response.body.token;
        const response2 = await request(app).get(`/posts/saved-by`).set('x-access-token', token);
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe("Saved Posts retrieved");
    });
});

describe('Comment Post Testing', () => {
    it("Should successfully create a comment in a post", async () => {
        // New post
        const post6 = new Post({
            img_url: 'test url',
            bio: 'test post bio',
            author: GLOBAL_TEST_USER._id,
        });
        await post6.save();
        // New comment
        const comment1 = new Comment({
            post: post6._id,
            content: 'Existen tantos idiomas y tú decides hablar la verdad',
            author: GLOBAL_TEST_USER._id,
        });
        await comment1.save();
        // login as testUser
        const response = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response.body.token;
        const response2 = await request(app).post(`/posts/comment`).set('x-access-token', token).send({
            post_id: post6._id,
            comment: comment1.content,
        });
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe('Comment posted');
    });
});

describe('Comments of a Post Testing', () => {
    it("Should fetch an past's comments", async () => {
        // login as testUser
        const response = await request(app).post('/users/login').send({
            username: 'testUser',
            password: 'testPassword',
        });
        const token = response.body.token;
        const response2 = await request(app).get(`/posts/comment`).set('x-access-token', token);
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe("Post's comments retrieved");
    });
});

afterEach(async () => {});
