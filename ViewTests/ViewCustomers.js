// ViewTests/ViewCustomers.js
const config = require('../config');

class ViewCustomers {
  constructor(page) {
    this.page = page;
    this.noCustomersMessage = 'div.MuiDataGrid-overlay:has-text("Nenhum cliente encontrado")';
    this.customerIdCell = 'div[data-field="id"] .MuiDataGrid-cellContent';
    this.customerEmailCell = 'div.MuiDataGrid-cellContent[title*="@gmail.com"]';
    this.customerCpfCell = 'div[data-field="cpf"] .MuiDataGrid-cellContent';
    this.customerContactCell = 'div[data-field="contact"] .MuiDataGrid-cellContent';
  }

  async navigate() {
    // Use the base URL from config
    await this.page.goto(`${config.STAGING_PAGE}/clientes`);
    // Wait for the page to load completely
    await this.page.waitForLoadState('networkidle');
  }

  async checkEmptyCustomerList() {
    // Navigate to the customers page
    await this.navigate();
    
    // Check if the "no customers found" message is visible
    const noCustomersElement = this.page.locator(this.noCustomersMessage);
    const isVisible = await noCustomersElement.isVisible();
    
    return {
      noCustomersMessageVisible: isVisible,
      message: isVisible ? 'No customers message is displayed correctly' : 'No customers message is not displayed'
    };
  }

  async checkCustomerListElements() {
    // Navigate to the customers page
    await this.navigate();
    
    // Check for the presence of customer data elements
    const idElement = this.page.locator(this.customerIdCell);
    const emailElement = this.page.locator(this.customerEmailCell);
    const cpfElement = this.page.locator(this.customerCpfCell);
    const contactElement = this.page.locator(this.customerContactCell);
    
    // Check if all elements are visible
    const idVisible = await idElement.isVisible();
    const emailVisible = await emailElement.isVisible();
    const cpfVisible = await cpfElement.isVisible();
    const contactVisible = await contactElement.isVisible();
    
    // Get the text content of these elements (for verification purposes)
    const idText = idVisible ? await idElement.textContent() : null;
    const emailText = emailVisible ? await emailElement.textContent() : null;
    const cpfText = cpfVisible ? await cpfElement.textContent() : null;
    const contactText = contactVisible ? await contactElement.textContent() : null;
    
    return {
      allElementsVisible: idVisible && emailVisible && cpfVisible && contactVisible,
      elements: {
        id: { visible: idVisible, text: idText },
        email: { visible: emailVisible, text: emailText },
        cpf: { visible: cpfVisible, text: cpfText },
        contact: { visible: contactVisible, text: contactText }
      }
    };
  }
}

module.exports = ViewCustomers;