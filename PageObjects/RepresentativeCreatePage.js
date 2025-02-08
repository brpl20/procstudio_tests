// PageObjects/RepresentativeCreatePage.js
const { faker } = require('@faker-js/faker');
const fakerbr = require('faker-br');
const { generateBirthDate, generateRG } = require('../utils');
const { getRepresentativeNames } = require('../ApiRequests/representativeStore');

class RepresentativeCreatePage {
  constructor(page) {
    this.page = page;
  }

  async fillRepresentativeForm() {
    console.log('Navigating to /cadastrar?type=cliente/representante...');
    await this.page.goto('https://staging_adm.procstudio.com.br/cadastrar?type=cliente/representante');

    // Select a customer from the dropdown
    // await this.selectCustomerFromDropdown();

    // Fill out representative details
    await this.fillRepresentativeDetails();

    // Submit the form
    await this.submitForm();
  }

  async selectCustomerFromDropdown() {
    console.log('Selecting a customer from the dropdown...');
    const customerInput = await this.page.locator('#:r3o:');
    const representativeNames = getRepresentativeNames();
    const randomCustomer = this.getRandomItem(representativeNames);

    await customerInput.fill(randomCustomer);
    await this.page.waitForTimeout(500); // Wait for dropdown options to load
    await this.page.press('#:r3o:', 'Enter'); // Press Enter to select the option

    console.log(`Selected customer: ${randomCustomer}`);
  }

  async fillRepresentativeDetails() {
    console.log('Filling out representative details...');

    // Fill name
    const nameInput = await this.page.locator('#outlined-name');
    await nameInput.fill(faker.person.firstName());

    // Fill last_name
    const lastNameInput = await this.page.locator('#outlined-last_name');
    await lastNameInput.fill(faker.person.lastName());

    // Fill CPF
    const cpfInput = await this.page.locator('#outlined-CPF');
    await cpfInput.fill(fakerbr.br.cpf());

    // Fill RG
    const rgInput = await this.page.locator('#outlined-RG');
    await rgInput.fill(generateRG());

    // Fill birth date
    // const birthDateInput = await this.page.locator(':r6:');
    // const birthDate = generateBirthDate(18, 90);
    // await birthDateInput.fill(birthDate);

    // Fill nationality (dropdown)
    await this.selectDropdownOption('nationality', ['Brasileiro', 'Estrangeiro']);

    // Fill gender (dropdown)
    await this.selectDropdownOption('gender', ['Masculino', 'Feminino']);

    // Fill civil status (dropdown)
    await this.selectDropdownOption('civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);

    // Fill profession
    const professionInput = await this.page.locator('#outlined-profession');
    await professionInput.fill(faker.person.jobTitle());

    // Fill CEP
    const cepInput = await this.page.locator('#outlined-cep');
    await cepInput.fill(fakerbr.address.zipCodeValid());
    await this.page.waitForTimeout(3000); // Wait for API response

    // Fill address
    const streetInput = await this.page.locator('#outlined-street');
    await streetInput.fill(faker.location.streetAddress());

    // Fill number
    const numberInput = await this.page.locator('#outlined-number');
    await numberInput.fill(faker.location.buildingNumber());

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
  }

  async submitForm() {
    console.log('Submitting the representative form...');
    const saveButton = await this.page.getByRole('button', { name: 'Salvar' });
    await saveButton.click();
    await this.page.waitForTimeout(2000); // Wait for form submission
    console.log('Representative form submitted successfully!');
  }

  async selectDropdownOption(fieldName, options) {
    const randomOption = options[Math.floor(Math.random() * options.length)];
    console.log(`Selecting random option: ${randomOption} from ${fieldName} dropdown`);
    await this.page.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.waitForSelector('ul[role="listbox"]');
    await this.page.locator(`#menu-${fieldName} div`).filter({ hasText: randomOption }).click();
    console.log(`Selected ${fieldName}: ${randomOption}`);
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

module.exports = RepresentativeCreatePage;