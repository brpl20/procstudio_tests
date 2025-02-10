// Helpers/CustomerBackendValidator.js
const ApiRequests = require('../ApiRequests/api-requests');
const CustomerDataStore = require('./CustomerDataStore');

class CustomerBackendValidator {
  async validateCustomerData() {
    const frontendData = CustomerDataStore.getAll();
    const customers = await ApiRequests.fetchCustomers();
    const lastCustomer = customers[customers.length - 1];

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