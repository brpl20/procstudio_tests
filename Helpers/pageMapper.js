// pageMapper.js
const { chromium } = require('playwright');
const fs = require('fs').promises;
const config = require('../config');
const LandingPage = require('../PageObjects/LandingPage');
const LoginPage = require('../PageObjects/LoginPage');

// TD: Fix Trabalho -> Need form validators to push "next" button
const routes = [
  '/cadastrar?type=cliente/contador',
  '/cadastrar?type=cliente/representante',
  // '/cadastrar?type=trabalho',
  '/cadastrar?type=tarefa',
  '/cadastrar?type=usuario',
  '/cadastrar?type=escritorio'
];

async function mapPage(page) {
  // Find fillable form elements
  const textInputs = await page.$$('input[type="text"], input[type="email"], input[type="password"]');
  const dateInputs = await page.$$('input[type="date"]');
  const dropdowns = await page.$$('select');

  const formElements = {
    textInputs: await Promise.all(textInputs.map(async (input) => ({
      name: await input.getAttribute('name'),
      isRequired: await input.getAttribute('required') !== null,
    }))),
    dateInputs: await Promise.all(dateInputs.map(async (input) => ({
      name: await input.getAttribute('name'),
      isRequired: await input.getAttribute('required') !== null,
    }))),
    dropdowns: await Promise.all(dropdowns.map(async (select) => ({
      name: await select.getAttribute('name'),
      isRequired: await select.getAttribute('required') !== null,
    }))),
  };

  // Fill default values for required fields
  for (const input of formElements.textInputs) {
    if (input.isRequired) {
      await page.fill(`input[name="${input.name}"]`, 'Default Text');
    }
  }
  for (const dateInput of formElements.dateInputs) {
    if (dateInput.isRequired) {
      await page.fill(`input[name="${dateInput.name}"]`, '2025-01-01');
    }
  }
  for (const dropdown of formElements.dropdowns) {
    if (dropdown.isRequired) {
      await page.selectOption(`select[name="${dropdown.name}"]`, { index: 0 });
    }
  }

  // Detailed element mapping
  const elements = {
    forms: await page.$$('form'),
    inputs: await page.$$('input'),
    selects: await page.$$('select'),
    checkboxes: await page.$$('input[type="checkbox"]'),
    radios: await page.$$('input[type="radio"]'),
    textareas: await page.$$('textarea'),
    buttons: await page.$$('button'),
  };

  const elementDetails = {};
  for (const [key, value] of Object.entries(elements)) {
    elementDetails[key] = {
      count: value.length,
      details: await Promise.all(value.map(async (el) => ({
        name: await el.getAttribute('name'),
        id: await el.getAttribute('id'),
        type: await el.getAttribute('type'),
        value: await el.getAttribute('value'),
        isRequired: await el.getAttribute('required') !== null,
      })))
    };
  }
  
  const nextButton = await page.$('button:has-text("Próximo")');
  const saveButton = await page.$('button:has-text("Salvar")');

  return {
    url: page.url(),
    formElements,
    elementDetails,
    hasNextButton: !!nextButton,
    hasSaveButton: !!saveButton,
  };
}

async function mapPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    await page.goto('https://staging_adm.procstudio.com.br/');
    const landingPage = new LandingPage(page);
    await landingPage.navigateToLogin();
    const loginPage = new LoginPage(page);
    await loginPage.login(config.LOGIN_EMAIL, config.LOGIN_PASSWORD);

    let results = [];

    for (const route of routes) {
      await page.goto(`https://staging_adm.procstudio.com.br${route}`);
      let pageResults = [];

      do {
        const pageMap = await mapPage(page);
        pageResults.push(pageMap);

        if (pageMap.hasNextButton) {
          await page.click('button:has-text("Próximo")');
          await page.waitForNavigation();
        } else {
          break;
        }
      } while (true);

      results.push({ route, pages: pageResults });
    }

    // Save results to a log file
    await fs.writeFile('page_mapping_results.json', JSON.stringify(results, null, 2));
    console.log('Page mapping completed. Results saved to page_mapping_results.json');

  } catch (error) {
    console.error('Error during page mapping:', error);
  } finally {
    await browser.close();
  }
}

mapPages();