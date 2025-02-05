// index.js
const { chromium } = require('playwright');
const config = require('./config');
const apiRequests = require('./ApiRequests/api-requests');
const { setRepresentativeNames } = require('./ApiRequests/representativeStore');
const LandingPage = require('./PageObjects/LandingPage');
const LoginPage = require('./PageObjects/LoginPage');
const CustomerIndexPage = require('./PageObjects/CustomerIndexPage');
const CustomerPage = require('./PageObjects/CustomerPage');
const CustomerPageAddress = require('./PageObjects/CustomerPageAddress');
const CustomerContactPage = require('./PageObjects/CustomerContactPage');



async function initializeApp() {
  try {
    await apiRequests.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);
    const profile_customers = await apiRequests.fetchProfileCustomers();
    console.log("Api Request Ok - Customers");
    
    const representatives = profile_customers.data
      .filter(customer => customer.attributes.customer_type === "representative")
      .map(customer => ({
        id: customer.id,
        name: `${customer.attributes.name} ${customer.attributes.last_name}`,
        email: customer.attributes.default_email,
        phone: customer.attributes.default_phone,
        city: customer.attributes.city
      }));
    
    const representativeNames = representatives.map(rep => rep.name);
    setRepresentativeNames(representativeNames);
    console.log("Representative Names:", representativeNames);

    return representatives;
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await initializeApp();

    const landingPage = new LandingPage(page);
    await landingPage.navigateToLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);

    const customerIndexPage = new CustomerIndexPage(page);
    await customerIndexPage.createPessoaFisica();
    
    await page.waitForTimeout(1000);
    const customerPage = new CustomerPage(page);
    await customerPage.fillCustomerForm();
    // await customerPage.submitForm();

    const customerPageAddress = new CustomerPageAddress(page);
    await customerPageAddress.fillCustomerAddress();

    const customerContactPage = new CustomerContactPage(page);
    await customerContactPage.verifySelectors();
    await customerContactPage.fillContactInfo();
    // await customerContactPage.clickNextButton();
    await new Promise(resolve => setTimeout(resolve, 7000));

    console.log('Form submitted successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})();

// If you need to export anything for use in other files, do it here
module.exports = {
  initializeApp,
  // Add any other exports if needed
};