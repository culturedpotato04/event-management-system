const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer necessary in Mongoose 6+ but keeping standard connection
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please ensure MongoDB is running or update your MONGO_URI.');
    // Do not exit process, allow the app to run (to fulfill Phase 2 requirement)
  }
};

module.exports = connectDB;
