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
const CustomerBankDetails = require('./PageObjects/CustomerBankDetails');
const CustomerAdditionalInfoPage = require('./PageObjects/CustomerAdditionalInfoPage');
const CustomerFinalPage = require('./PageObjects/CustomerFinalPage');

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

async function runTest(customerType) {
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

    // Choose between pessoa física and jurídica
    if (customerType === 'fisica') {
      await customerIndexPage.createPessoaFisica();
    } else if (customerType === 'juridica') {
      await customerIndexPage.createPessoaJuridica();
    } else {
      throw new Error('Invalid customer type. Use "fisica" or "juridica".');
    }

    await page.waitForTimeout(1000);
    const customerPage = new CustomerPage(page);
    await customerPage.fillCustomerForm();

    const customerPageAddress = new CustomerPageAddress(page);
    await customerPageAddress.fillCustomerAddress();

    const customerContactPage = new CustomerContactPage(page);
    await customerContactPage.fillContactInfo();
    await customerContactPage.clickNextButton();

    const CustomerPageBankDetails = new CustomerBankDetails(page);
    await CustomerPageBankDetails.fillBankDetails();

    const CustomerAdditionalInfo = new CustomerAdditionalInfoPage(page);
    await CustomerAdditionalInfo.fillAdditionalInfo();

    const CustomerFinal = new CustomerFinalPage(page);
    await CustomerFinal.completeFinalStep();

    // Await For Check and Debug
    await new Promise(resolve => setTimeout(resolve, 7000));

    console.log('Form submitted successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

// Get customer type from command-line arguments or config
const customerType = process.argv[2] || config.CUSTOMER_TYPE; // e.g., "fisica" or "juridica"

// Run the test with the specified customer type
runTest(customerType).catch(console.error);

// Export for use in other files
module.exports = {
  initializeApp,
  runTest,
};