// Helpers/CustomerBackendValidator.js
const apiRequests = require('../ApiRequests/api-requests');
const CustomerDataStore = require('./CustomerDataStore');

class CustomerBackendValidator {
  async validateCustomerData() {
    const frontendData = CustomerDataStore.getAll();
    console.log("FRONTENDDDDDD")
    console.log(frontendData);

    console.log("BACKEND")
    const customers = await apiRequests.fetchProfileCustomers();
    const customers_data = customers.data;
    const lastCustomer = customers_data[customers_data.length - 1];
    console.log(customers_data)
    console.log("------")
    console.log("lastCustomer")

    console.log('Frontend Data:');
    console.log(JSON.stringify(frontendData, null, 2));

    console.log('Backend Data (Last Customer):');
    console.log(JSON.stringify(lastCustomer, null, 2));

    const comparisonResults = {};

    for (const [key, value] of Object.entries(frontendData)) {
      comparisonResults[key] = {
        frontend: value,
        backend: lastCustomer[key],
        match: value === lastCustomer[key]
      };
    }

    return comparisonResults;
  }
}

module.exports = new CustomerBackendValidator();