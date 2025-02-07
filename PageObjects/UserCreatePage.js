// PageObjects/UserCreatePage.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

class UserCreatePage {
  constructor(page) {
    this.page = page;
  }

  async fillUserForm() {
    // Fill name
    const nameInput = await this.page.locator('#outlined-name');
    await nameInput.fill(faker.person.firstName());

    // Fill last_name
    const lastNameInput = await this.page.locator('#outlined-last_name');
    await lastNameInput.fill(faker.person.lastName());

    // Fill CPF
    const cpfInput = await this.page.locator('#outlined-cpf');
    await cpfInput.fill(fakerbr.br.cpf());

    // Fill RG
    const rgInput = await this.page.locator('#outlined-rg');
    await rgInput.fill(fakerbr.br.rg());

    // Fill mother_name
    const motherNameInput = await this.page.locator('#outlined-mother_name');
    await motherNameInput.fill(faker.person.fullName());

    // Fill CEP
    const cepInput = await this.page.locator('#outlined-cep');
    await cepInput.fill(fakerbr.address.zipCodeValid());
    await this.page.waitForTimeout(3000); // Wait for API response

    // Fill address
    const addressInput = await this.page.locator('#outlined-address');
    await addressInput.fill(faker.location.streetAddress());

    // Fill number
    const numberInput = await this.page.locator('#outlined-number');
    await numberInput.fill(faker.number.int({ min: 1, max: 9999 }).toString());

    // Fill description (complemento)
    const descriptionInput = await this.page.locator('#outlined-description');
    await descriptionInput.fill(faker.lorem.words(2));

    // Fill neighborhood
    const neighborhoodInput = await this.page.locator('#outlined-neighborhood');
    await neighborhoodInput.fill(faker.location.county());

    // Fill city
    const cityInput = await this.page.locator('#outlined-city');
    await cityInput.fill(faker.location.city());

    // Fill state
    const stateInput = await this.page.locator('#outlined-state');
    await stateInput.fill(faker.location.state());

    // Fill phone
    const phoneInput = await this.page.locator('#outlined-phone');
    await phoneInput.fill(faker.phone.number());

    // Fill email
    const emailInput = await this.page.locator('#outlined-email');
    await emailInput.fill(faker.internet.email());

    // Fill OAB
    const oabInput = await this.page.locator('#outlined-oab');
    await oabInput.fill(faker.string.numeric(6));

    // Fill agency
    const agencyInput = await this.page.locator('#outlined-agency');
    await agencyInput.fill(faker.finance.accountNumber());

    // Fill account
    const accountInput = await this.page.locator('#outlined-account');
    await accountInput.fill(faker.finance.accountNumber());

    // Fill PIX
    const pixInput = await this.page.locator('#outlined-pix');
    await pixInput.fill(faker.finance.iban());

    // Fill user email
    const userEmailInput = await this.page.locator('#outlined-userEmail');
    await userEmailInput.fill(faker.internet.email());

    // Fill password
    const passwordInput = await this.page.locator(':ru:');
    await passwordInput.fill(faker.internet.password());

    // Fill confirm password
    const confirmPasswordInput = await this.page.locator(':rv:');
    await confirmPasswordInput.fill(faker.internet.password());

    // Click Save button
    await this.page.getByRole('button', { name: 'Salvar' }).click();
  }
}

module.exports = UserCreatePage;