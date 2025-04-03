// ApiRequests/api-requests.js
const axios = require('axios');
const config = require('../config');

class ApiRequests {
  constructor() {
    this.api = axios.create({
      baseURL: config.STAGING_API,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    this.token = null;
    this.tokenExpiration = null;
  }

  async ensureAuthenticated() {
    if (!this.token || this.isTokenExpired()) {
      await this.login(config.LOGIN_EMAIL_BACKEND, config.LOGIN_PASSWORD_BACKEND);
    }
  }

  isTokenExpired() {
    return this.tokenExpiration && new Date() > this.tokenExpiration;
  }

  async login(email, password) {
    try {
      const response = await this.api.post('/login', { email, password });
      this.token = response.data.token;
      this.tokenExpiration = new Date(new Date().getTime() + 60 * 60 * 1000); // Set expiration to 1 hour from now
      this.api.defaults.headers['Authorization'] = `Bearer ${this.token}`;
      console.log('Login successful');
      return this.token;
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchCustomers() {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.get('/customers');
      console.log('Fetched customers:', response.data.length);
      console.log('Fetched customers:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchProfileCustomers() {
    try {
      await this.ensureAuthenticated();
      const response = await this.api.get('/profile_customers');
      console.log('Fetched profile customers:', response.data.length);
      console.log('Fetched profile customers:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile customers:', error.response ? error.response.data : error.message);
      console.error('Status:', error.response ? error.response.status : 'Unknown');
      console.error('Headers:', error.response ? error.response.headers : 'Unknown');
      throw error;
    }
  }

  // Add these methods to your ApiRequests class

  async fetchSpecificCustomer(customerId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.get(`/profile_customers/${customerId}`);
      console.log(`Fetched specific customer: ${customerId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch specific customer ${customerId}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchProfileCustomer(profileCustomerId) {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.get(`/profile_customers/${profileCustomerId}`);
      console.log(`Fetched profile customer: ${profileCustomerId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch profile customer ${profileCustomerId}:`, error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchJobs() {
    await this.ensureAuthenticated();
    try {
      const response = await this.api.get('/jobs');
      console.log('Fetched jobs:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch jobs:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = new ApiRequests();