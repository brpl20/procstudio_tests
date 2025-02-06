// helpers/formHelper.js

/**
 * Finds all fillable form elements on the page.
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<Array<import('playwright').ElementHandle>>} - Array of fillable elements.
 */
async function findFillableFormElements(page) {
    const fillableElements = await page.$$(
      'input:not([type="hidden"]):not([readonly]), textarea:not([readonly]), [contenteditable="true"]'
    );
    console.log(`Found ${fillableElements.length} fillable elements.`);
    return fillableElements;
  }
  
  module.exports = { findFillableFormElements };