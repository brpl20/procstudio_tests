// CustomerFinalPageDownloadModal.js
const path = require('path');

class DownloadModal {
    constructor(page) {
        this.page = page;
    }

    <h6 class="MuiTypography-root MuiTypography-subtitle1 mui-style-16rlg6l" id="download-document" style="font-weight: 400; font-size: 18px; color: rgb(18, 18, 20); display: flex; align-items: center; cursor: pointer; gap: 8px;"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" color="#01013D" height="20" width="20" xmlns="http://www.w3.org/2000/svg" style="color: rgb(1, 1, 61);"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"></path><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"></path></svg>Procuração Simples</h6>

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
            const modal = await this.page.waitForSelector('text="Arquivos para Download"', { state: 'visible', timeout: 5000 });
            console.log("Modal is now visible");
            return modal;
        } catch (error) {
            console.error('Modal did not appear within the timeout period:', error);
            throw error;
        }
    }

    async initiateDownload3(maxRetries = 3) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
              await this.waitForModal();
              console.log("Modal is now visible");
  
              // Wait for the download link to be visible
              const downloadButtonFinalBlerbow = await this.page.waitForSelector('h6:has-text("Gerar Procuração Simples")', { state: 'visible', timeout: 5000 });
              console.log("Download link found");
              await downloadButtonFinalBlerbow.click();
              // console.log(downloadButtonFinalBlerbow)
              
              const text = await downloadButtonFinalBlerbow.innerText();
              console.log("Element text:", text);
              console.log("---------------------");
              
              const tagName = await downloadButtonFinalBlerbow.evaluate(el => el.tagName);
              await tagName.click();

              console.log("Element tag:", tagName);
              console.log("---------------------");

              const isVisible = await downloadButtonFinalBlerbow.isVisible();
              console.log("Is visible:", isVisible);
              console.log("---------------------");

              const attributes = await downloadButtonFinalBlerbow.evaluate(el => {
                return Object.fromEntries(
                    Array.from(el.attributes).map(attr => [attr.name, attr.value])
                );
              });
            console.log("Element attributes:", attributes)
              console.log("---------------------");
            
            const href = await downloadButtonFinalBlerbow.getAttribute('href');
            console.log("href:", href);

              await this.page.waitForTimeout(3000);
              // Use page.click() instead of elementHandle.click()
              // await this.page.click(downloadButtonFinalBlerbow);
              // await this.page.click('h6.MuiTypography-root:has-text("Gerar Procuração Simples")');
  
              // Wait for a short time to allow any potential download to start
  
              // console.log("Download initiated successfully");
              return; // Exit the function if successful
          } catch (error) {
              console.error(`Attempt ${attempt} failed:`, error);
              if (attempt === maxRetries) {
                  throw new Error(`Failed to initiate download after ${maxRetries} attempts`);
              }
              // Wait a bit before retrying
              await this.page.waitForTimeout(1000);
          }
      }
  }

    async initiateDownload2() {
      try {
          await this.waitForModal();
          console.log("Modal is now visible");
  
          // Wait for the download link to be visible
          const downloadLink = await this.page.waitForSelector('h6:has-text("Gerar Procuração Simples")', { state: 'visible', timeout: 5000 });
          console.log("Download link found");
  
          // Click the download link
          await downloadLink.click();
          console.log("Clicked download link");
  
          // Wait for a short time to allow any potential download to start
          await this.page.waitForTimeout(2000);
  
          console.log("Download initiated successfully");
      } catch (error) {
          console.error('Error during download initiation:', error);
          throw error;
      }
  }

    async initiateDownload() {
        try {
            const modal = await this.waitForModal();
            const elements = await this.page.$$('text="Arquivos para Download"');
            console.log(`Found ${elements.length} elements with text "Arquivos para Download"`);

            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                const tagName = await el.evaluate(node => node.tagName);
                const textContent = await el.evaluate(node => node.textContent);
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

            try {
                const element = await this.page.waitForSelector('h6.MuiTypography-root.MuiTypography-h6:has-text("Gerar Procuração Simples")', { state: 'visible', timeout: 5000 });
                await element.click();
                console.log("Clicked download link using selector");
            } catch (error) {
                console.log("Selector method failed, trying image recognition...");
                // Uncomment and implement image recognition if needed
                // await this.initiateDownloadUsingImage();
            }

            await this.page.waitForTimeout(2000);
        } catch (error) {
            console.error('Error during download initiation:', error);
            throw error;
        }
    }

    async closeModal() {
        const closeButton = await this.page.waitForSelector('button:has-text("Fechar")', { state: 'visible', timeout: 5000 });
        await closeButton.click();
        console.log("Clicked close button on download modal");

        try {
            await this.page.waitForSelector('div[class*="sc-d5b4b691-0"]', { state: 'hidden', timeout: 5000 });
            console.log("Download modal closed");
        } catch (error) {
            console.error("Modal did not close within the expected time:", error);
        }
    }

    // Uncomment and implement image recognition methods if needed
    // async initiateDownloadUsingImage() { ... }
    // async findImageOnPage(templatePath) { ... }
}

module.exports = DownloadModal;