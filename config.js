// config.js
require('dotenv').config();

module.exports = {
  LOGIN_EMAIL_FRONTEND: process.env.LOGIN_EMAIL_FRONTEND,
  LOGIN_PASSWORD_FRONTEND: process.env.LOGIN_PASSWORD_FRONTEND,
  LOGIN_EMAIL_BACKEND: process.env.LOGIN_EMAIL_BACKEND,
  LOGIN_PASSWORD_BACKEND: process.env.LOGIN_PASSWORD_BACKEND,
  STAGING_PAGE: process.env.STAGING_PAGE,
  STAGING_API: process.env.STAGING_API,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MAIL_SAC_API_KEY: process.env.MAIL_SAC_API_KEY,
  mailsac: {
    apiKey: process.env.MAIL_SAC_API_KEY,
    domain: 'mailsac.com',
    timeout: 180000 // 3 minutes timeout for email verification
  }
};
