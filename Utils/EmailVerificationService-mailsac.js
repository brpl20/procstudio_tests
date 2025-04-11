const { chromium } = require('playwright');
const mailsac = require('@mailsac/api');
const config = require('../config');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class EmailVerificationService {
  constructor() {
    // Initialize with API key - mailsac might be using a factory pattern instead of constructor
    this.mailsac = mailsac;
    this.mailsac.config = { apiKey: config.mailsac.apiKey };
    this.verificationInProgress = false;
  }

  async startVerification() {
    if (this.verificationInProgress) {
      console.log('Email verification already in progress');
      return;
    }

    this.verificationInProgress = true;
    
    // Start verification process in a non-blocking way
    this.runVerificationProcess().catch(error => {
      console.error('Email verification error:', error);
      this.verificationInProgress = false;
    });

    console.log('Email verification process started in background');
  }

  async startVerification() {
    if (this.verificationInProgress) {
      console.log('Email verification already in progress');
      return;
    }

    this.verificationInProgress = true;
    
    // Start verification process in a non-blocking way
    this.runVerificationProcess().catch(error => {
      console.error('Email verification error:', error);
      this.verificationInProgress = false;
    });

    console.log('Email verification process started in background');
  }

  async runVerificationProcess() {
    try {
      // Get the test email from CustomerDataStore
      const testEmail = CustomerDataStore.get('email') || 
                       (CustomerDataStore.get('emails') && CustomerDataStore.get('emails')[0]);
      
      if (!testEmail) {
        console.error('No test email found in CustomerDataStore');
        this.verificationInProgress = false;
        return;
      }

      console.log(`Starting email verification for: ${testEmail}`);
      
      // Wait for the verification email
      const emailUser = testEmail.split('@')[0];
      const loginEmail = await this.waitForEmail({
        emailUser,
        timeout: config.mailsac.timeout || 180000,
        subject: /login|acesso|confirm|verificar/i
      });
      
      if (!loginEmail) {
        console.error('Verification email not received within timeout period');
        this.verificationInProgress = false;
        return;
      }
      
      console.log('Verification email received, processing...');
      
      // Extract login link or verification code
      const loginLink = this.extractLoginLink(loginEmail);
      
      if (!loginLink) {
        console.error('Could not extract login link from email');
        this.verificationInProgress = false;
        return;
      }
      
      // Launch a new browser instance for verification
      console.log('Launching browser for email verification...');
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Navigate to the verification link
        console.log(`Navigating to verification link: ${loginLink}`);
        await page.goto(loginLink);
        
        // Wait for verification to complete
        await page.waitForLoadState('networkidle');
        
        // Check for success indicators on the page
        const isSuccess = await this.checkVerificationSuccess(page);
        
        if (isSuccess) {
          console.log('Success in the Customer login and email verification');
        } else {
          console.error('Verification process failed');
        }
      } finally {
        // Always close the browser
        await browser.close();
      }
    } catch (error) {
      console.error('Error during verification process:', error);
    } finally {
      this.verificationInProgress = false;
    }
  }

  async waitForEmail({ emailUser, timeout, subject, fromDomain }) {
    console.log(`Waiting for email to arrive at ${emailUser}@mailsac.com...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check for messages
        const messages = await this.mailsac.messages.list(emailUser);
        
        if (messages && messages.length > 0) {
          // Filter messages if criteria provided
          const filteredMessages = messages.filter(msg => {
            const subjectMatch = !subject || (msg.subject && (
              typeof subject === 'string' 
                ? msg.subject.includes(subject) 
                : subject.test(msg.subject)
            ));
            
            const fromMatch = !fromDomain || (msg.from && msg.from.includes(fromDomain));
            return subjectMatch && fromMatch;
          });
          
          if (filteredMessages.length > 0) {
            // Get full message content
            const messageId = filteredMessages[0]._id;
            const fullMessage = await this.mailsac.messages.get(emailUser, messageId);
            console.log('Email received!');
            return fullMessage;
          }
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error checking for emails:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    return null; // Timeout exceeded
  }

  extractLoginLink(email) {
    const html = email.body || email.html || '';
    // Look for login/verification links
    const linkRegex = /(https?:\/\/[^\s"']+(?:login|verify|confirm|auth)[^\s"']*)/i;
    const match = html.match(linkRegex);
    return match ? match[0] : null;
  }

  async checkVerificationSuccess(page) {
    // Check for success indicators on the page
    // Adjust these selectors based on your application's UI
    try {
      const successSelectors = [
        '.verification-success',
        '.dashboard-header',
        '.welcome-message',
        'text=verificação concluída',
        'text=email verificado'
      ];
      
      for (const selector of successSelectors) {
        if (await page.locator(selector).count() > 0) {
          return true;
        }
      }
      
      // Also check page URL for success indicators
      const url = page.url();
      if (url.includes('dashboard') || url.includes('success') || url.includes('verified')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking verification success:', error);
      return false;
    }
  }
}

module.exports = new EmailVerificationService(); // Export as singleton




------------


// Services/EmailVerificationService.js
const { chromium } = require('playwright');
const mailsac = require('@mailsac/api');
const config = require('../config');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class EmailVerificationService {
  constructor() {
    this.mailsac = new mailsac({ apiKey: config.mailsac.apiKey });
    this.verificationInProgress = false;
  }

  async startVerification() {
    if (this.verificationInProgress) {
      console.log('Email verification already in progress');
      return;
    }

    this.verificationInProgress = true;
    
    // Start verification process in a non-blocking way
    this.runVerificationProcess().catch(error => {
      console.error('Email verification error:', error);
      this.verificationInProgress = false;
    });

    console.log('Email verification process started in background');
  }

  async runVerificationProcess() {
    try {
      // Get the test email from CustomerDataStore
      const testEmail = CustomerDataStore.get('email') || 
                       (CustomerDataStore.get('emails') && CustomerDataStore.get('emails')[0]);
      
      if (!testEmail) {
        console.error('No test email found in CustomerDataStore');
        this.verificationInProgress = false;
        return;
      }

      console.log(`Starting email verification for: ${testEmail}`);
      
      // Wait for the verification email
      const emailUser = testEmail.split('@')[0];
      const loginEmail = await this.waitForEmail({
        emailUser,
        timeout: config.mailsac.timeout || 180000,
        subject: /login|acesso|confirm|verificar/i
      });
      
      if (!loginEmail) {
        console.error('Verification email not received within timeout period');
        this.verificationInProgress = false;
        return;
      }
      
      console.log('Verification email received, processing...');
      
      // Extract login link or verification code
      const loginLink = this.extractLoginLink(loginEmail);
      
      if (!loginLink) {
        console.error('Could not extract login link from email');
        this.verificationInProgress = false;
        return;
      }
      
      // Launch a new browser instance for verification
      console.log('Launching browser for email verification...');
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Navigate to the verification link
        console.log(`Navigating to verification link: ${loginLink}`);
        await page.goto(loginLink);
        
        // Wait for verification to complete
        await page.waitForLoadState('networkidle');
        
        // Check for success indicators on the page
        const isSuccess = await this.checkVerificationSuccess(page);
        
        if (isSuccess) {
          console.log('Success in the Customer login and email verification');
        } else {
          console.error('Verification process failed');
        }
      } finally {
        // Always close the browser
        await browser.close();
      }
    } catch (error) {
      console.error('Error during verification process:', error);
    } finally {
      this.verificationInProgress = false;
    }
  }

  async waitForEmail({ emailUser, timeout, subject, fromDomain }) {
    console.log(`Waiting for email to arrive at ${emailUser}@mailsac.com...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check for messages
        const messages = await this.mailsac.messages.list(emailUser);
        
        if (messages && messages.length > 0) {
          // Filter messages if criteria provided
          const filteredMessages = messages.filter(msg => {
            const subjectMatch = !subject || (msg.subject && (
              typeof subject === 'string' 
                ? msg.subject.includes(subject) 
                : subject.test(msg.subject)
            ));
            
            const fromMatch = !fromDomain || (msg.from && msg.from.includes(fromDomain));
            return subjectMatch && fromMatch;
          });
          
          if (filteredMessages.length > 0) {
            // Get full message content
            const messageId = filteredMessages[0]._id;
            const fullMessage = await this.mailsac.messages.get(emailUser, messageId);
            console.log('Email received!');
            return fullMessage;
          }
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error checking for emails:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    return null; // Timeout exceeded
  }

  extractLoginLink(email) {
    const html = email.body || email.html || '';
    // Look for login/verification links
    const linkRegex = /(https?:\/\/[^\s"']+(?:login|verify|confirm|auth)[^\s"']*)/i;
    const match = html.match(linkRegex);
    return match ? match[0] : null;
  }

  async checkVerificationSuccess(page) {
    // Check for success indicators on the page
    // Adjust these selectors based on your application's UI
    try {
      const successSelectors = [
        '.verification-success',
        '.dashboard-header',
        '.welcome-message',
        'text=verificação concluída',
        'text=email verificado'
      ];
      
      for (const selector of successSelectors) {
        if (await page.locator(selector).count() > 0) {
          return true;
        }
      }
      
      // Also check page URL for success indicators
      const url = page.url();
      if (url.includes('dashboard') || url.includes('success') || url.includes('verified')) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking verification success:', error);
      return false;
    }
  }
}

module.exports = new EmailVerificationService(); // Export as singleton





------------


