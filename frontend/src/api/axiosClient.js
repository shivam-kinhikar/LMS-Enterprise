import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Pointing to Laravel local server
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to inject the token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // We will store Sanctum token here
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle global errors (like 401 Unauthorized)
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Since Laravel returns { success, message, data }
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
