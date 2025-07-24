import axiosInstance from './axiosInstance';

// 1. Get pending mentorship requests
export const fetchPendingRequests = async () => {
  const res = await axiosInstance.get('/mentor/requests/pending');
  return res.data;
};

// 2. Assign request to the logged-in mentor
export const assignRequest = async (requestId) => {
  const res = await axiosInstance.post(`/mentor/requests/assign/${requestId}`);
  return res.data;
};

// 3. Mark a request as completed
export const completeRequest = async (requestId, mentorNotes) => {
  const res = await axiosInstance.post(`/mentor/requests/complete/${requestId}`, {
    mentor_notes: mentorNotes
  });
  return res.data;
};

// 4. Initiate call to mentee
export const initiateMenteeCall = async (menteePhoneNumber, requestId) => {
  const res = await axiosInstance.post(`/mentor/requests/initiate-call`, {
    menteePhoneNumber,
    requestId
  });
  return res.data;
};
