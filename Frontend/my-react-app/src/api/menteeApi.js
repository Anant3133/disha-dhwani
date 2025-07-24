// src/api/menteeApi.js
import axiosInstance from './axiosInstance';

// Fetch all mentees
export const fetchAllMentees = async () => {
  const response = await axiosInstance.get('/mentees');
  return response.data;
};

// Fetch a single mentee by ID
export const fetchMenteeById = async (id) => {
  const response = await axiosInstance.get(`/mentees/${id}`);
  return response.data;
};

// Update mentee by ID, updateData is an object with fields to update
export const updateMenteeById = async (id, updateData) => {
  const response = await axiosInstance.put(`/mentees/${id}`, updateData);
  return response.data;
};

// Delete mentee by ID
export const deleteMenteeById = async (id) => {
  const response = await axiosInstance.delete(`/mentees/${id}`);
  return response.data;
};
