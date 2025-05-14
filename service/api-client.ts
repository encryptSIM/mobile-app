import axios, { AxiosError } from 'axios'

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
    baseURL: 'https://idx-esim-backend-09657482-483894229313.us-west1.run.app', // Replace with your actual base URL
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
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const data = error.response?.data;

            let message = 'An error occurred';
            if (status === 401) {
                message = 'Unauthorized access';
            } else if (status === 403) {
                message = 'Access forbidden';
            } else if (status === 404) {
                message = 'Resource not found';
            } else if (status === 500) {
                message = 'Server error';
            } else if (error.code === 'ECONNABORTED') {
                message = 'Request timeout';
            } else if (!error.response) {
                message = 'Network error';
            }

            console.error('API error:', { status, data, message });
            return Promise.reject(new APIError(message, status, data));
        }

        console.error('Unknown error:', error);
        return Promise.reject(new APIError('An unexpected error occurred'));
    },
)

export default axiosClient
