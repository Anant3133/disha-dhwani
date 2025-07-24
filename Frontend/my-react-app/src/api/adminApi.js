import axiosInstance from './axiosInstance';

// Get all mentors for admin dashboard
export const fetchAllMentors = async () => {
  try {
    const res = await axiosInstance.get('/admin/mentors');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Error fetching mentors' };
  }
};

// Get all mentees for admin dashboard
export const fetchAllMentees = async () => {
  try {
    const res = await axiosInstance.get('/admin/mentees');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Error fetching mentees' };
  }
};

// Get all mentorship requests for admin dashboard
export const fetchAllRequests = async () => {
  try {
    const res = await axiosInstance.get('/admin/requests');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Error fetching requests' };
  }
};
