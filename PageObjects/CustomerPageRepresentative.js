// PageObjects/CustomerPageRepresentative.js
const { customFaker, generateRandomItem, selectRandomItemFromOptions } = require('../Utils/utils');
const { getRepresentativeNames } = require('../ApiRequests/representativeStore');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

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
    const randomName = this.getRandomItem(representativeNames);
    console.log(`Selected name: ${randomName}`);
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
    CustomerDataStore.set('representativeName', randomName);
  }

  async selectExistingRepresentativeCompany() {
    console.log('Selecting an existing representative company...');
    const representativeNames = getRepresentativeNames();
    const randomName = this.getRandomItem(representativeNames);
    console.log(`Selected company: ${randomName}`);

    const inputSelector = await this.page.getByRole('combobox', { name: 'Selecione um Representante' });
    await inputSelector.click();
    await inputSelector.fill(randomName);
    await this.page.waitForTimeout(500);
    await inputSelector.press('Enter');
  
    const optionSelector = `[role="option"]:has-text("${randomName}")`;
    await this.page.waitForSelector(optionSelector, { state: 'visible' });
    await this.page.click(optionSelector);
  
    const openButton = await this.page.$('button:has-text("Open")');
    if (openButton) {
      await openButton.click();
    }
  
    console.log(`Selected existing representative company: ${randomName}`);
    CustomerDataStore.set('representativeCompany', randomName);
  }

  async createNewRepresentative() {
    console.log('Creating a new representative...');

    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();
    
    const modal = await this.page.locator('form').filter({ hasText: 'Dados do Representante' });
    await modal.waitFor({ state: 'visible' });

    const saveButton1 = await this.page.getByText('Salvar');

    const firstName = customFaker.firstName();
    const lastName = customFaker.lastName();
    const cpf = customFaker.generateCPF();
    const rg = customFaker.generateRG();
    const birthDate = customFaker.generateBirthDate(0, 100);
    const number = customFaker.buildingNumber();
    const profession = customFaker.jobTitle();
    const cep = customFaker.zipCode();
    const phone = customFaker.generateCellPhoneNumber();
    const email = customFaker.generateEmail();
    const ceporVerify = await customFaker.getAddressByCepCorreio(cep)
    console.log(ceporVerify);

    await modal.getByPlaceholder('Informe o Nome do Representante').fill(firstName);
    await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(lastName);
    await modal.getByPlaceholder('Informe o CPF').fill(cpf);
    await modal.getByPlaceholder('Informe o RG').fill(rg);
    await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDate);
    await modal.getByPlaceholder('N.º').fill(number);
    await modal.locator('#outlined-profession').fill(profession);
    await modal.getByPlaceholder('Informe o CEP').fill(cep);
    await modal.locator('#outlined-phone').fill(phone);
    await modal.locator('#outlined-email').fill(email);

    // Wait for CEP API response
    await this.page.waitForTimeout(3000);

    // Get and store address fields (filled by API)
    const street = await modal.locator('#outlined-street').inputValue();
    const neighborhood = await modal.locator('#outlined-neighborhood').inputValue();
    const city = await modal.locator('#outlined-city').inputValue();
    const state = await modal.locator('#outlined-state').inputValue();

    const complement = customFaker.addressComplement();
    await modal.locator('#outlined-description').fill(complement);

    const nationality = await this.selectDropdownOption(modal, 'nationality', ['Brasileiro', 'Estrangeiro']);
    const gender = await this.selectDropdownOption(modal, 'gender', ['Masculino', 'Feminino']);
    const civilStatus = await this.selectDropdownOption(modal, 'civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);
    
    await saveButton1.click();

    await this.page.waitForSelector('form:has-text("Dados do Representante")', { state: 'hidden' });

    console.log('Representative created successfully');

    // Store data for verification (18 fields)
    CustomerDataStore.set('representativeFirstName', firstName);
    CustomerDataStore.set('representativeLastName', lastName);
    CustomerDataStore.set('representativeCPF', cpf);
    CustomerDataStore.set('representativeRG', rg);
    CustomerDataStore.set('representativeBirthDate', birthDate);
    CustomerDataStore.set('representativeNumber', number);
    CustomerDataStore.set('representativeProfession', profession);
    CustomerDataStore.set('representativeCEP', cep);
    CustomerDataStore.set('representativePhone', phone);
    CustomerDataStore.set('representativeEmail', email);
    CustomerDataStore.set('representativeStreet', street);
    CustomerDataStore.set('representativeNeighborhood', neighborhood);
    CustomerDataStore.set('representativeCity', city);
    CustomerDataStore.set('representativeState', state);
    CustomerDataStore.set('representativeComplement', complement);
    CustomerDataStore.set('representativeNationality', nationality);
    CustomerDataStore.set('representativeGender', gender);
    CustomerDataStore.set('representativeCivilStatus', civilStatus);
  }

  async selectDropdownOption(container, fieldName, options) {
    const randomOption = generateRandomItem(options);
    console.log(`Selecting random option: ${randomOption} from ${fieldName} dropdown`);

    await container.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.waitForSelector('ul[role="listbox"]');
    await this.page.locator(`#menu-${fieldName} div`).filter({ hasText: randomOption }).click();

    console.log(`Selected ${fieldName}: ${randomOption}`);
    return randomOption;
  }

  getRandomItem(array) {
    return generateRandomItem(array);
  }
}

module.exports = CustomerPageRepresentative;