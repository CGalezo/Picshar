// In order to run this migration, there must be users in the database.
const { faker } = require('@faker-js/faker');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../configs/db.config');
const User = require('../models/users.model');
const Post = require('../models/posts.model');

dotenv.config({ path: `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}` });
connectDB()
  .then(async () => {
    try {
      for (let i = 0; i < 200; i++) {
        let user = await User.aggregate([{ $sample: { size: 1 } }]);
        user = user[0];
        let post = new Post({
          img_url: await getRandomPictureURL(),
          bio: faker.lorem.paragraph(),
          author: user._id,
          created_at: Date.now(),
        });
        await post.save();
        await User.findOneAndUpdate({ _id: user._id }, { $push: { posts: post._id } });
        console.log('Generated post: ', post.img_url, 'for user', user.username);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  })
  .finally(() => {
    console.log('Finished creating posts');
    disconnectDB();
  });

const getRandomPictureURL = async () => {
  const pictureMethods = [
    faker.image.abstract,
    faker.image.animals,
    faker.image.business,
    faker.image.cats,
    faker.image.city,
    faker.image.food,
    faker.image.nightlife,
    faker.image.fashion,
    faker.image.people,
    faker.image.nature,
    faker.image.sports,
    faker.image.technics,
    faker.image.transport,
  ];

  // choose random method to call
  const randomMethod = pictureMethods[Math.floor(Math.random() * pictureMethods.length)];
  return randomMethod((width = 640), (height = 640));
};
