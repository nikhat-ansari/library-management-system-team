export default () => ({
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lms-users',
});
