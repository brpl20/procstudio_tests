// PageObjects/CustomerPageRepresentative.js
const { faker } = require('@faker-js/faker');
const { generateBirthDate, generateRG, generateCPF } = require('../utils');

class CustomerPageRepresentative {
  constructor(page) {
    this.page = page;
  }

  async createNewRepresentative() {
    console.log('Creating a new representative...');

    // Click the "Adicionar Representante" button
    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();

    // Wait for the modal to appear
    const modal = await this.page.locator('form').filter({ hasText: 'Dados do Representante' });
    await modal.waitFor({ state: 'visible' });

    await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(faker.person.lastName());
    await modal.getByPlaceholder('Informe o CPF').fill(generateCPF());
    await modal.getByPlaceholder('Informe o RG').fill(generateRG());

    const birthDateRepresentative = generateBirthDate(18, 90);
    await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDateRepresentative);

    // // Select dropdown options
    // await this.selectDropdownOption(modal, 'nationality', ['Brasileiro', 'Estrangeiro']);
    // await this.selectDropdownOption(modal, 'gender', ['Masculino', 'Feminino']);
    // await this.selectDropdownOption(modal, 'civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);

    await modal.getByPlaceholder('Informe a Profissão').fill(faker.person.jobTitle());

    await modal.getByPlaceholder('Informe o CEP').fill(faker.location.zipCode('#####-###'));
    await modal.getByPlaceholder('Informe o Bairro').fill(faker.location.county());
    await modal.getByPlaceholder('Informe o Endereço').fill(faker.location.streetAddress());
    await modal.getByPlaceholder('N.º').fill(faker.location.buildingNumber());
    await modal.getByPlaceholder('Informe a Cidade').fill(faker.location.city());
    await modal.getByPlaceholder('Informe o Complemento').fill('Apto ' + faker.location.buildingNumber());
    await modal.getByPlaceholder('Informe o Estado').fill(faker.location.state());

    await modal.getByPlaceholder('Informe o Telefone').fill(faker.phone.number('(##) #####-####'));
    await modal.getByPlaceholder('Informe o E-mail').fill(faker.internet.email());

    // Submit the form
    await modal.getByRole('button', { name: 'Salvar' }).click();

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
}

module.exports = CustomerPageRepresentative;