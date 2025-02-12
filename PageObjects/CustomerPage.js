// PageObjects/CustomerPage.js
const { faker, fakerbr, generateRandomItem, generateRG, generateBirthDate, selectRandomItemFromOptions } = require('../utils');
const CustomerPageRepresentative = require('./CustomerPageRepresentative');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerPage {
  constructor(page) {
    this.page = page;
    this.representativePage = new CustomerPageRepresentative(page);
  }
  
  // Method for selection dropdowns
  async selectDropdownOption(fieldName, options) {
    // Select a random option from the array got by api 
    const randomOption = this.selectRandomItemFromOptions(options);
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

    return randomOption;
}

// Method for selection dropdowns of capacity
async selectCapacityDropdownOption(capacity = null) {
  const options = ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz'];

  // Use the provided capacity or select a random one if not provided
  console.log(capacity)
  const selectedOption = capacity || await selectRandomItemFromOptions(options);
  console.log(`Selecting capacity option: ${selectedOption}`);

  // Select Capacity DropDown
  await this.page.locator('#mui-component-select-capacity').click();
  console.log('Clicked capacity dropdown');

  // Wait for the options to be visible
  await this.page.waitForSelector('ul[role="listbox"]');
  console.log('Listbox is visible');

  // Find the specific option and click it
  const option = this.page.locator('li[role="option"]').filter({ hasText: new RegExp(`^${selectedOption}$`) });
  await option.click();
  console.log(`Clicked option: ${selectedOption}`);

  // Wait for the dropdown to close
  await this.page.waitForTimeout(500);
  console.log('Waited for dropdown to close');

  return selectedOption;
}

  async fillCustomerForm() {
    // Generators
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const rg = generateRG();
    const cpf = fakerbr.br.cpf();
    const birthDate = generateBirthDate();

    // Text Fields Fills 
    await this.page.fill('input[name="name"]', firstName);
    await this.page.fill('input[name="last_name"]', lastName);
    await this.page.fill('input[name="rg"]', rg);
    await this.page.fill('input[name="cpf"]', cpf);
    
    // DropDowns and Special Fields
    await this.page.getByRole('textbox', { name: 'DD/MM/YYYY' }).fill(birthDate); 
    const nationality = await this.selectDropdownOption('nationality', ['Brasileiro', 'Estrangeiro']);
    const gender = await this.selectDropdownOption('gender', ['Masculino', 'Feminino']);
    const civilStatus = await this.selectDropdownOption('civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);

    // Store Data for Backend and Document Checking
    // TD: Keep the method with the remaining fields
    CustomerDataStore.set('firstName', firstName);
    CustomerDataStore.set('lastName', lastName);
    CustomerDataStore.set('rg', rg);
    CustomerDataStore.set('cpf', cpf);
    CustomerDataStore.set('nationality', nationality);
    CustomerDataStore.set('gender', gender);
    CustomerDataStore.set('civilStatus', civilStatus);
    CustomerDataStore.set('birthDate', birthDate);

    const selectedCapacity = await this.selectCapacityDropdownOption();
    console.log(`Selected capacity: ${selectedCapacity}`);

    if (selectedCapacity !== 'Capaz') {
      console.log('Adding a representative...');
      await this.representativePage.createNewRepresentative()
      // Remover quando o proprio representante for criado e escolhido automaticamente
      await this.representativePage.selectExistingRepresentative();
      await this.page.getByRole('button', { name: 'Próximo' }).click();
    } else {
      await this.page.getByRole('button', { name: 'Próximo' }).click();
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

}

module.exports = CustomerPage;