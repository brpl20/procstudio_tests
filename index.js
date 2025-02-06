// index.js
const { chromium } = require('playwright');
const yargs = require('yargs');
const config = require('./config');
const apiRequests = require('./ApiRequests/api-requests');
const { setRepresentativeNames } = require('./ApiRequests/representativeStore');
const LandingPage = require('./PageObjects/LandingPage');
const LoginPage = require('./PageObjects/LoginPage');
const CustomerIndexPage = require('./PageObjects/CustomerIndexPage');
const CustomerCreateController = require('./PageObjects/CustomerCreateController');
const CustomerCompanyCreateController = require('./PageObjects/CustomerCompanyCreateController');

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
    // console.log("Representative Names:", representativeNames);

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

    switch (customerType) {
      case 'pessoaFisica':
        await customerIndexPage.createPessoaFisica();
        const customerCreateController = new CustomerCreateController(page);
        await customerCreateController.createCustomer();
        break;
      case 'pessoaJuridica':
        await customerIndexPage.createPessoaJuridica();
        const customerCompanyCreateController = new CustomerCompanyCreateController(page);
        await customerCompanyCreateController.createCompanyCustomer();
        break;
      case 'contador':
        await customerIndexPage.createContador();
        break;
      case 'representanteLegal':
        await customerIndexPage.createRepresentanteLegal();
        break;
      default:
        throw new Error('Invalid customer type');
    }
    


    // Await For Check and Debug
    await new Promise(resolve => setTimeout(resolve, 7000));

    console.log('Form submitted successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
}

// Parse command line arguments
const argv = yargs
  .command('create', 'Create a new customer', {
    type: {
      description: 'Type of customer to create',
      alias: 't',
      choices: ['pessoaFisica', 'pessoaJuridica', 'contador', 'representanteLegal'],
      demandOption: true
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

if (argv._.includes('create') && argv.type) {
  runTest(argv.type);
} else {
  console.log('Please specify a valid command and customer type.');
  yargs.showHelp();
}

module.exports = {
  initializeApp,
  runTest
};