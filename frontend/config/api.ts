import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Creating axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adding a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Assuming you store token in localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Define endpoints (Optional, but useful for organization)
export const endpoints = {
    auth: {
        signup: '/auth/user/signup',
        login: '/auth/user/login',
    },
    tasks: {
        list: '/tasks',          // GET
        create: '/tasks',        // POST
        update: (id: string) => `/tasks/${id}`, // PUT
        delete: (id: string) => `/tasks/${id}`, // DELETE
    }
};

export default api;