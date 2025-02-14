// manual-test.js
const ApiRequests = require('./api-requests');

async function runTests() {
  try {
    // Ensure authentication
    await ApiRequests.ensureAuthenticated();
    console.log('Authentication successful');

    // Fetch profile customers
    console.log('Fetching profile customers...');
    const response = await ApiRequests.fetchProfileCustomers();
    
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Unexpected response format:', response);
      return;
    }

    const customers_data = response.data;
    console.log(`Total profile customers: ${customers_data.length}`);

    if (customers_data.length === 0) {
      console.log('No profile customers found.');
      return;
    }

    const lastCustomer = customers_data[customers_data.length - 1];
    
    console.log('\n--- Last Customer Details ---');
    console.log(JSON.stringify(lastCustomer, null, 2));

    // Extract necessary IDs
    const customerId = lastCustomer.id;
    // const representorId = lastCustomer.attributes.represent.representor_id;

    // Fetch specific customer
    console.log(`\nFetching specific customer (ID: ${customerId})...`);
    const specificCustomer = await ApiRequests.fetchSpecificCustomer(customerId);
    console.log('Specific Customer:', JSON.stringify(specificCustomer, null, 2));

    console.log(`\nFetching specific customer (ID: ${customerId})...`);
    const specificCustomerProfile = await ApiRequests.fetchProfileCustomer(customerId);
    console.log('Specific Customer:', JSON.stringify(specificCustomerProfile, null, 2));

    // Fetch representor's profile customer
    // console.log(`\nFetching representor's profile customer (ID: ${representorId})...`);
    // const representorProfileCustomer = await ApiRequests.fetchProfileCustomer(representorId);
    // console.log('Representor Profile Customer:', JSON.stringify(representorProfileCustomer, null, 2));

  } catch (error) {
    console.error('Error during tests:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

runTests();