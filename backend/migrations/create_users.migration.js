const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../configs/db.config');
const User = require('../models/users.model');
const Post = require('../models/posts.model');

dotenv.config();
connectDB()
  .then(async () => {
    try {
      for (let i = 0; i < 100; i++) {
        let user = await createRandomUser();
        console.log('Generated user: ', user.username);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .finally(() => {
    console.log('Finished creating users');
    disconnectDB();
  });

const createRandomUser = async () => {
  const user = new User({
    username: faker.internet.userName(),
    password: faker.internet.password(),
    birthdate: faker.date.past(),
    bio: faker.lorem.paragraph(),
  });
  await user.save();
  return user;
};
