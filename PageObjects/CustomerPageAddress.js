// PageObjects/CustomerPageAddress.js
const { faker, fakerbr } = require('../utils');

async function testSelectors(page) {
  const elements = [
      {
          name: 'Complemento Input',
          selectors: [
              { name: 'ID', selector: '#outlined-description' },
              { name: 'Name attribute', selector: 'input[name="description"]' },
              { name: 'Placeholder', selector: 'input[placeholder="Informe o Complemento"]' },
              { name: 'Combined attributes', selector: 'input#outlined-description[name="description"][placeholder="Informe o Complemento"]' },
              { name: 'Role and name', selector: 'role=textbox[name="Informe o Complemento"]' },
              { name: 'Class', selector: '.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall' },
              { name: 'Partial text match', selector: 'input[placeholder*="Complemento"]' },
              { name: 'Parent and child', selector: 'form input[name="description"]' },
          ]
      },
      {
          name: 'Number Input',
          selectors: [
              { name: 'ID', selector: '#outlined-number' },
              { name: 'Name attribute', selector: 'input[name="number"]' },
              { name: 'Placeholder', selector: 'input[placeholder="N.º"]' },
              { name: 'Combined attributes', selector: 'input#outlined-number[name="number"][placeholder="N.º"]' },
              { name: 'Role and name', selector: 'role=textbox[name="N.º"]' },
              { name: 'Class', selector: '.MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputSizeSmall' },
              { name: 'Partial text match', selector: 'input[placeholder="N.º"]' },
              { name: 'Parent and child', selector: 'form input[name="number"]' },
          ]
      }
  ];

  for (const element of elements) {
      console.log(`Testing selectors for ${element.name}:`);
      for (const { name, selector } of element.selectors) {
          try {
              const elementHandle = await page.locator(selector).first();
              const isVisible = await elementHandle.isVisible();
              console.log(`  ${name} selector: ${selector}`);
              console.log(`    Element found: ${isVisible ? 'Yes (Visible)' : 'Yes (Not visible)'}`);
              
              if (isVisible) {
                  const value = await elementHandle.inputValue();
                  console.log(`    Current value: "${value}"`);
              }
          } catch (error) {
              console.log(`  ${name} selector: ${selector}`);
              console.log(`    Element not found. Error: ${error.message}`);
          }
          console.log('  ---');
      }
      console.log('\n');
  }
}


class CustomerPageAddress {
  constructor(page) {
    this.page = page;
  }

// Usage in your test

async fillCustomerAddress() {
  // Fill CEP using the specific selector
  const cepInput = await this.page.locator('#outlined-cep');
  await cepInput.fill(fakerbr.address.zipCodeValid());
    
  // Wait for 2 seconds for API response
  await this.page.waitForTimeout(3000);
  
  // Fill N.º (number)
  await testSelectors(this.page);
  const numeroInput = await this.page.locator('#outlined-number');
  await numeroInput.fill(faker.number.int({ min: 1, max: 9999 }).toString());
  
  // Fill Complemento
  const complementoInput = await this.page.locator('#outlined-description');
  const complemento = faker.lorem.words(2);
  await complementoInput.fill(complemento);
  
  // await this.page.locator('#outlined-neighborhood').fill(faker.location.county());
  

    // Click Próximo button
    await this.page.getByRole('button', { name: 'Próximo' }).click();

  }
}

module.exports = CustomerPageAddress;