// PageObjects/CustomerBankDetails.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerBankDetails {
  constructor(page) {
    this.page = page;
  }

  async selectRandomBank() {
    const bank = customFaker.selectRandomBank();
    await this.page.locator('#multiple-limit-tags').click();
    await this.page.keyboard.type(bank);
    await this.page.keyboard.press('Enter');
    CustomerDataStore.set('bank', bank);
  }

  async fillAgency() {
    const agency = customFaker.generateAgency();
    const agencyInput = await this.page.locator('input[name="agency"]');
    await agencyInput.fill(agency);
    CustomerDataStore.set('agency', agency);
  }

  async fillOperation() {
    const operation = customFaker.generateOperation();
    const opInput = await this.page.locator('input[name="op"]');
    await opInput.fill(operation);
    CustomerDataStore.set('operation', operation);
  }

  async fillAccount() {
    const account = customFaker.generateAccount();
    const accountInput = await this.page.locator('input[name="account"]');
    await accountInput.fill(account);
    CustomerDataStore.set('account', account);
  }

  async fillPix() {
    const pix = customFaker.generatePix();
    const pixInput = await this.page.locator('input[name="pix"]');
    await pixInput.fill(pix);
    CustomerDataStore.set('pix', pix);
  }

  async fillBankDetails() {
    await this.selectRandomBank();
    await this.fillAgency();
    await this.fillOperation();
    await this.fillAccount();
    await this.fillPix();

    // Click Próximo button (assuming it exists on this page as well)
    await this.page.getByRole('button', { name: 'Próximo' }).click();

    return {
      bank: CustomerDataStore.get('bank'),
      agency: CustomerDataStore.get('agency'),
      operation: CustomerDataStore.get('operation'),
      account: CustomerDataStore.get('account'),
      pix: CustomerDataStore.get('pix')
    };
  }
}

module.exports = CustomerBankDetails;