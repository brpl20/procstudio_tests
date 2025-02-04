// PageObjects/CustomerPageRepresentative.js
const { faker } = require('@faker-js/faker');
const fakerbr = require('faker-br');
const { generateBirthDate, generateRG } = require('../utils');
const { getRepresentativeNames } = require('../ApiRequests/representativeStore');

class CustomerPageRepresentative {
  constructor(page) {
    this.page = page;
  }

  async selectOrCreateRepresentative() {
    const random = Math.random();
    const representativeNames = getRepresentativeNames();
    console.log(representativeNames.length)
    if (random < 0.95 && representativeNames.length > 0) {
      await this.selectExistingRepresentative();
    } else {
      await this.createNewRepresentative();
    }
  }

  async selectExistingRepresentative() {
    console.log('Selecting an existing representative...');
    const representativeNames = getRepresentativeNames();
    const randomName = this.getRandomItem(representativeNames);
    
    await this.page.fill('#multiple-limit-tags', randomName);
    await this.page.press('#multiple-limit-tags', 'Enter');
    
    await this.page.waitForSelector(`[role="option"]:has-text("${randomName}")`);
    await this.page.click(`[role="option"]:has-text("${randomName}")`);
    
    const openButton = await this.page.$('button:has-text("Open")');
    if (openButton) {
      await openButton.click();
    }
    
    await this.page.click('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root');
    
    console.log(`Selected existing representative: ${randomName}`);
  }

  async createNewRepresentative() {
    console.log('Creating a new representative...');
    
    // Click the "Adicionar Representante" button
    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();
    
    // Wait for the modal to appear
    const modal = await this.page.locator('form').filter({ hasText: 'Dados do Representante' });
    await modal.waitFor({ state: 'visible' });
    await modal.getByPlaceholder('Informe o Nome do Representante').fill(faker.person.firstName());
    await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(faker.person.lastName());
    await modal.getByPlaceholder('Informe o CPF').fill(fakerbr.br.cpf());
    await modal.getByPlaceholder('Informe o RG').fill(generateRG());
    const birthDateRepresentative = generateBirthDate(18, 90);
    await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDateRepresentative);
    await modal.getByPlaceholder('N.º').fill(faker.location.buildingNumber());
    await modal.locator('#outlined-city').fill(faker.location.city());
    await modal.locator('#outlined-neighborhood').fill(faker.location.county());
    await modal.locator('#outlined-street').fill(faker.location.streetAddress());
    await modal.locator('#outlined-description').fill(faker.lorem.words(3));
    await modal.locator('#outlined-state').fill(faker.location.state());
    await modal.locator('#outlined-profession').fill(faker.person.jobTitle());
    await modal.getByPlaceholder('Informe o CEP').fill(fakerbr.address.zipCodeValid());
    await modal.locator('#outlined-phone').fill(faker.string.numeric(10));
    await modal.locator('#outlined-email').fill(faker.internet.email()); 

    // Dropdowns
    await this.selectDropdownOption(modal, 'nationality', ['Brasileiro', 'Estrangeiro']);
    await this.selectDropdownOption(modal, 'gender', ['Masculino', 'Feminino']);
    await this.selectDropdownOption(modal, 'civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);

    // Wait for the modal to close
    await this.page.waitForSelector('form:has-text("Dados do Representante")', { state: 'hidden' });

    console.log('Representative created successfully');
  }

  async selectDropdownOption(container, fieldName, options) {
    const randomOption = options[Math.floor(Math.random() * options.length)];
    console.log(`Selecting random option: ${randomOption} from ${fieldName} dropdown`);

    await container.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.waitForSelector('ul[role="listbox"]');
    await this.page.locator(`#menu-${fieldName} div`).filter({ hasText: randomOption }).click();

    console.log(`Selected ${fieldName}: ${randomOption}`);
    return randomOption;
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = CustomerPageRepresentative;