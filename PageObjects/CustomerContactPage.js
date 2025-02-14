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

  
  async handleAddButtons() {
    try {
      // Locate and click the "add-phone" button
      const addPhoneButton = await this.page.locator('#add-phone');
      if (await addPhoneButton.isVisible()) {
        await addPhoneButton.click();
        console.log('"add-phone" button clicked');
      } else {
        console.log('"add-phone" button not found');
      }

      // Locate and click the "add-email" button
      const addEmailButton = await this.page.locator('#add-email');
      if (await addEmailButton.isVisible()) {
        console.log('"add email found"'); // Log message for debugging
        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for 5 seconds
        await addEmailButton.click();
        console.log('"add-email" button clicked');
      } else {
        console.log('"add-email" button not found');
      }
    } catch (error) {
      console.error('Error while handling add buttons:', error);
    }
  }
}

module.exports = CustomerContactPage;