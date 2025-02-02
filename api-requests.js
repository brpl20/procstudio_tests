// api-requests.js
const axios = require('axios');
const config = require('./config');

class ApiRequests {
  constructor() {
    this.api = axios.create({
      baseURL: config.STAGING_API,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async login(email, password) {
    try {
      const response = await this.api.post('/login', { email, password });
      this.api.defaults.headers['Authorization'] = `Bearer ${response.data.token}`;
      return response.data.token;
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchCustomers() {
    try {
      const response = await this.api.get('/customers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async fetchJobs() {
    try {
      const response = await this.api.get('/jobs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch jobs:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

module.exports = new ApiRequests();