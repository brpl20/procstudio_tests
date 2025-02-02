import axios from 'axios';

const login = async (email, password) => {
    try {
        const response = await axios.post(
            'https://api_staging.procstudio.com.br/api/v1/login',
            {
                auth: {
                    email,
                    password,
                },
            }
        );

        // Extract the token from the response
        const { token } = response.data;

        // Store the token in localStorage (or sessionStorage)
        localStorage.setItem('authToken', token);

        console.log('Login successful! Token stored.');
        return token;
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const fetchCustomers = async () => {
    try {
        // Retrieve the token from localStorage
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }

        // Make an authenticated GET request
        const response = await axios.get(
            'https://api_staging.procstudio.com.br/api/v1/customers',
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        // Return the array of customers
        return response.data;
    } catch (error) {
        console.error('Failed to fetch customers:', error.response ? error.response.data : error.message);
        throw error;
    }
};

const runAuthExample = async () => {
    const email = 'pelli.br.sp@gmail.com';
    const password = '123456Af!@';

    try {
        // Step 1: Log in and store the token
        await login(email, password);

        // Step 2: Fetch customers using the stored token
        const customers = await fetchCustomers();
        console.log('Customers:', customers);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

// Run the example
runAuthExample();