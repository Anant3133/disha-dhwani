import axiosInstance from './axiosInstance';

// Login user (mentor/admin/mentee)
export const login = async (credentials) => {
  try {
    const res = await axiosInstance.post('/auth/login', credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Login failed' };
  }
};

// Register user (mentor/admin/mentee)
export const registerUser = async (userData) => {
  try {
    const res = await axiosInstance.post('/auth/register', userData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Registration failed' };
  }
};
