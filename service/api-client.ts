import axios, { AxiosError } from 'axios'
import { errorLog } from './error-log';

export class APIError extends Error {
    constructor (
        message: string,
        public status?: number,
        public data?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

const axiosClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL, // Replace with your actual base URL
    // timeout: 10000,
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
    error => {
        console.error('Request error:', error);
        return Promise.reject(new APIError('Failed to send request'));
    },
)

// Optional: Add response interceptor
axiosClient.interceptors.response.use(
    response => response,
    error => {
        console.error('Response error:', error);
        errorLog(error);
        return Promise.reject(error);
    },
)

export default axiosClient
