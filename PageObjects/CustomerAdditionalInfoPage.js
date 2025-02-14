// PageObjects/CustomerAdditionalInfoPage.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerAdditionalInfoPage {
  constructor(page) {
    this.page = page;
  }

  async fillProfession() {
    const profession = customFaker.jobTitle();
    const professionInput = await this.page.locator('#outlined-profession');
    await professionInput.fill(profession);
    CustomerDataStore.set('profession', profession);
  }

  async fillCompany() {
    const company = customFaker.generateCompanyName();
    const companyInput = await this.page.locator('#outlined-company');
    await companyInput.fill(company);
    CustomerDataStore.set('company', company);
  }

  async fillBenefitNumber() {
    const benefitNumber = customFaker.generateBenefitNumber();
    const benefitInput = await this.page.locator('#outlined-number_benefit');
    await benefitInput.fill(benefitNumber);
    CustomerDataStore.set('benefitNumber', benefitNumber);
  }

  async fillNIT() {
    const nit = customFaker.generateNIT();
    const nitInput = await this.page.locator('#outlined-nit');
    await nitInput.fill(nit);
    CustomerDataStore.set('nit', nit);
  }

  async fillMotherName() {
    const motherName = customFaker.generateMotherName();
    const motherNameInput = await this.page.locator('#outlined-mother_name');
    await motherNameInput.fill(motherName);
    CustomerDataStore.set('motherName', motherName);
  }

  async fillPassword() {
    const passwordSelectors = [
      '#outlined-inss_password',
      'input[name="inss_password"]',
      'input[placeholder="Informe o Senha do meu INSS"]',
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

    const password = customFaker.generatePassword();
    await passwordInput.fill(password);
    CustomerDataStore.set('password', password);
    console.log(`Password: ${password}`);
  }

  async fillAdditionalInfo() {
    await this.fillProfession();
    await this.fillCompany();
    await this.fillBenefitNumber();
    await this.fillNIT();
    await this.fillMotherName();
    await this.fillPassword();
    await this.page.waitForTimeout(2000);

    // Click Próximo button (assuming it exists on this page as well)
    await this.page.getByRole('button', { name: 'Próximo' }).click();

    return {
      profession: CustomerDataStore.get('profession'),
      company: CustomerDataStore.get('company'),
      benefitNumber: CustomerDataStore.get('benefitNumber'),
      nit: CustomerDataStore.get('nit'),
      motherName: CustomerDataStore.get('motherName'),
      password: CustomerDataStore.get('password')
    };
  }
}

module.exports = CustomerAdditionalInfoPage;