// PageObjects/CustomerBankDetails.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

async function testSelectors(page) {
  const elements = [
    {
      name: 'Bank Selection',
      selectors: [
        { name: 'ID', selector: '#multiple-limit-tags' },
        { name: 'Placeholder', selector: 'input[placeholder="Selecione um Banco"]' },
        { name: 'Class', selector: '.MuiAutocomplete-input' },
      ]
    },
    {
      name: 'Agency Input',
      selectors: [
        { name: 'Name attribute', selector: 'input[name="agency"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Número da agencia"]' },
      ]
    },
    {
      name: 'Operation Input',
      selectors: [
        { name: 'Name attribute', selector: 'input[name="op"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Op."]' },
      ]
    },
    {
      name: 'Account Input',
      selectors: [
        { name: 'Name attribute', selector: 'input[name="account"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Número da conta"]' },
      ]
    },
    {
      name: 'PIX Input',
      selectors: [
        { name: 'Name attribute', selector: 'input[name="pix"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe a chave"]' },
      ]
    },
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

class CustomerBankDetails {
  constructor(page) {
    this.page = page;
  }

  async selectRandomBank() {
    const banks = [
      'BCO DO BRASIL S.A.',
      'NU PAGAMENTOS - IP',
      'CAIXA ECONOMICA FEDERAL'
    ];
    const randomBank = banks[Math.floor(Math.random() * banks.length)];
    
    await this.page.locator('#multiple-limit-tags').click();
    await this.page.keyboard.type(randomBank);
    await this.page.keyboard.press('Enter');
  }

  async fillAgency() {
    const agencyInput = await this.page.locator('input[name="agency"]');
    await agencyInput.fill(faker.finance.accountNumber(4));
  }

  async fillOperation() {
    const opInput = await this.page.locator('input[name="op"]');
    await opInput.fill(faker.number.int({ min: 10, max: 99 }).toString());
  }

  async fillAccount() {
    const accountInput = await this.page.locator('input[name="account"]');
    await accountInput.fill(faker.finance.accountNumber(7));
  }

  async fillPix() {
    const pixInput = await this.page.locator('input[name="pix"]');
    const pixTypes = ['CPF', 'CNPJ', 'EMAIL', 'PHONE'];
    const randomPixType = pixTypes[Math.floor(Math.random() * pixTypes.length)];

    let pixValue;
    switch (randomPixType) {
      case 'CPF':
        pixValue = fakerbr.br.cpf();
        break;
      case 'CNPJ':
        pixValue = fakerbr.br.cnpj();
        break;
      case 'EMAIL':
        pixValue = faker.internet.email();
        break;
      case 'PHONE':
        pixValue = faker.phone.number('+55 ## #####-####');
        break;
    }

    await pixInput.fill(pixValue);
  }

  async fillBankDetails() {
    console.log("Testing selectors before filling bank details:");
    await testSelectors(this.page);

    await this.selectRandomBank();
    await this.fillAgency();
    await this.fillOperation();
    await this.fillAccount();
    await this.fillPix();

    // Click Próximo button (assuming it exists on this page as well)
    await this.page.getByRole('button', { name: 'Próximo' }).click();
  }
}

module.exports = CustomerBankDetails;