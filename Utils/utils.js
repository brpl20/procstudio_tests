const SuperFakerBrasil = require("faker-brasil");
const { faker } = require("@faker-js/faker");
const fakerbr = require("faker-br");

faker.locale = "pt_BR";

class FakerBase extends SuperFakerBrasil {
  constructor() {
    super();
  }
}

class CustomFaker extends FakerBase {
  constructor() {
    super();
    this.fakerTraditional = faker;
    this.fakerbr = fakerbr;
  }

  generateBankInfo(cardFlag = null) {
    return this.fullBank(cardFlag);
  }

  selectRandomBank() {
    const banks = [
      'BCO DO BRASIL S.A.',
      'NU PAGAMENTOS - IP',
      'CAIXA ECONOMICA FEDERAL'
    ];
    return banks[Math.floor(Math.random() * banks.length)];
  }

  generateAgency() {
    return this.fakerTraditional.finance.accountNumber(4);
  }

  generateOperation() {
    return this.fakerTraditional.number.int({ min: 10, max: 99 }).toString();
  }

  generateAccount() {
    return this.fakerTraditional.finance.accountNumber(7);
  }

  generatePix() {
    const pixTypes = ['CPF', 'CNPJ', 'EMAIL', 'PHONE'];
    const randomPixType = pixTypes[Math.floor(Math.random() * pixTypes.length)];

    switch (randomPixType) {
      case 'CPF':
        return this.cpf();
      case 'CNPJ':
        return this.cnpj();
      case 'EMAIL':
        return this.email();
      case 'PHONE':
        return this.phone(true, false);
    }
  }

  generateCompanyName() {
    return this.fakerTraditional.company.name();
  }

  generateBenefitNumber() {
    return `${this.fakerTraditional.string.numeric('###')}.${this.fakerTraditional.string.numeric('###')}.${this.fakerTraditional.string.numeric('###')}-${this.fakerTraditional.string.numeric('#')}`;
  }

  generateNIT() {
    return `${this.fakerTraditional.string.numeric('###')}.${this.fakerTraditional.string.numeric('#####')}.${this.fakerTraditional.string.numeric('##')}-${this.fakerTraditional.string.numeric('#')}`;
  }

  generateMotherName() {
    return this.fakerTraditional.person.fullName({ sex: 'female' });
  }

  generatePassword() {
    return this.fakerTraditional.internet.password({ length: 12, memorable: false, pattern: /[A-Z]/ }) + 
           this.fakerTraditional.string.numeric('#') + 
           this.fakerTraditional.string.symbol();
  }

  generateRG() {
    return this.rg();
  }

  generateCPF(withMask = false) {
    return this.cpf(withMask);
  }

  generateFullName() {
    return this.fullName();
  }

  generateEmail() {
    return this.fakerTraditional.internet.email();
  }

  generateBirthDate(min = 0, max = 100) {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - max,
      today.getMonth(),
      today.getDate()
    );
    const maxDate = new Date(
      today.getFullYear() - min,
      today.getMonth(),
      today.getDate()
    );
    const birthDate = new Date(
      minDate.getTime() +
        Math.random() * (maxDate.getTime() - minDate.getTime())
    );
    return birthDate.toLocaleDateString("pt-BR");
  }

  generatePhoneNumber(withPrefix = false, withMask = false) {
    return this.phone(withPrefix, withMask);
  }

  generateCellPhoneNumber(withPrefix = false, withMask = false) {
    const ddd = this.fakerTraditional.number.int({ min: 11, max: 99 });
    const middleSection = this.fakerTraditional.number.int({ min: 1000, max: 9999 }); // Force 4 digits
    const finalSection = this.fakerTraditional.number.int({ min: 1000, max: 9999 });

    if (withMask) {
      return `${ddd}-${middleSection}-${finalSection}`;
    }
    
    return `${ddd}${middleSection}${finalSection}`;
  }

  jobTitle() {
    return this.fakerTraditional.person.jobTitle();
  }

  generateRandomPerson() {
    return this.newPerson();
  }

  generateRandomAdult() {
    return this.newAdultPerson();
  }

  generateRandomYoungPerson() {
    return this.newPersonYounger();
  }

  generateRandomOlderPerson() {
    return this.newOlderPerson();
  }

  generateRandomAddress() {
    return this.randomFullAddress();
  }

  addressComplement() {
    const fullAddress = this.generateRandomAddress();
    if (fullAddress.complement) {
      return fullAddress.complement;
    } else {
      // If no complement is provided, generate a random one
      const complementTypes = [
        "Apto",
        "Casa",
        "Sala",
        "Loja",
        "Galpão",
        "Bloco",
        "Andar",
      ];
      const randomType =
        this.fakerTraditional.helpers.arrayElement(complementTypes);
      const randomNumber = this.fakerTraditional.number.int({
        min: 1,
        max: 1000,
      });
      return `${randomType} ${randomNumber}`;
    }
  }

  generateRandomAddressWithBuilding() {
    return this.randomFullAddressBuilding();
  }

  buildingNumber() {
    return Math.floor(1 + Math.random() * 9999).toString();
  }

  generateBankInfo(cardFlag = null) {
    return this.fullBank(cardFlag);
  }

  zipCode() {
    return this.fakerbr.address.zipCodeValid();
  }

  async getAddressByCEP(cep) {
    const CEPOR = await this.getAddressByCepCorreio(cep);
    console.log(CEPOR);
    return CEPOR;
  }

  generateProfessionalId(profession) {
    const statePrefix = this.generateRandomStatePrefix();
    const number = Math.floor(1 + Math.random() * 120000);
    const formattedNumber = number.toString().padStart(6, "0");
    const prefix = profession.toLowerCase() === "lawyer" ? "OAB" : "CRC";
    return `${prefix}${statePrefix}${formattedNumber}`;
  }

  generateRandomStatePrefix() {
    const statePrefixes = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];
    return this.arrayElement(statePrefixes);
  }

  generatePhoneNumberWithoutMask() {
    return this.phone(false, false);
  }

  // Company Methods - Pessoa Juridica

  generateInscription() {
    return this.fakerTraditional.string.numeric('############');
  }
  
  generateOpenDate() {
    const pastDate = this.fakerTraditional.date.past();
    return pastDate.toLocaleDateString("pt-BR");
  }
  
  generateActivity() {
    return this.fakerTraditional.company.buzzPhrase();
  }
  
  generateWebsite() {
    return this.fakerTraditional.internet.url();
  }
  
  generateFullEnterprise(activity = null) {
    return this.fullEnterPrise(activity);
  }

  async fillInputField(page, selector, value) {
    const input = await page.locator(selector);
    await input.fill(value);
  }

  async clickButton(page, buttonName) {
    await page.getByRole("button", { name: buttonName }).click();
  }
}

const customFaker = new CustomFaker();

function generateRandomItem(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("Array must be a non-empty array");
  }
  return array[Math.floor(Math.random() * array.length)];
}

async function selectRandomItemFromOptions(options) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error("Options must be a non-empty array");
  }
  return options[Math.floor(Math.random() * options.length)];
}

module.exports = {
  customFaker,
  generateRandomItem,
  selectRandomItemFromOptions,
};
