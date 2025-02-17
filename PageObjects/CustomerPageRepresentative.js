const { customFaker, generateRandomItem, selectRandomItemFromOptions } = require('../Utils/utils');
const { getRepresentativeNames } = require('../ApiRequests/representativeStore');
const CustomerDataStore = require('../Helpers/CustomerDataStore');

class CustomerPageRepresentative {
  constructor(page) {
    this.page = page;
  }

  async selectOrCreateRepresentative() {
    try {
        const shouldCreateNew = Math.random() < 0.50;
        const representativeNames = getRepresentativeNames();

        if (!shouldCreateNew && representativeNames.length > 0) {
            console.log('Selecting existing representative...');
            await this.selectExistingRepresentative();
        } else {
            console.log('Creating new representative...');
            await this.createNewRepresentative();
            
            // More specific waiting conditions
            try {
                // Wait for loading to complete (if there's a loading indicator)
                await this.page.waitForTimeout(2000);

                // Try multiple possible success indicators
                const successIndicators = [
                    '[role="option"]',
                    '.MuiAutocomplete-root',
                    '[data-testid="representative-selected"]', // Add if you have this
                    '.representative-info', // Add if you have this
                ];

                let representativeSelected = false;
                for (const indicator of successIndicators) {
                    try {
                        await this.page.waitForSelector(indicator, {
                            state: 'visible',
                            timeout: 3000
                        });
                        console.log(`Representative selection confirmed via ${indicator}`);
                        representativeSelected = true;
                        break;
                    } catch (error) {
                        console.log(`Indicator ${indicator} not found, trying next...`);
                    }
                }

                if (!representativeSelected) {
                    // Final check - verify if we can proceed
                    const canProceed = await this.page.getByRole('button', { name: 'Próximo' }).isEnabled();
                    if (canProceed) {
                        console.log('Representative selection confirmed via enabled Next button');
                        representativeSelected = true;
                    }
                }

                if (!representativeSelected) {
                    throw new Error('Could not confirm representative selection');
                }

            } catch (error) {
                console.log('Warning: Could not verify representative selection, but continuing...');
                // You might want to add additional handling here
            }
        }
    } catch (error) {
        console.error('Error in selectOrCreateRepresentative:', error.message);
        throw error;
    }
}

  async selectExistingRepresentative() {
    console.log('Selecting an existing representative...');
    const representativeNames = getRepresentativeNames();
    const randomName = this.getRandomItem(representativeNames);
    console.log(`Selected name: ${randomName}`);
    await this.page.fill('#multiple-limit-tags', randomName);
    await this.page.press('#multiple-limit-tags', 'Enter');
    
    await this.page.waitForSelector(`[role="option"]:has-text("${randomName}")`);
    await this.page.click(`[role="option"]:has-text("${randomName}")`);
    
    const openButton = await this.page.$('button:has-text("Open")');
    if (openButton) {
      await openButton.click();
    }
    
    await this.page.click('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root');
    
    console.log(`Selected existing representative: ${randomName}`);
    CustomerDataStore.set('representativeName', randomName);
  }

  async selectExistingRepresentativeCompany() {
    console.log('Selecting an existing representative company...');
    const representativeNames = getRepresentativeNames();
    const randomName = this.getRandomItem(representativeNames);
    console.log(`Selected company: ${randomName}`);

    const inputSelector = await this.page.getByRole('combobox', { name: 'Selecione um Representante' });
    await inputSelector.click();
    await inputSelector.fill(randomName);
    await this.page.waitForTimeout(500);
    await inputSelector.press('Enter');
  
    const optionSelector = `[role="option"]:has-text("${randomName}")`;
    await this.page.waitForSelector(optionSelector, { state: 'visible' });
    await this.page.click(optionSelector);
  
    const openButton = await this.page.$('button:has-text("Open")');
    if (openButton) {
      await openButton.click();
    }
  
    console.log(`Selected existing representative company: ${randomName}`);
    CustomerDataStore.set('representativeCompany', randomName);
  }

  async createNewRepresentative() {
    console.log('Creating a new representative...');

    await this.page.getByRole('button', { name: 'Adicionar Representante' }).click();
    
    const modal = await this.page.locator('form').filter({ hasText: 'Dados do Representante' });
    await modal.waitFor({ state: 'visible' });

    const saveButton1 = await this.page.getByText('Salvar');

    // Generate all basic data first
    const firstName = customFaker.firstName();
    const lastName = customFaker.lastName();
    const cpf = customFaker.generateCPF();
    const rg = customFaker.generateRG();
    const birthDate = customFaker.generateBirthDate(0, 100);
    const profession = customFaker.jobTitle();
    const cep = customFaker.zipCode();
    const number = customFaker.buildingNumber();
    const cepVerifyFakerAPI = await customFaker.getAddressByCepCorreio(cep);

    // Fill the basic form fields
    await modal.locator('#outlined-profession').fill(profession);
    await modal.getByPlaceholder('Informe o CEP').fill(cep);
    await modal.getByPlaceholder('Informe o Nome do Representante').fill(firstName);
    await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(lastName);
    await modal.getByPlaceholder('Informe o CPF').fill(cpf);
    await modal.getByPlaceholder('Informe o RG').fill(rg);
    await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDate);
    await modal.getByPlaceholder('N.º').fill(number);

    // Wait for address fields to be populated by API
    await this.page.waitForTimeout(5000);

    // Handle phone and email with improved logic
    const shouldCreateMultiple = Math.random() < 0.50; // 99% chance for multiple during debug
    let phones, emails;
    // await this.page.pause();

    // Inside createNewRepresentative method, replace the phone/email handling section:

    if (shouldCreateMultiple) {
      // Generate multiple phones and emails
      phones = [
          customFaker.generateCellPhoneNumber(),
          customFaker.generateCellPhoneNumber()
      ];
      emails = [
          customFaker.generateEmail(),
          customFaker.generateEmail()
      ];

      try {
          // Try first set of selectors
          const firstPhoneInput = await modal.locator('#outlined-phone');
          const firstEmailInput = await modal.locator('#outlined-email');

          if (await firstPhoneInput.isVisible()) {
              await firstPhoneInput.fill(phones[0]);
          } else {
              // Fallback to alternative selector
              await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).first().fill(phones[0]);
          }

          if (await firstEmailInput.isVisible()) {
              await firstEmailInput.fill(emails[0]);
          } else {
              // Fallback to alternative selector
              await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).first().fill(emails[0]);
          }

          // Handle additional fields
          const addPhoneButton = await modal.locator('#add-phone');
          const addEmailButton = await modal.locator('#add-email');

          if (await addPhoneButton.isVisible()) {
              await addPhoneButton.click();
              await this.page.waitForTimeout(1000);
              try {
                  const secondPhoneInput = await modal.locator('#outlined-phone-1');
                  if (await secondPhoneInput.isVisible()) {
                      await secondPhoneInput.fill(phones[1]);
                  } else {
                      await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).nth(1).fill(phones[1]);
                  }
              } catch (error) {
                  console.log('Second phone field not found with primary selector, trying alternative...');
                  await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).nth(1).fill(phones[1]);
              }
          }

          if (await addEmailButton.isVisible()) {
              await addEmailButton.click();
              await this.page.waitForTimeout(1000);
              try {
                  const secondEmailInput = await modal.locator('#outlined-email-1');
                  if (await secondEmailInput.isVisible()) {
                      await secondEmailInput.fill(emails[1]);
                  } else {
                      await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).nth(1).fill(emails[1]);
                  }
              } catch (error) {
                  console.log('Second email field not found with primary selector, trying alternative...');
                  await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).nth(1).fill(emails[1]);
              }
          }
      } catch (error) {
          console.error('Error handling multiple fields:', error);
          // Fallback to single fields if multiple fails
          await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).first().fill(phones[0]);
          await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).first().fill(emails[0]);
      }
    } else {
      // Single phone and email
      phones = customFaker.generateCellPhoneNumber();
      emails = customFaker.generateEmail();
      
      try {
          const phoneInput = await modal.locator('#outlined-phone');
          const emailInput = await modal.locator('#outlined-email');

          if (await phoneInput.isVisible()) {
              await phoneInput.fill(phones);
          } else {
              await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).first().fill(phones);
          }

          if (await emailInput.isVisible()) {
              await emailInput.fill(emails);
          } else {
              await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).first().fill(emails);
          }
      } catch (error) {
          console.error('Error handling single fields:', error);
          // Fallback to alternative selectors
          await this.page.getByRole('textbox', { name: 'Informe o Telefone' }).first().fill(phones);
          await this.page.getByRole('textbox', { name: 'Informe o E-mail' }).first().fill(emails);
      }
    }

    // Get and store address fields (filled by API)
    const street = await modal.locator('#outlined-street').inputValue();
    const neighborhood = await modal.locator('#outlined-neighborhood').inputValue();
    const city = await modal.locator('#outlined-city').inputValue();
    const state = await modal.locator('#outlined-state').inputValue();

    const complement = customFaker.addressComplement();
    await modal.locator('#outlined-description').fill(complement);

    const nationality = await this.selectDropdownOption(modal, 'nationality', ['Brasileiro', 'Estrangeiro']);
    const gender = await this.selectDropdownOption(modal, 'gender', ['Masculino', 'Feminino']);
    const civilStatus = await this.selectDropdownOption(modal, 'civil_status', ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']);
    
    await saveButton1.click();

    await this.page.waitForSelector('form:has-text("Dados do Representante")', { state: 'hidden' });

    console.log('Representative created successfully');

    // Store data for verification (19 fields)
    CustomerDataStore.set('representativeaddressByCepFakerAPI', cepVerifyFakerAPI);
    CustomerDataStore.set('representativeFirstName', firstName);
    CustomerDataStore.set('representativeLastName', lastName);
    CustomerDataStore.set('representativeCPF', cpf);
    CustomerDataStore.set('representativeRG', rg);
    CustomerDataStore.set('representativeBirthDate', birthDate);
    CustomerDataStore.set('representativeNumber', number);
    CustomerDataStore.set('representativeProfession', profession);
    CustomerDataStore.set('representativeCEP', cep);
    CustomerDataStore.set('representativePhone', phones);
    CustomerDataStore.set('representativeEmail', emails);
    CustomerDataStore.set('representativeStreet', street);
    CustomerDataStore.set('representativeNeighborhood', neighborhood);
    CustomerDataStore.set('representativeCity', city);
    CustomerDataStore.set('representativeState', state);
    CustomerDataStore.set('representativeComplement', complement);
    CustomerDataStore.set('representativeNationality', nationality);
    CustomerDataStore.set('representativeGender', gender);
    CustomerDataStore.set('representativeCivilStatus', civilStatus);
}

  async selectDropdownOption(container, fieldName, options) {
    const randomOption = generateRandomItem(options);
    console.log(`Selecting random option: ${randomOption} from ${fieldName} dropdown`);

    await container.locator(`#mui-component-select-${fieldName}`).click();
    await this.page.waitForSelector('ul[role="listbox"]');
    await this.page.locator(`#menu-${fieldName} div`).filter({ hasText: randomOption }).click();

    console.log(`Selected ${fieldName}: ${randomOption}`);
    return randomOption;
  }

  getRandomItem(array) {
    return generateRandomItem(array);
  }
}

module.exports = CustomerPageRepresentative;