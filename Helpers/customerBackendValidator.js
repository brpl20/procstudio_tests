const apiRequests = require('../ApiRequests/api-requests');
const CustomerDataStore = require('./CustomerDataStore');
const fs = require('fs').promises;
const path = require('path');
// const FileDownloader = require('./FileDownloaderFromAws'); // Método da AWS desativado por conta do Download Direto Deixei aqui caso seja importante no futuro
// const DocxReader = require('./DocxReader');
// const OpenAIHelper = require('./OpenAIHelper'); // Ativar este método se for necessário utilização de IA

class CustomerBackendValidator {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    // this.downloadsDir = path.join(__dirname, 'downloads');
    // this.fileDownloader = new FileDownloader(this.downloadsDir);
    // this.docxReader = new DocxReader();
    // this.openAIHelper = new OpenAIHelper();
    this.translations = {
      gender: {
        'Masculino': 'male',
        'Feminino': 'female',
        'Outro': 'other'
      },
      nationality: {
        'Brasileiro': 'brazilian',
        'Estrangeiro': 'foreigner'
      },
      capacity: {
        'Capaz': 'able',
        'Relativamente Incapaz': 'relatively',
        'Absolutamente Incapaz': 'unable'
      },
      civilStatus: {
        'Solteiro': 'single',
        'Casado': 'married',
        'Divorciado': 'divorced',
        'Viúvo': 'widower',
        'União Estável': 'union'
      }
    };
  }

  formatCEP(cep) {
    if (!cep) return '';
    const numericCEP = cep.replace(/\D/g, '');
    return numericCEP.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  formatPhone(phone) {
    if (!phone) return '';
    const numericPhone = phone.replace(/\D/g, '');
    if (numericPhone.length === 10) {
      return numericPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return numericPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  comparePhoneNumbers(frontendPhones, backendPhones) {
    try {
      // Return false if either value is null/undefined
      if (!frontendPhones || !backendPhones) return false;
  
      // Handle case where inputs are arrays
      const frontendArray = Array.isArray(frontendPhones) ? frontendPhones : [frontendPhones];
      const backendArray = Array.isArray(backendPhones) ? backendPhones : [backendPhones];
  
      // Format and sort phone numbers
      const frontendFormatted = frontendArray.map(p => this.formatPhone(String(p))).sort();
      const backendFormatted = backendArray.map(p => this.formatPhone(String(p))).sort();
  
      return JSON.stringify(frontendFormatted) === JSON.stringify(backendFormatted);
    } catch (error) {
      console.error('Error comparing phone numbers:', error);
      return false;
    }
  }

  compareEmails(frontendEmails, backendEmails) {
    try {
      // Return false if either value is null/undefined
      if (!frontendEmails || !backendEmails) return false;
  
      // Handle case where inputs are arrays
      const frontendArray = Array.isArray(frontendEmails) ? frontendEmails : [frontendEmails];
      const backendArray = Array.isArray(backendEmails) ? backendEmails : [backendEmails];
  
      // Format and sort emails
      const frontendFormatted = frontendArray.map(e => String(e).toLowerCase()).sort();
      const backendFormatted = backendArray.map(e => String(e).toLowerCase()).sort();
  
      return JSON.stringify(frontendFormatted) === JSON.stringify(backendFormatted);
    } catch (error) {
      console.error('Error comparing emails:', error);
      return false;
    }
  }

  async validateCustomerData() {
    console.log('Current working directory:', process.cwd());
    
    const frontendData = CustomerDataStore.getAll();
    console.log("Frontend Data:");
    console.log(frontendData);
    
    // Fetch backend data
    const customers = await apiRequests.fetchProfileCustomers();
    const lastCustomer = customers.data[customers.data.length - 1];
    console.log("Lengh Last");
    console.log(lastCustomer);
    // Fetch specific customer data
    const customerId = lastCustomer.id;
    console.log("Customer ID:", customerId);
    // const specificCustomer = await apiRequests.fetchSpecificCustomer(customerId);
    const profileCustomer = await apiRequests.fetchProfileCustomer(customerId);
    
    // Combine specific customer and profile customer data
    const backendCustomer = {
      ...profileCustomer.data
    };

    // Fetch representative data if the customer is unable
    let representativeData = null;
    if (backendCustomer.attributes.capacity === 'unable' && backendCustomer.attributes.represent) {
      const representativeId = backendCustomer.attributes.represent.representor_id;
      representativeData = await apiRequests.fetchProfileCustomer(representativeId);
    }

    // TD: Fix additional request to the backend for multiple phone numbers and emails

    // Prepare backend object for logging
    const backendObject = {
      customer: backendCustomer,
      representative: representativeData
    };

    // Log frontend and backend data
    await this.logData('frontendobject.json', frontendData);
    await this.logData('backendobject.json', backendObject);

    const comparisonResults = this.compareData(frontendData, backendCustomer, representativeData);
    
    // Log comparison results
    await this.logData('comparison.json', comparisonResults);

    // // Download customer file
    // const downloadedFilePath = await this.fileDownloader.downloadCustomerFile(backendCustomer.attributes.customer_files);
    // if (downloadedFilePath) {
    //   console.log(`File downloaded to: ${downloadedFilePath}`);
    //   const docText = await this.docxReader.readDocxFile(downloadedFilePath);
    //   // Analyze document content with OpenAI
    //   const analysisResult = await this.openAIHelper.analyzeDocContent(docText);
    //   console.log('Analysis Result:', analysisResult);
    // }

    return comparisonResults;
  }

  async logData(filename, data) {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      const filePath = path.join(this.logDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`Logged data to ${filePath}`);
    } catch (error) {
      console.error(`Error logging data to ${filename}:`, error);
      console.error(`Attempted to write to: ${path.join(this.logDir, filename)}`);
    }
  }

  compareData(frontendData, backendCustomer, backendRepresentative) {
    const comparisonResults = {};
    for (const [key, frontendValue] of Object.entries(frontendData)) {
      let backendValue = this.getBackendValue(key, backendCustomer, backendRepresentative);
      
      comparisonResults[key] = {
        frontend: frontendValue,
        backend: backendValue,
        match: this.compareValues(key, frontendValue, backendValue)
      };
    }
    return comparisonResults;
  }

  getBackendValue(key, customer, representative) {
    const customerAttributes = customer.attributes;
    const representativeAttributes = representative ? representative.data.attributes : null;

    switch (key) {
      case 'firstName':
        return customerAttributes.name;
      case 'lastName':
        return customerAttributes.last_name;
      case 'rg':
        return customerAttributes.rg;
      case 'cpf':
        return customerAttributes.cpf;
      case 'nationality':
        return customerAttributes.nationality;
      case 'gender':
        return customerAttributes.gender;
      case 'civilStatus':
        return customerAttributes.civil_status;
      case 'birthDate':
        return customerAttributes.birth;
      case 'capacity':
        return customerAttributes.capacity;
      case 'profession':
        return customerAttributes.profession;
      case 'company':
        return customerAttributes.company;
      case 'benefitNumber':
        return customerAttributes.number_benefit;
      case 'nit':
        return customerAttributes.nit;
      case 'motherName':
        return customerAttributes.mother_name;
      case 'password':
        return customerAttributes.inss_password;
      case 'phoneNumber':
        return customerAttributes.default_phone;
      case 'phoneNumbers':  // Added for multiple phones
        return customerAttributes.phones?.join(',');
      case 'email':
        return customerAttributes.default_email;
      case 'emails':  // Added for multiple emails
        return customerAttributes.emails?.join(',');
      case 'cep':
        return customerAttributes.addresses[0]?.zip_code;
      case 'street':
        return customerAttributes.addresses[0]?.street;
      case 'neighborhood':
        return customerAttributes.addresses[0]?.neighborhood;
      case 'city':
        return customerAttributes.addresses[0]?.city;
      case 'state':
        return customerAttributes.addresses[0]?.state;
      case 'number':
        return customerAttributes.addresses[0]?.number?.toString();
      case 'complement':
        return customerAttributes.addresses[0]?.description;
      case 'bank':
        return customerAttributes.bank_accounts[0]?.bank_name;
      case 'agency':
        return customerAttributes.bank_accounts[0]?.agency;
      case 'operation':
        return customerAttributes.bank_accounts[0]?.operation;
      case 'account':
        return customerAttributes.bank_accounts[0]?.account;
      case 'pix':
        return customerAttributes.bank_accounts[0]?.pix;
      // Representative fields
      case 'representativeFirstName':
        return representativeAttributes ? representativeAttributes.name : null;
      case 'representativeLastName':
        return representativeAttributes ? representativeAttributes.last_name : null;
      case 'representativeCPF':
        return representativeAttributes ? representativeAttributes.cpf : null;
      case 'representativeRG':
        return representativeAttributes ? representativeAttributes.rg : null;
      case 'representativeBirthDate':
        return representativeAttributes ? representativeAttributes.birth : null;
      case 'representativeProfession':
        return representativeAttributes ? representativeAttributes.profession : null;
      case 'representativePhone':
        return representativeAttributes ? representativeAttributes.default_phone : null;
      case 'representativeEmail':
        return representativeAttributes ? representativeAttributes.default_email : null;
      case 'representativeStreet':
        return representativeAttributes ? representativeAttributes.addresses[0]?.street : null;
      case 'representativeNeighborhood':
        return representativeAttributes ? representativeAttributes.addresses[0]?.neighborhood : null;
      case 'representativeCity':
        return representativeAttributes ? representativeAttributes.addresses[0]?.city : null;
      case 'representativeState':
        return representativeAttributes ? representativeAttributes.addresses[0]?.state : null;
      case 'representativeNumber':
        return representativeAttributes ? representativeAttributes.addresses[0]?.number?.toString() : null;
      case 'representativeCEP':
        return representativeAttributes ? representativeAttributes.addresses[0]?.zip_code : null;
      case 'representativeComplement':
        return representativeAttributes ? representativeAttributes.addresses[0]?.description : null;
      case 'representativeNationality':
        return representativeAttributes ? representativeAttributes.nationality : null;
      case 'representativeGender':
        return representativeAttributes ? representativeAttributes.gender : null;
      case 'representativeCivilStatus':
        return representativeAttributes ? representativeAttributes.civil_status : null;
      default:
        return null;
    }
  }

  compareValues(key, frontendValue, backendValue) {
    if (frontendValue === null || backendValue === null) return false;

    // Handle multiple phones and emails
    if (key === 'phoneNumbers') {
      return this.comparePhoneNumbers(frontendValue, backendValue);
    }

    if (key === 'emails') {
      return this.compareEmails(frontendValue, backendValue);
    }

    // Handle translations for both customer and representative fields
    if (['gender', 'nationality', 'capacity', 'civilStatus', 'representativeGender', 'representativeNationality', 'representativeCivilStatus'].includes(key)) {
      const translationType = key.startsWith('representative') ? key.slice(13).toLowerCase() : key.toLowerCase();
      const translatedFrontend = this.getTranslation(translationType, frontendValue);
      return translatedFrontend === backendValue.toLowerCase();
    }

    // Handle CEP/ZIP formatting
    if (key === 'cep' || key === 'representativeCEP') {
      return this.formatCEP(frontendValue) === this.formatCEP(backendValue);
    }

    // Handle phone formatting
    if (key === 'phoneNumber' || key === 'representativePhone') {
      return this.formatPhone(frontendValue) === this.formatPhone(backendValue);
    }

    // Handle date comparison
    if (key === 'birthDate' || key === 'representativeBirthDate') {
      const frontendDate = this.parseDate(frontendValue);
      const backendDate = this.parseDate(backendValue);
      return frontendDate.getTime() === backendDate.getTime();
    }

    return String(frontendValue).toLowerCase() === String(backendValue).toLowerCase();
  }

  getTranslation(type, value) {
    // Normalize the type to match the translations object keys
    const normalizedType = type === 'civilstatus' ? 'civilStatus' : type;
  
    if (!this.translations[normalizedType]) {
      console.warn(`No translations found for type: ${type}`);
      return value.toLowerCase();
    }
    
    const translation = this.translations[normalizedType][value];
    if (!translation) {
      console.warn(`No translation found for value: ${value} in type: ${type}`);
      return value.toLowerCase();
    }
    return translation.toLowerCase();
  }

  parseDate(dateString) {
    // Handle both DD/MM/YYYY and YYYY-MM-DD formats
    const parts = dateString.split(/[-/]/);
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // DD/MM/YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
}

module.exports = new CustomerBackendValidator();