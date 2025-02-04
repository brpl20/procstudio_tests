// PageObjects/CustomerPageAddress.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

class CustomerPageAddress {
  constructor(page) {
    this.page = page;
  }

  async fillCustomerAddress() {
    // Fill CEP using the specific selector
    console.log("am i here?")
    const cepInput = await this.page.locator('#outlined-cep');
    await cepInput.fill(fakerbr.address.zipCodeValid());
    
    const cepInput2 = await this.page.getByPlaceholder('Informe o CPF').fill(fakerbr.br.cpf());
    console.log(cepInput2)

    // Wait for 2 seconds for API response
    await this.page.waitForTimeout(2000);
    
    // Fill N.º (number)
    const numeroInput = await this.page.getByRole('textbox', { name: 'N.º' });
    await numeroInput.fill(faker.number.int({ min: 1, max: 9999 }).toString());
    
    // Fill Complemento
    const complementoInput = await this.page.getByRole('textbox', { name: 'Informe o Complemento' });
    const complemento = faker.lorem.words(3);
    await complementoInput.fill(complemento);
    
    // Click Próximo button
    const proximoButton = await this.page.getByRole('button', { name: 'Próximo' });
    await proximoButton.click();
  }
}

module.exports = CustomerPageAddress;