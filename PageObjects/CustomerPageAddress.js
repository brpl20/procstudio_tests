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
    const ceporVerify = await customFaker.getAddressByCepCorreio(cep)
    console.log(ceporVerify);
    // Wait for 3 seconds for API response
    await this.page.waitForTimeout(3000);
  
    // Store CEP for later verification
    CustomerDataStore.set('cep', cep);

    // Get and store other address fields (filled by API)
    const street = await this.page.locator('#outlined-street').inputValue();
    const neighborhood = await this.page.locator('#outlined-neighborhood').inputValue();
    const city = await this.page.locator('#outlined-city').inputValue();
    const state = await this.page.locator('#outlined-state').inputValue();

    CustomerDataStore.set('street', street);
    CustomerDataStore.set('neighborhood', neighborhood);
    CustomerDataStore.set('city', city);
    CustomerDataStore.set('state', state);

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