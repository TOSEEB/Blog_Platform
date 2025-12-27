// Environment variable validation
const validateEnv = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = [];

  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    process.exit(1);
  }
};

module.exports = validateEnv;

