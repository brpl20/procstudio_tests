// utils.js
const { faker } = require('@faker-js/faker');

faker.locale = 'pt_BR';

function generateRG() {
  return faker.string.numeric(9);
}

function generateCPF() {
  return faker.string.numeric(11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function generateRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateBirthDate(min = 0, max = 100) {
  return faker.date.birthdate({ min, max, mode: 'age' }).toLocaleDateString('pt-BR');
}

module.exports = {
  faker,
  generateRG,
  generateCPF,
  generateRandomItem,
  generateBirthDate,
};