const express = require('express');
const UserRoutes = require('../routes/users.routes');
const User = require('../models/users.model');
const request = require('supertest');
const { connectDB, disconnectDB } = require('../configs/db.config');

const app = new express();
app.use(express.json());
app.use('/users', UserRoutes);

beforeAll(async () => {
  await connectDB();
  const user = new User({
    username: 'testUser',
    password: 'testPassword',
    birthdate: new Date(),
    bio: 'test bio',
    email: 'testmail@gmail.com',
  });
  await user.save();
});

describe('User Routes Testing', () => {
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
      username: 'testUser2',
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
});

afterAll(async () => {
  await disconnectDB();
});
