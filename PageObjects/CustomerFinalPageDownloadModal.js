// PageObjects/DownloadModal.js
class DownloadModal {
    constructor(page) {
      this.page = page;
    }
  
    async testSelectors() {
      const downloadModalElements = [
        {
          name: 'Download Modal',
          selectors: [
            { name: 'Title', selector: 'label:text("Arquivos para Download")' },
            { name: 'Customer Name', selector: 'h6.MuiTypography-subtitle1[style*="color: rgb(38, 185, 154)"]' },
            { name: 'Download Link', selector: 'h6:has-text("Procuração Simples")' },
            { name: 'Close Button', selector: 'button:has-text("Fechar")' },
          ]
        }
      ];
  
      for (const element of downloadModalElements) {
        console.log(`Testing selectors for ${element.name}:`);
        for (const { name, selector } of element.selectors) {
          try {
            const elementHandle = await this.page.locator(selector).first();
            const isVisible = await elementHandle.isVisible();
            console.log(`  ${name} selector: ${selector}`);
            console.log(`    Element found: ${isVisible ? 'Yes (Visible)' : 'Yes (Not visible)'}`);
          } catch (error) {
            console.log(`  ${name} selector: ${selector}`);
            console.log(`    Element not found. Error: ${error.message}`);
          }
          console.log('  ---');
        }
        console.log('\n');
      }
    }
  
    async waitForModal() {
        try {
          const modal = await this.page.waitForSelector('div[class*="sc-d5b4b691-0"]', { 
            state: 'visible', 
            timeout: 10000 
          });
          return modal;
        } catch (error) {
          console.error('Modal did not appear within the timeout period:', error);
          throw error;
        }
      }

    
    async initiateDownload() {
        try {
        const modal = await this.waitForModal();
        const elements = await this.page.$$('h6, span');
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          const tagName = await el.evaluate(node => node.tagName);
          const textContent = await el.textContent();
          const innerHTML = await el.evaluate(node => node.innerHTML);
          const outerHTML = await el.evaluate(node => node.outerHTML);
          const attributes = await el.evaluate(node => {
            const attrs = {};
            for (let attr of node.attributes) {
              attrs[attr.name] = attr.value;
            }
            return attrs;
          });
    
          console.log(`Element ${i + 1}:`);
          console.log(`  Tag: ${tagName}`);
          console.log(`  Text Content: ${textContent}`);
          console.log(`  Inner HTML: ${innerHTML}`);
          console.log(`  Outer HTML: ${outerHTML}`);
          console.log(`  Attributes:`, attributes);
          console.log('---');
        }

          // Use a more specific selector
        //   const element = this.page.locator('h6, span').filter({ hasText: 'Procuração Simples' }).first();
          const element = await modal.locator('h6.MuiTypography-root.MuiTypography-h6:has-text("Gerar Procuração Simples")');
          await element.waitFor({ state: 'visible', timeout: 5000 });
          await element.click();
          console.log("Clicked download link");
          
          // Wait for a short time to allow any potential download to start
          await this.page.waitForTimeout(2000);
        } catch (error) {
          console.error('Error during download initiation:', error);
          throw error;
        }
      }
        
  
    async closeModal() {
      const closeButton = await this.page.locator('button:has-text("Fechar")');
      await closeButton.click();
      console.log("Clicked close button on download modal");
      
      // Wait for the modal to disappear
      await this.page.waitForSelector('div[class*="sc-d5b4b691-0"]', { state: 'hidden', timeout: 5000 });
      console.log("Download modal closed");
    }
  }
  
  module.exports = DownloadModal;