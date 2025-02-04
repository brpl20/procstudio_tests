// PageObjects/CustomerPage.js
const { faker, generateRandomItem, generateBirthDate, generateRG } = require('../utils');
const fakerbr = require('faker-br');
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

async selectCapacityDropdownOption() {
  const options = ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz'];
  const randomOption = options[Math.floor(Math.random() * options.length)];
  console.log(`Selecting random capacity option: ${randomOption}`);

  await this.page.locator('#mui-component-select-capacity').click();
  // await modal.locator('#outlined-email').fill(faker.internet.email()); 

  console.log('Clicked capacity dropdown');

  // Wait for the options to be visible
  await this.page.waitForSelector('ul[role="listbox"]');
  console.log('Listbox is visible');

  // Find the specific option and click it
  // Use a more specific selector to avoid ambiguity
  const option = this.page.locator('li[role="option"]').filter({ hasText: new RegExp(`^${randomOption}$`) });
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
    await this.page.fill('input[name="cpf"]', fakerbr.br.cpf());

    await this.selectDropdownOption('nationality', ['Brasileiro', 'Estrangeiro']);
    await this.page.getByRole('textbox', { name: 'DD/MM/YYYY' }).fill(generateBirthDate());
    await this.selectDropdownOption('gender', ['Masculino', 'Feminino']);
    await this.selectDropdownOption('civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);    
    const selectedCapacity = await this.selectCapacityDropdownOption();
    console.log(`Selected capacity: ${selectedCapacity}`);

    // TD: CleanUP This code
    // TD: Add Logic to follow along without representative
    // TD: Finish Representative Lógic

    // await this.locator('#outlined-email').fill(faker.internet.email()); 

    // const capacity = await this.selectDropdownOption('capacity', ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz']);
    // await this.page.locator('mui-component-select-capacity').fill(faker.internet.email()); 
    // console.log(capacity);
    
    
    if (selectedCapacity !== 'Capaz') {
      console.log('Adding a representative...');
      await this.representativePage.createNewRepresentative();
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


  async submitForm() {
    await this.page.click('#submit_button_id');
    await this.page.waitForTimeout(5000);
  }
}

module.exports = CustomerPage;