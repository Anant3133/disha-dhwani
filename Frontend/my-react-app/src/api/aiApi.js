import axiosInstance from './axiosInstance';

export const classifyUserRequest = async (text, languageCode = 'en') => {
  const response = await axiosInstance.post('/ai/classifyUserRequest', {
    text,
    languageCode,
  });
  return response.data;
};

export const fetchOnboardingMCQs = async (languageCode = 'en') => {
  const response = await axiosInstance.get('/ai/onboarding-mcqs', {
    params: { languageCode },
  });
  return response.data; 
};

export const fetchOnboardingPrompts = async (languageCode = 'en') => {
    const response = await axiosInstance.get('/ai/onboarding-prompts', {
        params: { languageCode },
    });
    return response.data;
};
