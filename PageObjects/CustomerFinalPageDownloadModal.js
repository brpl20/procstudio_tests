// CustomerFinalPageDownloadModal.js
const path = require('path');
const fs = require('fs');

class DownloadModal {
    constructor(page) {
        this.page = page;
    }


    // async testSelectors() {
    //     const downloadModalElements = [
    //         {
    //             name: 'Download Modal',
    //             selectors: [
    //                 { name: 'Title', selector: 'label:text("Arquivos para Download")' },
    //                 { name: 'Customer Name', selector: 'h6.MuiTypography-subtitle1[style*="color: rgb(38, 185, 154)"]' },
    //                 { name: 'Download Link', selector: 'h6:has-text("Procuração Simples")' },
    //                 { name: 'Close Button', selector: 'button:has-text("Fechar")' },
    //             ]
    //         }
    //     ];

    //     for (const element of downloadModalElements) {
    //         console.log(`Testing selectors for ${element.name}:`);
    //         for (const { name, selector } of element.selectors) {
    //             try {
    //                 const elementHandle = await this.page.locator(selector).first();
    //                 const isVisible = await elementHandle.isVisible();
    //                 console.log(`  ${name} selector: ${selector}`);
    //                 console.log(`    Element found: ${isVisible ? 'Yes (Visible)' : 'Yes (Not visible)'}`);
    //             } catch (error) {
    //                 console.log(`  ${name} selector: ${selector}`);
    //                 console.log(`    Element not found. Error: ${error.message}`);
    //             }
    //             console.log('  ---');
    //         }
    //         console.log('\n');
    //     }
    // }

    
    async waitForModalAndDownload() {
        try {
            // Wait for the modal to appear
            const modal = await this.page.waitForSelector('text="Arquivos para Download"', { state: 'visible', timeout: 5000 });
            console.log("Modal is now visible");
    
            // Define the download directory within the repository
            const downloadDir = path.join(process.cwd(), 'Downloads'); // Absolute path to /Downloads in the repo
    
            // Ensure the /Downloads directory exists
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true }); // Create the directory if it doesn't exist
                console.log(`Created directory: ${downloadDir}`);
            }
    
            // Set up promises for the download event
            const downloadPromise = this.page.waitForEvent('download'); // Waits for the download to start
    
            // Click the "Procuração Simples" heading to initiate the download
            await this.page.getByRole('heading', { name: 'Procuração Simples' }).click();
    
            // Wait for the download to complete
            const download = await downloadPromise;
    
            // Save the file to the /Downloads folder in the repository
            const customFilePath = path.join(downloadDir, 'procuracao-simples.docx');
            await download.saveAs(customFilePath);
            console.log(`File saved to: ${customFilePath}`);
    
            console.log("Modal Foi Clicado");
            return modal;
        } catch (error) {
            console.error('Modal did not appear within the timeout period:', error);
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