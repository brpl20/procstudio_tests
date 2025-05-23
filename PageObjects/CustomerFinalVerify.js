// PageObjects/CustomerFinalVerify.js
const CustomerDataStore = require('../Helpers/CustomerDataStore');
const CustomerBackendValidator = require('../Helpers/CustomerBackendValidator');

class CustomerFinalVerify {
  async compareWithBackend() {
    try {
      const comparisonResults = await CustomerBackendValidator.validateCustomerData();
      
      const summary = {
        mismatchedFields: [],
        allFieldsMatch: true
      };

      // Only collect mismatched fields
      for (const [field, result] of Object.entries(comparisonResults)) {
        if (!result.match) {
          summary.mismatchedFields.push({
            field,
            frontend: result.frontend,
            backend: result.backend
          });
          summary.allFieldsMatch = false;
        }
      }

      // Log full results to file but don't console.log them
      return {
        detailedComparison: comparisonResults,
        summary: summary
      };
    } catch (error) {
      console.error('Error during comparison:', error);
      throw error;
    }
  }

  async verifyCustomerData() {
    try {
      const comparisonResult = await this.compareWithBackend();
      
      // Only show results if there are mismatches
      if (comparisonResult.summary.allFieldsMatch) {
        console.log("\n✅ All customer data fields match between frontend and backend.");
      } else {
        console.log("\n❌ Mismatches found in customer data:");
        console.log("----------------------------------------");
        
        comparisonResult.summary.mismatchedFields.forEach(mismatch => {
          console.log(`\nField: ${this.formatFieldName(mismatch.field)}`);
          console.log(`Frontend: ${mismatch.frontend || 'undefined'}`);
          console.log(`Backend:  ${mismatch.backend || 'undefined'}`);
          console.log("----------------------------------------");
        });

        console.log(`\nTotal mismatches found: ${comparisonResult.summary.mismatchedFields.length}`);
      }

      return comparisonResult;
    } catch (error) {
      console.error('Error during verification:', error);
      throw error;
    }
  }

  // Helper method to format field names for better readability
  formatFieldName(field) {
    return field
      // Split on capital letters and underscores
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      // Capitalize first letter and rest of the words
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
}

module.exports = new CustomerFinalVerify();