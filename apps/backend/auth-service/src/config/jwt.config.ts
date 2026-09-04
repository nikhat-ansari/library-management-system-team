const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in the local environment`);
  return value;
};

export default () => ({
  jwtSecret: requiredEnv('JWT_SECRET'),
  jwtExpiresIn: requiredEnv('JWT_EXPIRES_IN'),
});
