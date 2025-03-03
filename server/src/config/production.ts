export const config = {
  port: process.env.PORT || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/flashmail',
  clientUrl: process.env.CLIENT_URL || 'https://flashmail.onrender.com',
  emailDomain: process.env.EMAIL_DOMAIN || 'demo.flashmail.com',
  smtpPort: process.env.SMTP_PORT || 2525,
  emailExpirationHours: parseInt(process.env.EMAIL_EXPIRATION_HOURS || '24'),
  isDevelopment: false,
  isProduction: true
}; 