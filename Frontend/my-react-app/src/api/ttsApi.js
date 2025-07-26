// src/api/ttsApi.js
import axiosInstance from './axiosInstance';

// Send text and language to get back a generated audio response
export const synthesizeSpeech = async (text) => {
    const response = await axiosInstance.post(
        '/tts/generate',
        text, // FIX: Pass the object { text, language } directly as the request body.
        { responseType: 'blob' } // important for binary response
    );
    return response.data; // this will be a Blob directly
};