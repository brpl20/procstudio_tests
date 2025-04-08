const ApiRequests = require('./api-requests');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Override config with environment variables
process.env.STAGING_API = 'http://localhost:3000';
process.env.LOGIN_EMAIL_BACKEND = 'adminfront@procstudio.com.br';
process.env.LOGIN_PASSWORD_BACKEND = '123456';

async function runWorksTest() {
  try {
    // Ensure authentication
    await ApiRequests.ensureAuthenticated();
    console.log('Authentication successful');

    // Fetch works
    console.log('Fetching works...');
    const response = await ApiRequests.fetchWorks();
    
    // Display works data
    console.log(`Total works found: ${response.length}`);
    
    // Display some details about each work
    if (response.length > 0) {
      console.log('\nWorks details:');
      response.forEach((work, index) => {
        console.log(`\nWork #${index + 1}:`);
        console.log(`ID: ${work.id || 'N/A'}`);
        console.log(`Title: ${work.title || work.name || 'N/A'}`);
        console.log(`Status: ${work.status || 'N/A'}`);
        // Add more fields as needed based on your API response structure
      });
    } else {
      console.log('No works found.');
    }

    return response;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
runWorksTest()
  .then(() => console.log('Works test completed successfully'))
  .catch(error => console.error('Works test failed:', error))
  .finally(() => console.log('Test execution finished'));
