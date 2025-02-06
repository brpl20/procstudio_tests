// helpers/formHelper.js

/**
 * Finds all fillable form elements on the page, organized by type.
 * @param {import('playwright').Page} page - The Playwright page object.
 * @returns {Promise<Object>} - Object containing arrays of different types of form elements.
 */
async function findFillableFormElements(page) {
  const formElements = await page.evaluate(() => {
    const forms = document.querySelectorAll('form');
    const elements = {
      textInputs: [],
      dropdowns: [],
      checkboxes: [],
      radioButtons: [],
      textareas: [],
      dateInputs: [],
      numberInputs: [],
      emailInputs: [],
      passwordInputs: [],
      otherInputs: []
    };

    forms.forEach(form => {
      form.querySelectorAll('input, select, textarea').forEach(el => {
        const elementInfo = {
          tagName: el.tagName.toLowerCase(),
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          value: el.value,
          isRequired: el.required
        };

        switch (el.tagName.toLowerCase()) {
          case 'input':
            switch (el.type) {
              case 'text':
                elements.textInputs.push(elementInfo);
                break;
              case 'checkbox':
                elements.checkboxes.push(elementInfo);
                break;
              case 'radio':
                elements.radioButtons.push(elementInfo);
                break;
              case 'date':
                elements.dateInputs.push(elementInfo);
                break;
              case 'number':
                elements.numberInputs.push(elementInfo);
                break;
              case 'email':
                elements.emailInputs.push(elementInfo);
                break;
              case 'password':
                elements.passwordInputs.push(elementInfo);
                break;
              default:
                elements.otherInputs.push(elementInfo);
            }
            break;
          case 'select':
            elements.dropdowns.push(elementInfo);
            break;
          case 'textarea':
            elements.textareas.push(elementInfo);
            break;
        }
      });
    });

    return elements;
  });

  console.log('Form elements found:');
  for (const [key, value] of Object.entries(formElements)) {
    console.log(`${key}: ${value.length}`);
  }

  return formElements;
}

module.exports = { findFillableFormElements };