// PageObjects/CustomerCreateController.js
const CustomerPage = require('../PageObjects/CustomerPage');
const CustomerPageAddress = require('../PageObjects/CustomerPageAddress');
const CustomerContactPage = require('../PageObjects/CustomerContactPage');
const CustomerBankDetails = require('../PageObjects/CustomerBankDetails');
const CustomerAdditionalInfoPage = require('../PageObjects/CustomerAdditionalInfoPage');
const CustomerFinalPage = require('../PageObjects/CustomerFinalPage');
const CustomerFinalVerify = require('../PageObjects/CustomerFinalVerify');


class CustomerCreateController {
  constructor(page) {
    this.page = page;
    this.customerPage = new CustomerPage(page);
    this.customerPageAddress = new CustomerPageAddress(page);
    this.customerContactPage = new CustomerContactPage(page);
    this.customerBankDetails = new CustomerBankDetails(page);
    this.customerAdditionalInfo = new CustomerAdditionalInfoPage(page);
    this.customerFinal = new CustomerFinalPage(page);
  }

  async createCustomer(capacity) {
    await this.fillCustomerForm(capacity);
    await this.fillCustomerAddress();
    await this.fillContactInfo();
    await this.fillBankDetails();
    await this.fillAdditionalInfo();
    await this.completeFinalStep();

    // Verification Methods
    console.log('Starting final verification...');
    const verificationResult = await CustomerFinalVerify.verifyCustomerData();
    console.log('Final verification completed.');
    console.log('Verification Result:', JSON.stringify(verificationResult, null, 2));

    return verificationResult;
  }

  async fillCustomerForm(capacity) {
    await this.page.waitForTimeout(1000);
    await this.customerPage.fillCustomerForm(capacity);
  }

  async fillCustomerAddress() {
    await this.customerPageAddress.fillCustomerAddress();
  }

  async fillContactInfo() {
    await this.customerContactPage.fillContactInfo();
    await this.customerContactPage.handleAddButtons();
  }

  async fillBankDetails() {
    await this.customerBankDetails.fillBankDetails();
  }

  async fillAdditionalInfo() {
    await this.customerAdditionalInfo.fillAdditionalInfo();
  }

  async completeFinalStep() {
    await this.customerFinal.completeFinalStep();
  }
}

module.exports = CustomerCreateController;