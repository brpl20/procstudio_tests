const { faker } = require('@faker-js/faker');
const fakerbr = require('faker-br');

faker.locale = 'pt_BR';

async function selectRandomItemFromOptions(options) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('Options must be a non-empty array');
  }
  const randomOption = options[Math.floor(Math.random() * options.length)];
  return randomOption;
}

function generateRG() {
  return faker.string.numeric(9);
}

function generateRandomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Array must be a non-empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

function generateBirthDate(min = 0, max = 100) {
  return faker.date.birthdate({ min, max, mode: 'age' }).toLocaleDateString('pt-BR');
}

module.exports = {
  faker,
  fakerbr,
  selectRandomItemFromOptions,
  generateRG,
  generateRandomItem,
  generateBirthDate,
};