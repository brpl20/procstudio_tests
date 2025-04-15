const { test, expect } = require('@playwright/test');
const CustomerPage = require('../PageObjects/CustomerPage');

test.describe('Customer Registration', () => {
  test('should create a capable customer', async ({ page }) => {
    const customerPage = new CustomerPage(page);
    const customerData = await customerPage.fillCustomerForm('Capaz');
    expect(customerData.capacity).toBe('Capaz');
  });

  test('should create a relatively incapable customer with representative', async ({ page }) => {
    const customerPage = new CustomerPage(page);
    const customerData = await customerPage.fillCustomerForm('Relativamente Incapaz');
    expect(customerData.capacity).toBe('Relativamente Incapaz');
  });
});