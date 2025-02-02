// index.js
const { chromium } = require('playwright');
const config = require('./config');
const apiRequests = require('./api-requests');
const LandingPage = require('./PageObjects/LandingPage');
const LoginPage = require('./PageObjects/LoginPage');
const CustomerIndexPage = require('./PageObjects/CustomerIndexPage');
const CustomerPage = require('./PageObjects/CustomerPage');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await apiRequests.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);
    const customers = await apiRequests.fetchCustomers();
    console.log("Api Request Ok - Customers");

    const landingPage = new LandingPage(page);
    await landingPage.navigateToLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);

    const customerIndexPage = new CustomerIndexPage(page);
    await customerIndexPage.createPessoaFisica();
    
    await page.waitForTimeout(1000);
    const customerPage = new CustomerPage(page);
    await customerPage.fillCustomerForm();
    await customerPage.submitForm();

    console.log('Form submitted successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})();