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
const RepresentativeCreatePage = require('./PageObjects/RepresentativeCreatePage');

// Import New Builders
const AccountantCreate = require('./PageObjects/AccountantCreate');
const TaskCreatePage = require('./PageObjects/TaskCreate');
const UserCreatePage = require('./PageObjects/UserCreatePage');
const OfficeCreatePage = require('./PageObjects/OfficeCreatePage');
const CustomerPageRepresentative = require('./PageObjects/CustomerPageRepresentative');

async function initializeApp() {
  try {
    // await apiRequests.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);
    const profile_customers = await apiRequests.fetchProfileCustomers();
    
    // console.log("Api Request Ok - Customers");

    console.log(profile_customers.data);
    const representatives = profile_customers.data
      .filter(customer => customer.attributes.customer_type === "representative")
      .map(customer => ({
        id: customer.id,
        name: `${customer.attributes.name} ${customer.attributes.last_name}`,
        email: customer.attributes.default_email,
        phone: customer.attributes.default_phone,
        city: customer.attributes.city
      }));

    // Check if representatives is an array and not empty
    if (!Array.isArray(representatives) || representatives.length === 0) {
      const errorMessage = "Objeto diferente de um array ou array vazio, por favor verifique se há um representante cadastrado ou se houve um erro na api ou no método de filtragem de dados";
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(representatives);
    const representativeNames = representatives.map(rep => rep.name);
    console.log(representativeNames);
    setRepresentativeNames(representativeNames);
    return representatives;
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

async function runTest(customerType, capacity) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await initializeApp();

    const landingPage = new LandingPage(page);
    await landingPage.navigateToLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(config.LOGIN_EMAIL_FRONTEND, config.LOGIN_PASSWORD_FRONTEND);

    const customerIndexPage = new CustomerIndexPage(page);

    switch (customerType) {
      case 'pessoaFisica':
        await customerIndexPage.createPessoaFisica();
        const customerCreateController = new CustomerCreateController(page);
        await customerCreateController.createCustomer(capacity);
        break;

      case 'pessoaJuridica':
        await customerIndexPage.createPessoaJuridica();
        const customerCompanyCreateController = new CustomerCompanyCreateController(page);
        await customerCompanyCreateController.createCompanyCustomer();
        break;

      case 'contador':
        // Contador Logic
        const accountantCreate = new AccountantCreate(page);
        await customerIndexPage.createContador();
        await accountantCreate.fillAccountantDetails();
        break;

      case 'representanteLegal':
        // Representante Legal Logic
        // TD: Corrigir as rotas para não ficar mudando depois entre staging e produção toda hora -- config routes? 
        const representativeCreatePage = new RepresentativeCreatePage(page);
        await representativeCreatePage.fillRepresentativeForm();
        break;

      case 'tarefa':
        // Tarefa Logic
        const taskCreatePage = new TaskCreatePage(page);
        await taskCreatePage.handleTaskCreatePage();
        break;

      case 'usuario':
        // Usuario Logic
        const userCreatePage = new UserCreatePage(page);
        await userCreatePage.fillUserForm();
        break;

      case 'escritorio':
        // Escritorio Logic
        const officeCreatePage = new OfficeCreatePage(page);
        await officeCreatePage.fillOfficeForm();
        break;

      default:
        throw new Error('Invalid test type');
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
// TD: Argv pessoa fisica relativamente incaapz -> Não está funcionando -> Passa sem argumento e vai para o random 
const argv = yargs
  .command('create', 'Create a new customer', {
    type: {
      description: 'Type of customer to create',
      alias: 't',
      choices: [
        'pessoaFisica',
        'pessoaJuridica',
        'contador',
        'representanteLegal',
        'tarefa',
        'usuario',
        'escritorio'
      ],
      demandOption: true
    },
    capacity: {
      description: 'Specify the capacity of the customer (optional). Only relevant for "pessoaFisica". Use "random" for random selection.',
      alias: 'c',
      default: null, // Default is null (not required)
      coerce: (value) => {
        if (value === null || value === 'random') return null; // Allow null or "random"
        if (['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz'].includes(value)) return value;
        throw new Error(`Invalid capacity value: ${value}`);
      }
    }
  })
  .check((argv) => {
    // Validate capacity only if type is pessoaFisica
    if (argv.type === 'pessoaFisica' && argv.capacity === null) {
      console.log('Capacity is required for pessoaFisica. Using random selection.');
    } else if (argv.type !== 'pessoaFisica' && argv.capacity !== null) {
      console.warn('Capacity is ignored for non-pessoaFisica types.');
    }
    return true; // Validation passes
  })
  .help()
  .alias('help', 'h')
  .argv;

if (argv._.includes('create') && argv.type) {
  runTest(argv.type, argv.capacity); // Pass the capacity argument to runTest
} else {
  console.log('Please specify a valid command and customer type.');
  yargs.showHelp();
}

module.exports = {
  initializeApp,
  runTest
};