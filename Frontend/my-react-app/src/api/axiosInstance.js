// src/api/axiosInstance.js
import axios from 'axios';
import { getToken } from '../utils/token';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const sessionData = getToken();
    if (sessionData && sessionData.token) {
        config.headers.Authorization = `Bearer ${sessionData.token}`;
    }
    return config;
});

export default axiosInstance;