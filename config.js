// config.js
require('dotenv').config();

module.exports = {
  LOGIN_EMAIL: process.env.LOGIN_EMAIL,
  LOGIN_PASSWORD: process.env.LOGIN_PASSWORD,
  STAGING_PAGE: process.env.STAGING_PAGE,
  STAGING_API: process.env.STAGING_API,
};