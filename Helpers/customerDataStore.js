// Helpers/customerDataStore.js

class CustomerDataStore {
    constructor() {
      this.data = {};
    }
  
    set(key, value) {
      this.data[key] = value;
    }
  
    get(key) {
      return this.data[key];
    }
  
    getAll() {
      return this.data;
    }
  
    clear() {
      this.data = {};
    }
  }
  
  module.exports = new CustomerDataStore();