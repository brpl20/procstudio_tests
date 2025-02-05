// PageObjects/CustomerAdditionalInfoPage.js
const fakerbr = require('faker-br');
const { faker } = require('@faker-js/faker');

async function testSelectors(page) {
  const elements = [
    {
      name: 'Profession Input',
      selectors: [
        { name: 'ID', selector: '#outlined-profession' },
        { name: 'Name attribute', selector: 'input[name="profession"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe o Profissão"]' },
      ]
    },
    {
      name: 'Company Input',
      selectors: [
        { name: 'ID', selector: '#outlined-company' },
        { name: 'Name attribute', selector: 'input[name="company"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe o Empresa Atual"]' },
      ]
    },
    {
      name: 'Benefit Number Input',
      selectors: [
        { name: 'ID', selector: '#outlined-number_benefit' },
        { name: 'Name attribute', selector: 'input[name="number_benefit"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe o Número de Benefício"]' },
      ]
    },
    {
      name: 'NIT Input',
      selectors: [
        { name: 'ID', selector: '#outlined-nit' },
        { name: 'Name attribute', selector: 'input[name="nit"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe o NIT"]' },
      ]
    },
    {
      name: 'Mother Name Input',
      selectors: [
        { name: 'ID', selector: '#outlined-mother_name' },
        { name: 'Name attribute', selector: 'input[name="mother_name"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe o Nome da Mãe"]' },
      ]
    },
    {
      name: 'Password Input',
      selectors: [
        { name: 'ID', selector: '#outlined-password' },
        { name: 'Name attribute', selector: 'input[name="password"]' },
        { name: 'Placeholder', selector: 'input[placeholder="Informe a Senha"]' },
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

class CustomerAdditionalInfoPage {
  constructor(page) {
    this.page = page;
  }

  async fillProfession() {
    const professionInput = await this.page.locator('#outlined-profession');
    await professionInput.fill(faker.person.jobTitle());
  }

  async fillCompany() {
    const companyInput = await this.page.locator('#outlined-company');
    await companyInput.fill(faker.company.name());
  }

  async fillBenefitNumber() {
    const benefitInput = await this.page.locator('#outlined-number_benefit');
    const benefitNumber = faker.string.numeric('###') + '.' + 
                          faker.string.numeric('###') + '.' + 
                          faker.string.numeric('###') + '-' + 
                          faker.string.numeric('#');
    await benefitInput.fill(benefitNumber);
  }

  async fillNIT() {
    const nitInput = await this.page.locator('#outlined-nit');
    const nit = faker.string.numeric('###') + '.' + 
                faker.string.numeric('#####') + '.' + 
                faker.string.numeric('##') + '-' + 
                faker.string.numeric('#');
    await nitInput.fill(nit);
  }

  async fillMotherName() {
    const motherNameInput = await this.page.locator('#outlined-mother_name');
    await motherNameInput.fill(faker.person.fullName({ sex: 'female' }));
  }

  async fillPassword() {
    const passwordSelectors = [
      '#outlined-password',
      'input[name="password"]',
      'input[placeholder="Informe a Senha"]',
    ];

    let passwordInput;
    for (const selector of passwordSelectors) {
      passwordInput = await this.page.locator(selector).first();
      if (await passwordInput.isVisible()) {
        break;
      }
    }

    if (!passwordInput) {
      console.error("Password input field not found or not visible");
      return;
    }

    const password = faker.internet.password({ length: 12, memorable: false, pattern: /[A-Z]/ }) + 
                     faker.string.numeric('#') + 
                     faker.string.symbol();
    await passwordInput.fill(password);
  }

  async fillAdditionalInfo() {
    console.log("Testing selectors before filling additional info:");
    await testSelectors(this.page);

    await this.fillProfession();
    await this.fillCompany();
    await this.fillBenefitNumber();
    await this.fillNIT();
    await this.fillMotherName();
    // await this.fillPassword();

    // Click Próximo button (assuming it exists on this page as well)
    await this.page.getByRole('button', { name: 'Próximo' }).click();
  }
}

module.exports = CustomerAdditionalInfoPage;