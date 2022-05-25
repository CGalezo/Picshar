const mongoose = require('mongoose');

const connectDB = async () => {
  const { DATABASE_ACCESS } = process.env;
  try {
    await mongoose.connect(DATABASE_ACCESS);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
