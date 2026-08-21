export default () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
});
