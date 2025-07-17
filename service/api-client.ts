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
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        console.log("🔄 Request config:", JSON.stringify(config, null, 2));
        // You can attach token here if needed
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config
    },
    error => {
        console.error('❌ Request error:', error);
        return Promise.reject(new APIError('Failed to send request'));
    },
)

// Optional: Add response interceptor
axiosClient.interceptors.response.use(
    response => {
        console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log("✅ Response data:", JSON.stringify(response.data, null, 2));
        return response;
    },
    error => {
        console.error('❌ Response error:', error);
        console.error('❌ Response error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
        });
        errorLog(error);
        return Promise.reject(error);
    },
)

export default axiosClient
