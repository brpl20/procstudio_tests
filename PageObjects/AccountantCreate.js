// PageObjects/AccountantCreate.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

class AccountantCreate {
  constructor(page) {
    this.page = page;
  }

  async fillAccountantDetails() {
    // Fill Accountant ID
    const accountantIdInput = await this.page.locator('#outlined-accountant_id');
    await accountantIdInput.fill(faker.number.int({ min: 1000, max: 9999 }).toString());

    // Fill Name
    const nameInput = await this.page.locator('#outlined-name');
    await nameInput.fill(faker.person.firstName());

    // Fill Last Name
    const lastNameInput = await this.page.locator('#outlined-last_name');
    await lastNameInput.fill(faker.person.lastName());

    // Fill Phone Number
    const phoneNumberInput = await this.page.locator('#outlined-phone_number');
    await phoneNumberInput.fill(faker.phone.number());

    // Fill Email
    const emailInput = await this.page.locator('#outlined-email');
    await emailInput.fill(faker.internet.email());

    // Click Save button
    await this.page.getByRole('button', { name: 'Salvar' }).click();
  }
}

module.exports = AccountantCreate;