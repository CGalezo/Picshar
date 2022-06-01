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
      username: 'testUser2',
      password: 'testPassword',
      email: 'email2@mail.com',
      birthdate: new Date(),
      bio: 'test bio 2',
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
});

afterAll(async () => {
  await disconnectDB();
});
