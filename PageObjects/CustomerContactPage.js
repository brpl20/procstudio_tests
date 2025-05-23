// PageObjects/CustomerContactPage.js
const { customFaker } = require('../Utils/utils');
const CustomerDataStore = require('../Helpers/CustomerDataStore');
const config = require('../config');

class CustomerContactPage {
  constructor(page) {
    this.page = page;
  }

  async waitForElement(selector, timeout = 1000) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible',
        timeout: timeout 
      });
      return true;
    } catch (error) {
      console.log(`Element ${selector} not found after ${timeout}ms`);
      return false;
    }
  }

  async generateFallbackEmail() {
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const email = `test-${uniqueId}@example.com`;
    console.log(`Generated fallback email: ${email}`);
    return email;
  }

  async createSinglePhone() {
    const phoneNumber = customFaker.generateCellPhoneNumber();
    await this.waitForElement('[name="Insira um número de telefone"]');
    await this.page.getByRole('textbox', { name: 'Insira um número de telefone' }).first().fill(phoneNumber);
    CustomerDataStore.set('phoneNumber', phoneNumber);
    return phoneNumber;
  }

  async createMultiplePhones() {
    const phoneNumbers = [
      customFaker.generateCellPhoneNumber(),
      customFaker.generateCellPhoneNumber()
    ];
    
    // Wait for and click the add phone button
    await this.waitForElement('#add-phone');
    await this.page.locator('#add-phone').click();
    
    // Wait for both phone inputs to be visible
    await this.waitForElement('[name="Insira um número de telefone"]');
    await this.page.waitForTimeout(1000); // Small delay to ensure both fields are ready
    
    await this.page.getByRole('textbox', { name: 'Insira um número de telefone' }).first().fill(phoneNumbers[0]);
    await this.page.getByRole('textbox', { name: 'Insira um número de telefone' }).nth(1).fill(phoneNumbers[1]);
    
    CustomerDataStore.set('phoneNumbers', phoneNumbers);
    return phoneNumbers;
  }

  async createSingleEmail() {
    // Try to get the email from CustomerDataStore (from maildrop)
    let email = CustomerDataStore.get('email');
    
    // If no email is found in CustomerDataStore, generate a fallback
    if (!email) {
      console.error('No maildrop email found in CustomerDataStore. Using fallback email.');
      email = await this.generateFallbackEmail();
    } else {
      console.log(`Using maildrop email from CustomerDataStore: ${email}`);
    }
    
    await this.waitForElement('[name="Insira um e-mail"]');
    await this.page.getByRole('textbox', { name: 'Insira um e-mail' }).first().fill(email);
    
    // Make sure the email is stored in CustomerDataStore (in case we used fallback)
    CustomerDataStore.set('email', email);
    return email;
  }

  async createMultipleEmails() {
    // Try to get the email from CustomerDataStore (from maildrop)
    let primaryEmail = CustomerDataStore.get('email');
    
    // If no email is found in CustomerDataStore, generate a fallback
    if (!primaryEmail) {
      console.error('No maildrop email found in CustomerDataStore. Using fallback email.');
      primaryEmail = await this.generateFallbackEmail();
    } else {
      console.log(`Using maildrop email from CustomerDataStore: ${primaryEmail}`);
    }
    
    // Generate secondary email
    const secondaryEmail = customFaker.generateEmail();
    
    const emails = [primaryEmail, secondaryEmail];
    
    // Wait for and click the add email button
    await this.waitForElement('#add-email');
    await this.page.locator('#add-email').click();
    
    // Wait for both email inputs to be visible
    await this.waitForElement('[name="Insira um e-mail"]');
    await this.page.waitForTimeout(500); // Small delay to ensure both fields are ready
    
    await this.page.getByRole('textbox', { name: 'Insira um e-mail' }).first().fill(emails[0]);
    await this.page.getByRole('textbox', { name: 'Insira um e-mail' }).nth(1).fill(emails[1]);
    
    CustomerDataStore.set('emails', emails);
    return emails;
  }

  async fillContactInfo() {
    const shouldCreateMultiple = Math.random() < 0.50;
    let contactData = {};

    // Add initial wait to ensure page is ready
    await this.page.waitForTimeout(2000);

    if (shouldCreateMultiple) {
      contactData.phones = await this.createMultiplePhones();
      await this.page.waitForTimeout(1000); // Wait between phone and email operations
      contactData.emails = await this.createMultipleEmails();
    } else {
      contactData.phone = await this.createSinglePhone();
      await this.page.waitForTimeout(1000); // Wait between phone and email operations
      contactData.email = await this.createSingleEmail();
    }

    await this.page.waitForTimeout(1000); // Wait before clicking next
    await this.page.getByRole('button', { name: 'Próximo' }).click();
    return contactData;
  }

  async handleAddButtons() {
    try {
      const buttons = ['#add-phone', '#add-email'];
      
      for (const buttonSelector of buttons) {
        if (await this.waitForElement(buttonSelector)) {
          await this.page.waitForTimeout(1000); // Wait before clicking
          await this.page.locator(buttonSelector).click();
          console.log(`${buttonSelector} button clicked`);
          await this.page.waitForTimeout(2000); // Wait after clicking
        }
      }
    } catch (error) {
      console.error('Error while handling add buttons:', error);
      throw error;
    }
  }
}

module.exports = CustomerContactPage;