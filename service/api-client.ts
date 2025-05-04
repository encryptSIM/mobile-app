import axios from 'axios'

const axiosClient = axios.create({
    baseURL: 'http://localhost:3000', // Replace with your actual base URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Optional: Add request interceptor
axiosClient.interceptors.request.use(
    config => {
        // You can attach token here if needed
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config
    },
    error => Promise.reject(error),
)

// Optional: Add response interceptor
axiosClient.interceptors.response.use(
    response => response,
    error => {
        // Handle common error globally
        console.error('Axios error:', error)
        return Promise.reject(error)
    },
)

export default axiosClient
