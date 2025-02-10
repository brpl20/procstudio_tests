// PageObjects/CustomerCreateController.js
const CustomerPage = require('./CustomerPage');
const CustomerPageAddress = require('./CustomerPageAddress');
const CustomerContactPage = require('./CustomerContactPage');
const CustomerBankDetails = require('./CustomerBankDetails');
const CustomerAdditionalInfoPage = require('./CustomerAdditionalInfoPage');
const CustomerFinalPage = require('./CustomerFinalPage');

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

  async createCustomer(capacity=null) {
    await this.fillCustomerForm(capacity);
    await this.fillCustomerAddress();
    await this.fillContactInfo();
    await this.fillBankDetails();
    await this.fillAdditionalInfo();
    await this.completeFinalStep();
  }

  async fillCustomerForm() {
    await this.page.waitForTimeout(1000);
    await this.customerPage.fillCustomerForm();
  }

  async fillCustomerAddress() {
    await this.customerPageAddress.fillCustomerAddress();
  }

  async fillContactInfo() {
    await this.customerContactPage.fillContactInfo();
    await this.customerContactPage.clickNextButton();
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