const { chromium } = require('playwright');
const { faker } = require('@faker-js/faker');
const { login, fetchCustomers } = require('./api-requests');

faker.locale = 'pt_BR';

let customersWithRepresentatives = [];

function fakeRG() {
  return "123456789";
}

function fakeCPF() {
  return "123.456.789-00";
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login('adminfront@procstudio.com.br', '123456Af!@');
    const customers = await fetchCustomers();
    // console.log(customers);
    console.log('All customers:', JSON.stringify(customers, null, 2));
    console.log('Number of customers:', customers.data.length);

    await page.goto('https://staging_adm.procstudio.com.br/');
    await page.getByRole('navigation').getByRole('button', { name: 'menu' }).click();

    const email = 'adminfront@procstudio.com.br';
    const password = '123456Af!@';
    await page.fill('#email-address', email);
    await page.fill('#password', password);
    await page.press('#password', 'Enter');

    await page.waitForLoadState('networkidle');

    await page.goto('https://staging_adm.procstudio.com.br/cadastrar?type=cliente/pessoa_fisica');

    await page.fill('input[name="name"]', faker.person.firstName());
    await page.fill('input[name="last_name"]', faker.person.lastName());
    await page.fill('input[name="rg"]', fakeRG());
    await page.fill('input[name="cpf"]', fakeCPF());

    const nationalities = ['Brasileiro', 'Estrangeiro'];
    const randomNationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    await page.locator('#mui-component-select-nationality').click();
    await page.getByRole('option', { name: randomNationality }).click();
    await page.waitForTimeout(1000);
    console.log(`Selected nationality: ${randomNationality}`);

    const birthDate = faker.date.birthdate({ min: 0, max: 100, mode: 'age' });
    const formattedBirthDate = birthDate.toLocaleDateString('pt-BR');
    await page.getByRole('textbox', { name: 'DD/MM/YYYY' }).fill(formattedBirthDate);
    console.log(`Generated birth date: ${formattedBirthDate}`);

    const genders = ['Masculino', 'Feminino'];
    const randomGender = genders[Math.floor(Math.random() * genders.length)];
    await page.locator('#mui-component-select-gender').click();
    await page.getByRole('option', { name: randomGender }).click();
    await page.waitForTimeout(1000);
    console.log(`Selected gender: ${randomGender}`);

    const civilStatusOptions = ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável'];
    const randomCivilStatus = civilStatusOptions[Math.floor(Math.random() * civilStatusOptions.length)];
    await page.locator('#mui-component-select-civil_status').click();
    await page.getByRole('option', { name: randomCivilStatus }).click();
    await page.waitForTimeout(1000);
    console.log(`Selected civil status: ${randomCivilStatus}`);

    const capacities = ['Capaz', 'Relativamente Incapaz', 'Absolutamente Incapaz'];
    const randomCapacity = capacities[Math.floor(Math.random() * capacities.length)];
    await page.locator('#mui-component-select-capacity').click();
    await page.getByRole('option', { name: randomCapacity }).click();
    console.log(`Selected civil capacity: ${randomCapacity}`);

    if (randomCapacity !== 'Capaz') {
      console.log('Adding a representative...');
      await addRepresentative(page);
    }

    await page.click('#submit_button_id');
    await page.waitForTimeout(5000);

    console.log('Form submitted successfully!');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})();

async function addRepresentative(page) {
  const shouldCreateNewRepresentative = Math.random() < 0.5;

  if (shouldCreateNewRepresentative) {
    await createNewRepresentative(page);
  } else {
    console.log('Picking an existing representative...');
    if (customersWithRepresentatives.length > 0) {
      const randomRepresentative = customersWithRepresentatives[Math.floor(Math.random() * customersWithRepresentatives.length)];
      console.log(`Selected existing representative: ${randomRepresentative.representative.name}`);

      await page.getByRole('button', { name: 'Adicionar Representante' }).click();
      const modal = page.locator('div:has-text("Dados do Representante")');

      await modal.getByPlaceholder('Informe o Nome do Representante').fill(randomRepresentative.representative.name);
      await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(randomRepresentative.representative.last_name);
      await modal.getByPlaceholder('Informe o CPF').fill(randomRepresentative.representative.cpf);
      await modal.getByPlaceholder('Informe o RG').fill(randomRepresentative.representative.rg);

      await modal.getByRole('button', { name: 'Salvar' }).click();
    } else {
      console.log('No existing representatives found. Creating a new one...');
      await createNewRepresentative(page);
    }
  }
}

async function createNewRepresentative(page) {
  console.log('Creating a new representative...');
  await page.getByRole('button', { name: 'Adicionar Representante' }).click();

  const modal = page.locator('div:has-text("Dados do Representante")');

  await modal.getByPlaceholder('Informe o Nome do Representante').fill(faker.person.firstName());
  await modal.getByPlaceholder('Informe o Sobrenome do Representante').fill(faker.person.lastName());
  await modal.getByPlaceholder('Informe o CPF').fill(fakeCPF());
  await modal.getByPlaceholder('Informe o RG').fill(fakeRG());

  const birthDateRepresentative = faker.date.birthdate({ min: 18, max: 90, mode: 'age' }).toLocaleDateString('pt-BR');
  await modal.getByPlaceholder('DD/MM/YYYY').fill(birthDateRepresentative);

  const nationalitiesRepresentative = ['Brasileiro', 'Estrangeiro'];
  const randomNationalityRepresentative = nationalitiesRepresentative[Math.floor(Math.random() * nationalitiesRepresentative.length)];
  await modal.locator('#mui-component-select-nationality').click();
  await page.getByRole('option', { name: randomNationalityRepresentative }).click();

  const gendersRepresentative = ['Masculino', 'Feminino'];
  const randomGenderRepresentative = gendersRepresentative[Math.floor(Math.random() * gendersRepresentative.length)];
  await modal.locator('#mui-component-select-gender').click();
  await page.getByRole('option', { name: randomGenderRepresentative }).click();

  const civilStatusOptionsRepresentative = ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável'];
  const randomCivilStatusRepresentative = civilStatusOptionsRepresentative[Math.floor(Math.random() * civilStatusOptionsRepresentative.length)];
  await modal.locator('#mui-component-select-civil_status').click();
  await page.getByRole('option', { name: randomCivilStatusRepresentative }).click();

  await modal.getByPlaceholder('Informe o Profissão').fill(faker.person.jobTitle());

  await modal.getByPlaceholder('Informe o CEP').fill('12345-678');
  await modal.getByPlaceholder('Informe o Bairro').fill(faker.location.county());
  await modal.getByPlaceholder('N.º').fill('123');
  await modal.getByPlaceholder('Informe o Cidade').fill(faker.location.city());
  await modal.getByPlaceholder('Informe o Complemento').fill('Apto 101');
  await modal.getByPlaceholder('Informe o Estado').fill(faker.location.state());

  await modal.getByRole('button', { name: 'Salvar' }).click();
  console.log('New representative created successfully.');
}