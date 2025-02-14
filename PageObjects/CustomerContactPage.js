// PageObjects/CustomerContactPage.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerContactPage {
  constructor(page) {
    this.page = page;
  }

  async fillContactInfo() {
    // Generate and fill phone number
    const phoneNumber = customFaker.generateCellPhoneNumber();
    const phoneInput = await this.page.locator('input[name="phone_number"]');
    await phoneInput.fill(phoneNumber);
    CustomerDataStore.set('phoneNumber', phoneNumber);

    // Generate and fill email
    const email = customFaker.generateEmail();
    const emailInput = await this.page.locator('input[name="email"]');
    await emailInput.fill(email);
    CustomerDataStore.set('email', email);

    // Click Próximo button
    await this.page.getByRole('button', { name: 'Próximo' }).click();

    // Prepare data for verification
    const frontendData = {
      phoneNumber,
      email
    };

    return frontendData;
  }
}

module.exports = CustomerContactPage;