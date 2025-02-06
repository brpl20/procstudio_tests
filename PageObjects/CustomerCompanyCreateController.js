// PageObjects/CustomerCompanyCreateController.js
const { findFillableFormElements } = require('../Helpers/formHelper');
const CustomerCompanyPage = require('./CustomerCompanyPage');

class CustomerCompanyCreateController {
  constructor(page) {
    this.page = page;
    this.customerCompanyPage = new CustomerCompanyPage(page);
  }

  async createCompanyCustomer() {
    console.log("Starting to create company customer");
    await this.customerCompanyPage.fillCustomerCompanyForm();
    // Additional steps for creating a company customer can be added here
  }

  async fillCompanyForm() {
    console.log("Filling company form");
    const fillableElements = await this.customerCompanyPage.findFillableElements();
    console.log("Fillable elements found:", fillableElements);
    
    // Here you can add logic to fill the form fields
    // For now, we'll just call checkAllFields
    await this.customerCompanyPage.checkAllFields();
  }
}

module.exports = CustomerCompanyCreateController;