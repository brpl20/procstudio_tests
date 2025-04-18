const { chromium } = require('playwright');
const yargs = require('yargs/yargs')(process.argv.slice(2));
const config = require('./config');
const apiRequests = require('./ApiRequests/api-requests');
const { setRepresentativeNames } = require('./ApiRequests/representativeStore');
const LandingPage = require('./PageObjects/LandingPage');
const LoginPage = require('./PageObjects/LoginPage');
const CustomerIndexPage = require('./PageObjects/CustomerIndexPage');
const CustomerCreateController = require('./Controllers/CustomerCreateController');
const CustomerCompanyCreateController = require('./Controllers/CustomerCompanyCreateController');
const RepresentativeCreatePage = require('./PageObjects/RepresentativeCreatePage');
const ViewCustomers = require('./ViewTests/ViewCustomers'); 
// const EmailVerificationService = require('./Utils/EmailVerify'); // Desabilitado 

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

    // console.log(profile_customers.data);
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
      const warningMessage = "Objeto diferente de um array ou array vazio, não foram encontrados representantes cadastrados.";
      console.warn(warningMessage);
      
      // RESOLVED TODO: Verificação adicionada para verificar a mensagem "Nenhum cliente encontrado"
      setRepresentativeNames([]);
      return {
        representatives: [],
        isEmpty: true
      };
    }

    // console.log(representatives);
    const representativeNames = representatives.map(rep => rep.name);
    // console.log(representativeNames);
    setRepresentativeNames(representativeNames);
    return {
      representatives,
      isEmpty: false
    };
  } catch (error) {
    console.error("Failed to initialize application:", error);
    throw error;
  }
}

async function checkCustomerListView(isEmpty) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const landingPage = new LandingPage(page);
    await landingPage.navigateToLogin();

    const loginPage = new LoginPage(page);
    await loginPage.login(config.LOGIN_EMAIL_FRONTEND, config.LOGIN_PASSWORD_FRONTEND);

    const viewCustomers = new ViewCustomers(page);
    
    let result;
    if (isEmpty) {
      result = await viewCustomers.checkEmptyCustomerList();
      console.log("Empty customer list check result:", result);
      if (result.noCustomersMessageVisible) {
        console.log("✅ Verification successful: 'Nenhum cliente encontrado' message is visible");
      } else {
        console.log("❌ Verification failed: 'Nenhum cliente encontrado' message is not visible");
      }
    } else {
      result = await viewCustomers.checkCustomerListElements();
      console.log("Customer list elements check result:", result);
      if (result.allElementsVisible) {
        console.log("✅ Verification successful: All customer data elements are visible");
      } else {
        console.log("❌ Verification failed: Some customer data elements are not visible");
        console.log("Missing elements:", Object.entries(result.elements)
          .filter(([_, data]) => !data.visible)
          .map(([key]) => key)
          .join(', '));
      }
    }

    return result;
  } catch (error) {
    console.error('An error occurred during view check:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function runTest(customerType, capacity) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const appState = await initializeApp();

    // Check if the system is empty and perform view test accordingly
    if (customerType === 'verificarLista') {
      await browser.close(); // Close the current browser before starting the view test
      return await checkCustomerListView(appState.isEmpty);
    }

    // Serviço de Teste de E-mail Desabilitado
    // Importante para verificar a consistência e tempo de 
    // Entrega do E-mail
    // if (customerType === 'pessoaFisica') {
    //   await EmailVerificationService.startVerification();
    // }

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
    console.log('Keeping main process alive for 3 minutes to allow monitoring for emails...');
    await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutes
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
    
    // if (EmailVerificationService.verificationInProgress) {
    //   await EmailVerificationService.stopVerification();
    // }
  }
}

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
        'escritorio',
        'verificarLista' // Added new option for checking customer list view
      ],
      demandOption: true
    },
    capacity: {
      description: 'Capacity for pessoaFisica',
      alias: 'c',
      type: 'string',
      default: 'random',
      coerce: (value) => {
        const validValues = ['random', 'Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz'];
        if (!validValues.includes(value)) {
          throw new Error(`Invalid capacity. Valid values are: ${validValues.join(', ')}`);
        }
        return value;
      }
    }
  })
  .strict() // This will enforce strict command checking
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('help', 'h')
  .parse();

// Add some debug logging
console.log('Parsed arguments:', argv);

if (argv._.includes('create')) {
  console.log(`Creating ${argv.type} with capacity: ${argv.capacity}`);
  runTest(argv.type, argv.capacity);
} else {
  console.log('Please specify a valid command and customer type.');
  yargs.showHelp();
}

module.exports = {
  initializeApp,
  runTest
};