require('dotenv').config({
  path: `.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`,
});

module.exports = {
  verbose: true,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  roots: ['../tests'],
};
