const { chromium } = require('playwright');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class EmailVerificationService {
  constructor() {
    this.verificationInProgress = false;
    this.browser = null;
    this.tempEmail = null;
    this.page = null;
    this.autoCloseTimeout = null;
  }

  async startVerification() {
    if (this.verificationInProgress) {
      console.log('Email verification already in progress');
      return;
    }

    this.verificationInProgress = true;
    
    try {
      // Launch a new browser instance with visible browser window for debugging
      console.log('Launching browser for maildrop.cc...');
      this.browser = await chromium.launch({ headless: false });
      const context = await this.browser.newContext();
      this.page = await context.newPage();
      
      // Navigate to maildrop.cc
      console.log('Navigating to maildrop.cc...');
      await this.page.goto('https://maildrop.cc/');
      
      // Wait longer for the page to fully load
      await this.page.waitForLoadState('networkidle');
      
      // Use the exact button selector from the HTML you provided
      console.log('Waiting for View Mailbox button...');
      await this.page.waitForSelector('button[type="submit"].mt-4.flex.w-full', { 
        state: 'visible',
        timeout: 10000 // Increased timeout to 10 seconds
      });
      
      console.log('Clicking on View Mailbox button...');
      // Use the exact selector provided in your HTML
      await this.page.click('button[type="submit"].mt-4.flex.w-full');
      
      // Ensure page navigation completed
      console.log('Waiting for navigation to inbox...');
      await this.page.waitForNavigation({ timeout: 15000 });
      
      // Extract email address from URL or content
      console.log('Extracting email address...');
      
      // Wait for the page to fully load after navigation
      await this.page.waitForLoadState('networkidle');
      
      // Get the current URL
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Extract the mailbox name from the URL with more robust regex
      const mailboxMatch = currentUrl.match(/[\?&]mailbox=([^&]+)/);
      
      if (mailboxMatch && mailboxMatch[1]) {
        const mailboxName = decodeURIComponent(mailboxMatch[1]);
        this.tempEmail = `${mailboxName}@maildrop.cc`;
        
        console.log(`Extracted email from URL: ${this.tempEmail}`);
        
        // Double-check by extracting from the page content with more wait time
        try {
          // Wait for the text content to be available
          await this.page.waitForSelector('div.text-center.text-xl', { 
            state: 'visible', 
            timeout: 10000 
          });
          
          const emptyMailboxText = await this.page.textContent('div.text-center.text-xl');
          console.log(`Found text content: ${emptyMailboxText}`);
          
          const emailMatch = emptyMailboxText.match(/The mailbox ([^\s@]+@maildrop\.cc) is currently empty/);
          
          if (emailMatch && emailMatch[1]) {
            // Use the email from the page content as it's more reliable
            this.tempEmail = emailMatch[1];
            console.log(`Extracted email from page content: ${this.tempEmail}`);
          }
        } catch (error) {
          console.log('Could not extract email from page content, using URL extraction instead:', error.message);
        }
        
        console.log(`Temporary email created: ${this.tempEmail}`);
        
        // Store the temp email in CustomerDataStore
        CustomerDataStore.set('email', this.tempEmail);
        
        // Keep the browser open for debugging
        console.log('Maildrop browser ready for email monitoring');
        
        // Start monitoring for incoming emails
        this.startEmailMonitoring();
        
        // Set timeout to automatically close browser after 3 minutes for testing
        console.log('Browser will be kept open for 3 minutes for testing...');
        this.autoCloseTimeout = setTimeout(async () => {
          console.log('Auto-closing browser after 3-minute test period');
          await this.cleanup();
        }, 180000); // 3 minutes in milliseconds
        
      } else {
        throw new Error('Failed to extract mailbox name from URL');
      }
      
    } catch (error) {
      console.error('Error during email verification setup:', error);
      await this.cleanup();
      
      // Generate a fallback email as a last resort
      const fallbackEmail = `fallback-${Date.now()}@example.com`;
      console.log(`Using fallback email due to error: ${fallbackEmail}`);
      CustomerDataStore.set('email', fallbackEmail);
    }
    
    // Return to allow concurrent operation
    return;
  }
  
  async waitForSelector(selector, timeout = 10000) {
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
  
  async startEmailMonitoring() {
    console.log('Starting email monitoring...');
    
    // Set up a monitoring loop to check for new emails
    this.monitoringInterval = setInterval(async () => {
      if (!this.page || !this.browser) {
        console.log('Browser or page not available, stopping monitoring');
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
          this.monitoringInterval = null;
        }
        return;
      }
      
      try {
        // Check if we're still on the inbox page
        if (!this.page.url().includes('maildrop.cc/inbox')) {
          console.log('Navigating back to inbox page...');
          await this.page.goto(`https://maildrop.cc/inbox/?mailbox=${this.tempEmail.split('@')[0]}`);
          await this.page.waitForLoadState('networkidle');
        }
        
        // Refresh the page to check for new emails
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
        
        // Check if there are any emails (look for elements that aren't the "empty" message)
        const hasEmptyMessage = await this.waitForSelector('div.text-center.text-xl', 5000);
        
        if (hasEmptyMessage) {
          const emptyText = await this.page.textContent('div.text-center.text-xl');
          if (!emptyText.includes('empty')) {
            console.log('Mailbox appears to have content');
            
            // Look for email items
            const hasEmails = await this.waitForSelector('div.email-item', 5000);
            
            if (hasEmails) {
              console.log('New email detected!');
              
              // Click on the first email to view it
              await this.page.click('div.email-item');
              
              // Wait for email content to load
              await this.waitForSelector('div.email-content', 10000);
              
              // Extract email content with better error handling
              let subject = 'No subject';
              let sender = 'Unknown sender';
              let body = 'No content';
              
              try {
                if (await this.waitForSelector('h2.email-subject', 3000)) {
                  subject = await this.page.textContent('h2.email-subject') || subject;
                }
                
                if (await this.waitForSelector('div.email-sender', 3000)) {
                  sender = await this.page.textContent('div.email-sender') || sender;
                }
                
                if (await this.waitForSelector('div.email-body', 3000)) {
                  body = await this.page.textContent('div.email-body') || body;
                }
              } catch (contentError) {
                console.error('Error extracting email content:', contentError);
              }
              
              // Store email details
              const emailData = {
                subject,
                sender,
                body,
                receivedAt: new Date().toISOString()
              };
              
              console.log('Email details:', emailData);
              
              // Store in CustomerDataStore
              CustomerDataStore.set('receivedEmail', emailData);
            }
          } else {
            console.log('Mailbox is still empty');
          }
        }
      } catch (error) {
        console.error('Error while monitoring for emails:', error);
      }
    }, 10000); // Check every 10 seconds
  }
  
  async cleanup() {
    // Clear auto-close timeout if it exists
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
      this.autoCloseTimeout = null;
    }
    
    // Clear monitoring interval if it exists
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    // Close browser if it exists
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (error) {
        console.error('Error closing browser:', error);
      }
      this.browser = null;
      this.page = null;
    }
    
    this.verificationInProgress = false;
  }
  
  async stopVerification() {
    console.log('Stopping email verification service...');
    await this.cleanup();
  }
}

module.exports = new EmailVerificationService();