const { Provider } = require('ltijs');
const Database = require('ltijs-sequelize');

function setupLTI() {
  // Database configuration
  const db = new Database(
    process.env.DB_NAME || 'dockeride_lti',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: process.env.NODE_ENV !== 'production'
    }
  );

  // LTI Provider setup
  const lti = new Provider(
    process.env.LTI_KEY || 'DOCKERIDE_LTI_KEY',
    {
      url: process.env.LTI_URL || 'http://localhost:3000',
      database: db
    }
  );

  // Configure LTI
  lti.setup(
    process.env.ENCRYPTION_KEY || 'your-encryption-key-min-32-chars-long',
    {
      cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None'
      },
      devMode: process.env.NODE_ENV !== 'production'
    }
  );

  // Whitelist platforms
  lti.whitelist(
    {
      url: process.env.PLATFORM_URL || 'http://localhost:8000',
      name: process.env.PLATFORM_NAME || 'Test LMS',
      clientId: process.env.PLATFORM_CLIENT_ID || 'dockeride-client',
      authenticationEndpoint: process.env.PLATFORM_AUTH_ENDPOINT || 'http://localhost:8000/auth',
      accesstokenEndpoint: process.env.PLATFORM_TOKEN_ENDPOINT || 'http://localhost:8000/token',
      authConfig: {
        method: 'JWK_SET',
        key: process.env.PLATFORM_KEY_ENDPOINT || 'http://localhost:8000/jwks'
      }
    }
  );

  // Deploy and return
  lti.deploy({ serverless: false });
  return lti;
}

module.exports = { setupLTI };