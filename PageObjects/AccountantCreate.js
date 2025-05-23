// PageObjects/AccountantCreate.js
const { customFaker } = require('../Utils/utils');

class AccountantCreate {
  constructor(page) {
    this.page = page;
  }

  async fillAccountantDetails() {
    // Fill Accountant ID
    const accountantIdInput = await this.page.locator('#outlined-accountant_id');
    await accountantIdInput.fill(Math.floor(1000 + Math.random() * 9000).toString());

    // Generate full name
    const fullName = customFaker.generateFullName();
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    // Fill Name
    const nameInput = await this.page.locator('#outlined-name');
    await nameInput.fill(firstName);

    // Fill Last Name
    const lastNameInput = await this.page.locator('#outlined-last_name');
    await lastNameInput.fill(lastName);

    // Fill Phone Number
    const phoneNumberInput = await this.page.locator('#outlined-phone_number');
    await phoneNumberInput.fill(customFaker.generatePhoneNumber(false, false)); // sem prefixo e sem máscara

    // Fill Email
    const emailInput = await this.page.locator('#outlined-email');
    await emailInput.fill(customFaker.generateEmail(firstName));

    // Click Save button
    await this.page.getByRole('button', { name: 'Salvar' }).click();
  }
}

module.exports = AccountantCreate;