import axiosInstance from './axiosInstance';

// Send basic phone request audio to webhook (ASR + AI classification + TTS)
export const sendBasicPhoneRequest = async ({ phoneNumber, audioFilePath, languageCode = 'en' }) => {
  try {
    const response = await axiosInstance.post('/webhook/basic-phone-request', {
      phoneNumber,
      audioFilePath,
      languageCode,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error sending basic phone request' };
  }
};

// Fetch initial MCQ prompts from AI service for onboarding
export const fetchInitialMCQPrompts = async (languageCode = 'en') => {
  try {
    const response = await axiosInstance.get('/api/webhook/mcq-prompts', {
      params: { languageCode },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching MCQ prompts' };
  }
};
