// PageObjects/CustomerPage.js
const { faker, generateRandomItem, generateBirthDate, generateRG, generateCPF } = require('../utils');

class CustomerPage {
  constructor(page) {
    this.page = page;
  }

  async fillCustomerForm() {
    await this.page.fill('input[name="name"]', faker.person.firstName());
    await this.page.fill('input[name="last_name"]', faker.person.lastName());
    await this.page.fill('input[name="rg"]', generateRG());
    await this.page.fill('input[name="cpf"]', generateCPF());

    await this.selectDropdownOption('nationality', ['Brasileiro', 'Estrangeiro']);
    await this.page.getByRole('textbox', { name: 'DD/MM/YYYY' }).fill(generateBirthDate());
    await this.selectDropdownOption('gender', ['Masculino', 'Feminino']);
    await this.selectDropdownOption('civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);
    await this.selectDropdownOption('capacity', ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz']);
  }

  async selectDropdownOption(fieldName, options) {
    const randomOption = generateRandomItem(options);
    await this.page.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.getByRole('option', { name: randomOption }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected ${fieldName}: ${randomOption}`);
    return randomOption;
  }

  async submitForm() {
    await this.page.click('#submit_button_id');
    await this.page.waitForTimeout(5000);
  }
}

module.exports = CustomerPage;