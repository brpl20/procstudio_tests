// PageObjects/CustomerFinalVerify.js
const CustomerDataStore = require('../Helpers/CustomerDataStore');
const CustomerBackendValidator = require('../Helpers/CustomerBackendValidator');

class CustomerFinalVerify {
  async compareWithBackend() {
    const comparisonResults = await CustomerBackendValidator.validateCustomerData();
    
    const summary = {
      matchedFields: [],
      mismatchedFields: [],
      allFieldsMatch: true
    };

    for (const [field, result] of Object.entries(comparisonResults)) {
      if (result.match) {
        summary.matchedFields.push(field);
      } else {
        summary.mismatchedFields.push({
          field,
          frontend: result.frontend,
          backend: result.backend
        });
        summary.allFieldsMatch = false;
      }
    }

    console.log('Comparison Results:');
    console.log(JSON.stringify(comparisonResults, null, 2));

    console.log('Summary:');
    console.log(JSON.stringify(summary, null, 2));

    return {
      detailedComparison: comparisonResults,
      summary: summary
    };
  }

  async verifyCustomerData() {
    const comparisonResult = await this.compareWithBackend();
    
    if (comparisonResult.summary.allFieldsMatch) {
      console.log("All customer data fields match between frontend and backend.");
    } else {
      console.log("Mismatches found in customer data:");
      comparisonResult.summary.mismatchedFields.forEach(mismatch => {
        console.log(`Field: ${mismatch.field}`);
        console.log(`  Frontend value: ${mismatch.frontend}`);
        console.log(`  Backend value: ${mismatch.backend}`);
      });
    }

    console.log('Frontend Data:');
    console.log(JSON.stringify(CustomerDataStore.getAll(), null, 2));

    return comparisonResult;
  }
}

module.exports = new CustomerFinalVerify();