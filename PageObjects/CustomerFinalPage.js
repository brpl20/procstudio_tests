// PageObjects/CustomerFinalPage.js
const { faker, fakerbr } = require('../Utils/utils');
const path = require('path');
const DownloadModal = require('./CustomerFinalPageDownloadModal');

async function testSelectors(page) {
  const elements = [
    {
      name: 'Generate Documents Checkbox',
      selectors: [
        { name: 'Name attribute', selector: 'input[name="issue_documents"]' },
        { name: 'Class', selector: '.PrivateSwitchBase-input' },
      ]
    },
    {
      name: 'Finish Button',
      selectors: [
        { name: 'Text content', selector: 'button:has-text("Finalizar")' },
        { name: 'Class', selector: '.MuiButton-containedSecondary' },
      ]
    },
    {
      name: 'Confirmation Modal',
      selectors: [
        { name: 'Title', selector: 'label:text("Finalizar Cadastro")' },
        { name: 'Content', selector: 'h6:text("Você tem certeza que deseja finalizar o cadastro?")' },
      ]
    },
    {
      name: 'Modal Buttons',
      selectors: [
        { name: 'Cancel Button', selector: 'button:has-text("Cancelar")' },
        { name: 'Save Button', selector: 'button:has-text("Salvar")' },
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
        
        if (isVisible && element.name === 'Generate Documents Checkbox') {
          const isChecked = await elementHandle.isChecked();
          console.log(`    Current state: ${isChecked ? 'Checked' : 'Unchecked'}`);
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

class CustomerFinalPage {
  constructor(page) {
    this.page = page;
    this.downloadModal = new DownloadModal(page);
  }

  async toggleGenerateDocuments() {
    const checkbox = await this.page.locator('input[name="issue_documents"]');
    const currentState = await checkbox.isChecked();
    
    // Toggle the checkbox
    await checkbox.click();
    
    // Optionally, verify that the state has changed
    const newState = await checkbox.isChecked();
    
    if (newState === currentState) {
      throw new Error('Checkbox state did not change after clicking');
    }
    
    console.log(`Checkbox toggled from ${currentState} to ${newState}`);
  }

//   async toggleGenerateDocuments() {
//     const checkbox = await this.page.locator('#issue_documents');
//     const currentState = await checkbox.isChecked();
//     console.log("Generate documents: ON");

    // TD: Implementar randomizacao no futuro 
    // if (faker.datatype.boolean()) {
    //   const currentState = await checkbox.isChecked();
    //   if (!currentState) {
    //     await checkbox.check();
    //   }
    //   console.log("Generate documents: ON");
    // } else {
    //   await checkbox.uncheck();
    //   console.log("Generate documents: OFF");
    // }

  async clickFinishButton() {
    const finishButton = await this.page.locator('button:has-text("Finalizar")');
    await finishButton.click();
    console.log("Clicked Finish button");
  }

  async handleConfirmationModal() {
    // Wait for the modal to appear
    await this.page.waitForSelector('label:text("Finalizar Cadastro")');
    console.log("Confirmation modal appeared");

    this.waitForModal

    // Click the final save button
    const saveButton = await this.page.locator('button:has-text("Salvar")');
    await saveButton.click();
    console.log("Clicked final Save button");
  }

  async handleDownloadModal() {
    await this.downloadModal.waitForModalAndDownload();
    await this.downloadModal.closeModal();
  }

  async completeFinalStep() {
    await this.toggleGenerateDocuments();
    await this.clickFinishButton();
    await this.handleConfirmationModal();
    await this.handleDownloadModal();
  }
}

module.exports = CustomerFinalPage;