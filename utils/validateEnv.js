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
    console.error('\n❌ ============================================');
    console.error('❌ MISSING REQUIRED ENVIRONMENT VARIABLES');
    console.error('❌ ============================================');
    console.error('❌ Missing:', missing.join(', '));
    console.error('❌ Please set these in Render Dashboard → Environment');
    console.error('❌ ============================================\n');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
};

module.exports = validateEnv;

