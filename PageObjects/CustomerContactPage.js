// PageObjects/CustomerContactPage.js
const { faker, fakerbr } = require('../utils');

class CustomerContactPage {
  constructor(page) {
    this.page = page;
    this.phoneInputSelector = 'input[name="phone_number"]';
    this.emailInputSelector = 'input[name="email"]';
    this.addButtonSelectors = [
      'svg[viewBox="0 0 512 512"]',
      'svg.cursor-pointer[color="#26B99A"]',
      'svg[height="20"][width="20"]',
      '//*[@id="__next"]/div/main/div[1]/div[2]/div/div[3]/div[1]/div/div[1]/div/div/svg',
      '//*[@id="__next"]/div/main/div[1]/div[2]/div/div[3]/div[1]/div/div[2]/div/div/svg'
    ];
    this.nextButtonSelector = 'button:has-text("Próximo")';
  }

  // TD: Fix to 0.5 when problem is solved
  // TD: Create Card to Solve + Problem in Playwright
  // TD: Test using another library?
  async fillContactInfo() {
    const useMultipleContacts = Math.random() < 0.01;

    if (useMultipleContacts) {
      await this.addMultiplePhoneNumbers();
      await this.addMultipleEmails();
      console.log("Multiple Contacts")
    } else {
      await this.addSinglePhoneNumber();
      await this.addSingleEmail();
      console.log("Single Contact")
    }
  }

  async addSinglePhoneNumber() {
    try {
      const phoneInput = await this.page.locator(this.phoneInputSelector).first();
      await phoneInput.fill(faker.string.numeric(10));
    } catch (error) {
      console.error('Error adding single phone number:', error.message);
    }
  }

  async addSingleEmail() {
    try {
      const emailInput = await this.page.locator(this.emailInputSelector).first();
      await emailInput.fill(faker.internet.email());
    } catch (error) {
      console.error('Error adding single email:', error.message);
    }
  }

  async addMultiplePhoneNumbers() {
    const numPhones = faker.number.int({ min: 2, max: 3 });
    
    for (let i = 1; i < numPhones; i++) {
      await this.clickAddButton('phone');
      await this.page.waitForTimeout(1000); // Wait for the new input to appear
    }
    
    const phoneInputs = await this.page.locator(this.phoneInputSelector).all();
    for (let i = 0; i < phoneInputs.length; i++) {
      try {
        await phoneInputs[i].fill(faker.string.numeric(10));
      } catch (error) {
        console.error(`Error filling phone number ${i + 1}:`, error.message);
      }
    }
  }

  async addMultipleEmails() {
    const numEmails = faker.number.int({ min: 2, max: 3 });
    
    for (let i = 1; i < numEmails; i++) {
      await this.clickAddButton('email');
      await this.page.waitForTimeout(1000); // Wait for the new input to appear
    }
    
    const emailInputs = await this.page.locator(this.emailInputSelector).all();
    for (let i = 0; i < emailInputs.length; i++) {
      try {
        await emailInputs[i].fill(faker.internet.email());
      } catch (error) {
        console.error(`Error filling email ${i + 1}:`, error.message);
      }
    }
  }

  async clickAddButton(type) {
    for (const selector of this.addButtonSelectors) {
      try {
        const buttons = await this.page.$$(selector);
        for (const button of buttons) {
          const isVisible = await button.isVisible();
          if (isVisible) {
            await button.click();
            console.log(`Clicked add button for ${type} using selector: ${selector}`);
            return;
          }
        }
      } catch (error) {
        console.error(`Error with selector ${selector}:`, error.message);
      }
    }
    console.error(`Failed to click add button for ${type} with all selectors`);
  }

  async getPhoneNumbers() {
    const phoneInputs = await this.page.locator(this.phoneInputSelector).all();
    return Promise.all(phoneInputs.map(input => input.inputValue()));
  }

  async getEmails() {
    const emailInputs = await this.page.locator(this.emailInputSelector).all();
    return Promise.all(emailInputs.map(input => input.inputValue()));
  }

  async clickNextButton() {
    try {
      await this.page.click(this.nextButtonSelector);
      console.log('Clicked the Next button successfully');
    } catch (error) {
      console.error('Error clicking Next button:', error.message);
    }
  }

  async verifySelectors() {
      const elements = [
          {
              name: 'Phone Input',
              selectors: [
                  { name: 'Name attribute', selector: this.phoneInputSelector },
                  { name: 'Class', selector: '.MuiInputBase-input.MuiOutlinedInput-input' },
                  { name: 'Placeholder', selector: 'input[placeholder="Telefone"]' },
                  { name: 'Role and name', selector: 'role=textbox[name="Telefone"]' },
                  { name: 'Partial text match', selector: 'input[placeholder*="Telefone"]' },
                  { name: 'Parent and child', selector: 'form input[name="phone_number"]' },
                ]
            },
            {
                name: 'Email Input',
                selectors: [
                    { name: 'Name attribute', selector: this.emailInputSelector },
                    { name: 'Class', selector: '.MuiInputBase-input.MuiOutlinedInput-input' },
                    { name: 'Placeholder', selector: 'input[placeholder="E-mail"]' },
                    { name: 'Role and name', selector: 'role=textbox[name="E-mail"]' },
                    { name: 'Partial text match', selector: 'input[placeholder*="E-mail"]' },
                    { name: 'Parent and child', selector: 'form input[name="email"]' },
                ]
            },
            {
                name: 'Add Button',
                selectors: [
                    { name: 'SVG ViewBox', selector: this.addButtonSelector },
                    { name: 'Role', selector: 'role=button' },
                    { name: 'Class', selector: '.MuiButtonBase-root.MuiIconButton-root' },
                    { name: 'Aria-label', selector: 'button[aria-label="add"]' },
                ]
            }
        ];
        
        for (const element of elements) {
            console.log(`Testing selectors for ${element.name}:`);
            for (const { name, selector } of element.selectors) {
                try {
                    const elementHandle = await this.page.locator(selector).first();
                    const isVisible = await elementHandle.isVisible();
                    console.log(`  ${name} selector: ${selector}`);
                    console.log(`    Element found: ${isVisible ? 'Yes (Visible)' : 'Yes (Not visible)'}`);
                    
                    if (isVisible && (element.name === 'Phone Input' || element.name === 'Email Input')) {
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
}

module.exports = CustomerContactPage;
