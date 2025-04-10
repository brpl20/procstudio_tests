// config.js
require('dotenv').config();

module.exports = {
  LOGIN_EMAIL_FRONTEND: process.env.LOGIN_EMAIL_FRONTEND,
  LOGIN_PASSWORD_FRONTEND: process.env.LOGIN_PASSWORD_FRONTEND,
  LOGIN_EMAIL_BACKEND: process.env.LOGIN_EMAIL_BACKEND,
  LOGIN_PASSWORD_BACKEND: process.env.LOGIN_PASSWORD_BACKEND,
  STAGING_PAGE: process.env.STAGING_PAGE,
  STAGING_API: process.env.STAGING_API,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
