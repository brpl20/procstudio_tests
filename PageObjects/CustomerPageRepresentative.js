// PageObjects/CustomerPageRepresentative.js
const { faker, fakerbr, generateRG, generateRandomItem, generateBirthDate, selectRandomItemFromOptions } = require('../utils');
const { getRepresentativeNames } = require('../ApiRequests/representativeStore');
const { findFillableFormElements } = require('../Helpers/formHelper');


class CustomerPageRepresentative {
  constructor(page) {
    this.page = page;
  }

  async selectOrCreateRepresentative() {
    const random = Math.random();
    const representativeNames = getRepresentativeNames();
    console.log(representativeNames.length)
    if (random < 0.50 && representativeNames.length > 0) {
      await this.selectExistingRepresentative();
    } else {
      await this.createNewRepresentative();
    }
  }

  async selectExistingRepresentative() {
    console.log('Selecting an existing representative...');
    const representativeNames = getRepresentativeNames();
    console.log("Teste ==>");
    console.log(representativeNames);
    const randomName = this.getRandomItem(representativeNames);
    console.log(randomName);
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

    // TD: Fix Select Representative for Company
    // TD: Selectors not working
    // 
    // Company: <input aria-invalid="false" autocomplete="off" id=":r5g:" placeholder="Selecione um Representante" type="text" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd MuiAutocomplete-input MuiAutocomplete-inputFocused mui-style-b52kj1" aria-autocomplete="list" aria-expanded="false" autocapitalize="none" spellcheck="false" role="combobox" value=""></input>
    // Person:  <input aria-invalid="true" autocomplete="off" id="multiple-limit-tags" placeholder="Informe o Representante" type="text" class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd MuiAutocomplete-input MuiAutocomplete-inputFocused mui-style-b52kj1" aria-autocomplete="list" aria-expanded="false" autocapitalize="none" spellcheck="false" role="combobox" value=""></input>
  async selectExistingRepresentativeCompany() {
    console.log('Selecting an existing representative company...');
    const representativeNames = getRepresentativeNames();
    const randomName = this.getRandomItem(representativeNames);
    console.log(randomName);

    const inputSelector = await this.page.getByRole('combobox', { name: 'Selecione um Representante' }).click();
    const isInputVisible = await this.page.isVisible(inputSelector);
    if (!isInputVisible) {
      throw new Error(`Input selector ${inputSelector} is not visible`);
    }
    // Wait for the input field to be visible and interactable
    // await this.page.waitForSelector(inputSelector, { state: 'visible' });
  
    // // Click the input field to focus it
    // await this.page.click(inputSelector);
  
    // Type the random name into the input field
    await this.page.fill(inputSelector, randomName);
  
    // Wait a moment for the dropdown to appear
    await this.page.waitForTimeout(500);
  
    // Press Enter to submit the input
    await this.page.press(inputSelector, 'Enter');
  
    // Wait for and click the option with the random name
    const optionSelector = `[role="option"]:has-text("${randomName}")`;
    await this.page.waitForSelector(optionSelector, { state: 'visible' });
    await this.page.click(optionSelector);
  
    // Check for and click the "Open" button if it exists
    const openButton = await this.page.$('button:has-text("Open")');
    if (openButton) {
      await openButton.click();
    }
  
    console.log(`Selected existing representative company: ${randomName}`);
  }


  async createNewRepresentative() {
    console.log('Creating a new representative...');
    
    // Click the "Adicionar Representante" button
    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();
    
    // Wait for the modal to appear
    const modal = await this.page.locator('form').filter({ hasText: 'Dados do Representante' });
    await modal.waitFor({ state: 'visible' });


    const saveButton1 = await this.page.getByText('Salvar');

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
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // await modal.getByRole('button', { name: 'Salvar' }).click();
    // await this.page.getByRole('button', { name: 'Próximo' }).click();
    await saveButton1.click();

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

  // async initializeTests() {
  //   await this.findFillableElements();
  // }

  // async findFillableElements() {
  //   this.formElements = await findFillableFormElements(this.page);
  //   console.log("Form elements found:", JSON.stringify(this.formElements, null, 2));
  //   return this.formElements;
  // }

  // async checkAllFields() {
  //   console.log("Form elements to check:", JSON.stringify(this.formElements, null, 2));
  //   // Implement your checking logic here
  // }

}

module.exports = CustomerPageRepresentative;