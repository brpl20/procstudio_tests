// PageObjects/CustomerCompanyPage.js
const { faker, fakerbr } = require('../utils');
const { findFillableFormElements } = require('../Helpers/formHelper');
const CustomerPageRepresentative = require('./CustomerPageRepresentative');

class CustomerCompanyPage {
  constructor(page) {
    this.page = page;
    this.representativePage = new CustomerPageRepresentative(page);
  }

  async fillCustomerCompanyForm() {
    // Fill text inputs
    await this.page.fill('input[name="name"]', faker.company.name());
    await this.page.fill('input[name="cnpj"]', fakerbr.br.cnpj());
    await this.page.fill('input[name="zip_code"]', faker.location.zipCode('#####-###'));
    await this.page.fill('input[name="street"]', faker.location.street());
    await this.page.fill('input[name="number"]', faker.number.int({ min: 1, max: 9999 }).toString());
    await this.page.fill('input[name="description"]', faker.lorem.sentence());
    await this.page.fill('input[name="neighborhood"]', faker.location.county());
    await this.page.fill('input[name="city"]', faker.location.city());
    await this.page.fill('input[name="state"]', faker.location.state());

    console.log('Customer Company form filled successfully');

    // Click the 'Next' button after filling the form
    await this.page.getByRole('button', { name: 'Próximo' }).click();
    console.log('Clicked Next button');
    console.log('Adding a representative...');
    await this.representativePage.createNewRepresentative()
    await this.page.waitForTimeout(2000);
    await this.representativePage.selectExistingRepresentativeCompany();
    await this.page.waitForTimeout(2000);
    await this.page.getByRole('button', { name: 'Próximo' }).click();
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


}

module.exports = CustomerCompanyPage;
  // Testing Form Suit 
  // async initialize() {
  //   console.log("Initializing CustomerCompanyPage");
  //   await this.findFillableElements();
  // }

  // async findFillableElements() {
  //   console.log("Finding fillable elements on CustomerCompanyPage");
  //   this.formElements = await findFillableFormElements(this.page);
  //   console.log("Form elements found:", JSON.stringify(this.formElements, null, 2));
  //   return this.formElements;
  // }

  // async checkAllFields() {
  //   console.log("Checking all fields on CustomerCompanyPage");
  //   console.log("Form elements to check:", JSON.stringify(this.formElements, null, 2));
  //   // Implement your checking logic here
  // }