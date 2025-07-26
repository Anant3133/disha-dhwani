// src/api/sttApi.js
import axiosInstance from './axiosInstance';

/**
 * Send an audio file for transcription
 * @param {File} audioFile - A File object (e.g. from a recorder)
 * @param {string} language - Language code like 'en', 'hi', 'te'
 */
export const transcribeAudio = async (audioFile, language = 'en') => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', language);

  const response = await axiosInstance.post('/stt/upload-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data; // { transcript: "..." }
};
