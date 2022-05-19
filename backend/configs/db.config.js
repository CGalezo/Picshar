const mongoose = require('mongoose');

export const connectDB = async () => {
  const { DATABASE_ACCESS } = process.env;
  try {
    await mongoose.connect(DATABASE_ACCESS);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Database disconnected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
