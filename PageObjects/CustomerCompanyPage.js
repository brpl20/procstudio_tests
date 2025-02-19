// PageObjects/CustomerCompanyPage.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');
// const { findFillableFormElements } = require('../Helpers/formHelper');
const CustomerPageRepresentative = require('./CustomerPageRepresentative');
const CustomerBankDetails = require('./CustomerBankDetails');

class CustomerCompanyPage {
  constructor(page) {
    this.page = page;
    this.representativePage = new CustomerPageRepresentative(page);
    this.bankPage = new CustomerBankDetails(page);
  }  
  
  async fillCustomerCompanyForm() {
    
    // Fill CEP using fakerbr and SuperFaker
    const cep = customFaker.zipCode();
    const cepInput = await this.page.locator('#outlined-cep');
    await this.page.fill('input[name="zip_code"]', cep);
    CustomerDataStore.set('cep', cep);


    // TD: Não adianta, as vees o CEP dá algum tipo de erro, ou não possui Bairro ou Endereço
    // Acredito que sejam os ceps "de cidade"
    // Aqueles de cidades pequenas 
    // Precisamos criar um failsafe para isso
    // await cepInput.fill(cep);
    const cepVerifyFakerAPI = await customFaker.getAddressByCepCorreio(cep)
    await this.page.waitForTimeout(3000); 
    
    // Fill N.º (number)
    const number = customFaker.buildingNumber();
    // const numeroInput = await this.page.locator('#outlined-number');
    await this.page.fill('input[name="number"]', number);
    // await numeroInput.fill(number);
    CustomerDataStore.set('number', number);
  
    // Fill Complemento
    const complement = customFaker.addressComplement();
    // const complementInput = await this.page.locator('#outlined-description');
    // await complementInput.fill(complement);
    await this.page.fill('input[name="description"]', complement);
    CustomerDataStore.set('complement', complement);

    // Company Inputs
    const fakeCompany = customFaker.generateFullEnterprise(); 
    const fakeCompanyName = fakeCompany.name;
    const fakeCompanyCnpj = fakeCompany.cnpj;
    
    
    await this.page.fill('input[name="name"]', fakeCompanyName);
    await this.page.fill('input[name="cnpj"]', fakeCompanyCnpj);
    
    console.log('Customer Company form filled successfully');
    
    // Click the 'Next' button after filling the form
    await this.page.getByRole('button', { name: 'Próximo' }).click();

    
    // Email and phone
    // Não utilizei o mesmo método porque há diferença entre os formulários
    const fakeCompanyEmail = fakeCompany.email;
    const fakeCompanyPhone = customFaker.generateCellPhoneNumber(); // o metodo da empresa gera numeros maiores e invalidos
    await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).fill(fakeCompanyPhone);
    await this.page.getByRole('textbox', { name: 'Informe o Email' }).fill(fakeCompanyEmail);

    // Representative Add... 
    // TD: Arrumar lógica aqui porque o método customer representative
    // Está criando todo o método sem apertar no botão seguinte
    // Também arrumar no Customer Create
    // Manter sempre a mesma lógica em todo o sistema
    console.log('Adding a representative...');
    await this.representativePage.selectOrCreateRepresentative();

    
    await this.page.waitForLoadState('networkidle');

    // Try to find and click the button
    const button2 = await this.page.getByRole('button', { name: 'Próximo' });
    try {
        await button2.waitFor({ state: 'visible', timeout: 5000 });
        await button2.evaluate(button => {
            if (!button.disabled) {
                button.click();
            }
        });
        console.log('Button clicked via evaluate');
    } catch (error) {
        console.error('Failed to click button:', error);
    }



    // Wait for navigation or state change after clicking
    // Choose the most appropriate wait condition for your case:
    // await this.page.waitForLoadState('networkidle'); // Wait for network requests to complete
    
    // Fill Bank Details
    console.log('Adding a Bank Details... fixed');
    await this.bankPage.fillBankDetails()
    
    // Finalizando 
    await this.page.getByRole('button', { name: 'Finalizar' }).click();
    
    // await this.page.pause();

    // Wait for modal to appear and become stable
    await this.page.waitForLoadState('networkidle');

    // Find and click the save button
    const saveButton = await this.page.getByRole('button', { name: 'Salvar' });
    await saveButton.waitFor({ state: 'visible' });
    await saveButton.click();



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