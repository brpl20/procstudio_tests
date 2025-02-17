// PageObjects/CustomerPageAddress.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerPageAddress {
  constructor(page) {
    this.page = page;
  }

  async fillCustomerAddress() {
    // Generate CEP using SuperFaker
    const cep = customFaker.zipCode();

    // Fill CEP
    const cepInput = await this.page.locator('#outlined-cep');
    await cepInput.fill(cep);
    const cepVerifyFakerAPI = await customFaker.getAddressByCepCorreio(cep)
    await this.page.waitForTimeout(5000); 
    // await expect(enderecoField).toHaveValue(/.+/); // Wait until it has any value
    // await expect(estadoField).toHaveValue(/.+/);   // Wait until it has any value
    // TD: Fix when proper testing suit is set up
    // Store CEP for later verification
    
    // Get and store other address fields (filled by API)
    const street = await this.page.locator('#outlined-street').inputValue();
    const neighborhood = await this.page.locator('#outlined-neighborhood').inputValue();
    const city = await this.page.locator('#outlined-city').inputValue();
    const state = await this.page.locator('#outlined-state').inputValue();
    
    CustomerDataStore.set('street', street);
    CustomerDataStore.set('neighborhood', neighborhood);
    CustomerDataStore.set('cep', cep);
    CustomerDataStore.set('city', city);
    CustomerDataStore.set('state', state);
    CustomerDataStore.set('addressByCepFakerAPI', cepVerifyFakerAPI);

    // Fill N.º (number)
    const number = customFaker.buildingNumber();
    const numeroInput = await this.page.locator('#outlined-number');
    await numeroInput.fill(number);
    CustomerDataStore.set('number', number);
  
    // Fill Complemento
    const complement = customFaker.addressComplement();
    const complementInput = await this.page.locator('#outlined-description');
    await complementInput.fill(complement);
    CustomerDataStore.set('complement', complement);

    // Click Próximo button
    await this.page.getByRole('button', { name: 'Próximo' }).click();

    // Prepare data for verification
    const frontendData = {
      cep,
      street,
      neighborhood,
      city,
      state,
      number,
      complement
    };

  }

}

module.exports = CustomerPageAddress;