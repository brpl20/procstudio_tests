// PageObjects/CustomerPage.js
const { faker, generateRandomItem, generateBirthDate, generateRG, generateCPF } = require('../utils');
const CustomerPageRepresentative = require('./CustomerPageRepresentative');

class CustomerPage {
  constructor(page) {
    this.page = page;
    this.representativePage = new CustomerPageRepresentative(page);
  }

  async selectDropdownOption(fieldName, options) {
    // Select a random option from the array
    const randomOption = options[Math.floor(Math.random() * options.length)];
    console.log(`Selecting random option: ${randomOption} from ${fieldName} dropdown`);

    // Find the form or container for the representative
    const formContainer = await this.page.locator('form').filter({ hasText: 'Adicionar Representante' });

    // Click the dropdown to open it within the form container
    await formContainer.locator(`[id^="mui-component-select-${fieldName}"]`).click();
    console.log('Clicked dropdown');

    // Wait for the options to be visible
    await this.page.waitForSelector('ul[role="listbox"]');
    console.log('Listbox is visible');

    // Find the specific option and click it
    const option = this.page.locator('li[role="option"]').filter({ hasText: randomOption });
    await option.click();
    console.log(`Clicked option: ${randomOption}`);

    // Wait for the dropdown to close
    await this.page.waitForTimeout(500);
    console.log('Waited for dropdown to close');

    return randomOption; // Return the selected option
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
    const capacity = await this.selectDropdownOption('capacity', ['Relativamente Incapaz', 'Absolutamente Incapaz']);
    // const capacity = await this.selectDropdownOption('capacity', 'Capaz');
    // const capacity = await this.selectDropdownOption('capacity', ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz']);
    
    if (capacity !== 'Capaz') {
      console.log('Adding a representative...');
      await this.addRepresentative();
    }
  }

  async selectDropdownOption(fieldName, options) {
    const randomOption = generateRandomItem(options);
    await this.page.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.getByRole('option', { name: randomOption }).click();
    await this.page.waitForTimeout(1000);
    console.log(`Selected ${fieldName}: ${randomOption}`);
    return randomOption;
  }

  async addRepresentative() {
    await this.representativePage.createNewRepresentative();
  }

  async submitForm() {
    await this.page.click('#submit_button_id');
    await this.page.waitForTimeout(5000);
  }
}

module.exports = CustomerPage;