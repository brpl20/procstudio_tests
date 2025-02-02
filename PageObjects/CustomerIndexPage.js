// PageObjects/CustomerIndexPage.js
class CustomerIndexPage {
    constructor(page) {
      this.page = page;
    }
  
    async navigateToNewCustomerMenu() {
      await this.page.locator('a').first().click();
      await this.page.getByRole('heading', { name: 'Adicionar' }).click();
      // Wait for the menu to appear
      await this.page.waitForTimeout(1000);
    }
  
    async createPessoaFisica() {
      await this.navigateToNewCustomerMenu();
      await this.page.getByRole('link', { name: 'Pessoa Fisica' }).click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async createPessoaJuridica() {
      await this.navigateToNewCustomerMenu();
      await this.page.getByRole('link', { name: 'Pessoa Juridica' }).click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async createContador() {
      await this.navigateToNewCustomerMenu();
      await this.page.getByRole('link', { name: 'Contador' }).click();
      await this.page.waitForLoadState('networkidle');
    }
  
    async createRepresentanteLegal() {
      await this.navigateToNewCustomerMenu();
      await this.page.getByRole('link', { name: 'Representante Legal' }).click();
      await this.page.waitForLoadState('networkidle');
    }
  }
  
  module.exports = CustomerIndexPage;