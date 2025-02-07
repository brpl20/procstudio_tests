// PageObjects/OfficeCreatePage.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

class OfficeCreatePage {
  constructor(page) {
    this.page = page;
  }

  async fillOfficeForm() {
    await this.page.goto('https://staging_adm.procstudio.com.br/cadastrar?type=escritorio');
    // Fill name
    const nameInput = await this.page.locator('#outlined-name');
    await nameInput.fill(faker.company.name());

    // Fill OAB
    const oabInput = await this.page.locator('#outlined-oab');
    await oabInput.fill(faker.string.numeric(6));

    // Fill CNPJ/CPF
    const cnpjCpfInput = await this.page.locator('#outlined-cnpj_cpf');
    await cnpjCpfInput.fill(fakerbr.br.cnpj());

    // Fill agency
    const agencyInput = await this.page.locator('#outlined-agency');
    await agencyInput.fill(faker.finance.accountNumber());

    // Fill operation
    const operationInput = await this.page.locator('#outlined-operation');
    await operationInput.fill(faker.finance.accountNumber());

    // Fill account
    const accountInput = await this.page.locator('#outlined-acccount');
    await accountInput.fill(faker.finance.accountNumber());

    // Fill PIX
    const pixInput = await this.page.locator('#outlined-pix');
    await pixInput.fill(faker.finance.iban());

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

    // Fill website
    const websiteInput = await this.page.locator('#outlined-webSite');
    await websiteInput.fill(faker.internet.url());

    // Click Save button
    await this.page.getByRole('button', { name: 'Salvar' }).click();
  }
}

module.exports = OfficeCreatePage;