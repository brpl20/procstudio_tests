// PageObjects/LoginPage.js
class LoginPage {
    constructor(page) {
      this.page = page;
    }
  
    async login(email, password) {
      await this.page.fill('#email-address', email);
      await this.page.fill('#password', password);
      await this.page.press('#password', 'Enter');
      await this.page.waitForLoadState('networkidle');
    }
  }
  
  module.exports = LoginPage;