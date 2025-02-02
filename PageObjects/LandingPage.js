// PageObjects/LandingPage.js
const config = require('../config');

class LandingPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToLogin() {
    await this.page.goto(config.STAGING_PAGE);
    await this.page.getByRole('navigation').getByRole('button', { name: 'menu' }).click();
  }
}

module.exports = LandingPage;