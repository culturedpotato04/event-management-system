require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Establish the shared database connection when the serverless module is loaded.
// Mongoose reuses the connection across warm Vercel invocations.
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // In a real production app we might exit, but for dev we keep it alive
});

// Vercel's Node runtime calls the exported Express app for each request.
module.exports = app;

// Start a listener only during local development, never in a serverless runtime.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}
