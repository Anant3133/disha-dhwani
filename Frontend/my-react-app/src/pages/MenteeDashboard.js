import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    fetchOnboardingPrompts,
} from '../api/aiApi';
import { synthesizeSpeech } from '../api/ttsApi';
import { transcribeAudio } from '../api/sttApi';
import { fetchMenteeById, updateMenteeById } from '../api/menteeApi';
import Stepper, { Step } from '../components/Stepper';

const findBestOption = (transcript, options) => {
    const cleanTranscript = transcript.toLowerCase().trim();
    return options.find(opt => cleanTranscript.includes(opt.label.toLowerCase()) || cleanTranscript.includes(opt.key.toLowerCase()));
};

const MenteeDashboard = () => {
    const [mentee, setMentee] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [language, setLanguage] = useState('en');
    const [status, setStatus] = useState('loading');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // --- Initial Load Effect ---
    useEffect(() => {
        const initDashboard = async () => {
            try {
                const loggedInMenteeId = localStorage.getItem('userId');
                if (!loggedInMenteeId) {
                    throw new Error("Mentee ID not found. Please log in again.");
                }
                
                setStatus('loading'); // Show loading when re-fetching
                const menteeData = await fetchMenteeById(loggedInMenteeId);
                setMentee(menteeData);

                if (menteeData.onboarding_status === 'Complete') {
                    setStatus('complete');
                    return;
                }

                const newPrompts = await fetchOnboardingPrompts(language);
                setPrompts(newPrompts);
                setStepIndex(0); // Always reset to the first step when prompts change
                setStatus('onboarding');
            } catch (err) {
                console.error('Initialization failed:', err);
                setStatus('error');
            }
        };
        initDashboard();
    }, [language]);

    // --- Text-to-Speech Effect ---
    const playPrompt = useCallback(async (text, lang) => {
        if (!text || status !== 'onboarding') return;
        try {
            const audioBlob = await synthesizeSpeech({ text, language: lang });
            const audioURL = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioURL);
            audio.play();
            await new Promise(resolve => {
                audio.onended = resolve;
                audio.onerror = resolve;
            });
        } catch (err) {
            console.error('TTS failed:', err);
        }
    }, [status]);

    useEffect(() => {
        if (prompts.length > 0 && stepIndex < prompts.length) {
            playPrompt(prompts[stepIndex]?.question, language);
        }
    }, [stepIndex, prompts, language, playPrompt]);

    // --- Core Logic for Processing a Response ---
    const handleOptionSelect = async (selectedOption) => {
        if (!mentee || !prompts[stepIndex] || status === 'saving') return;

        setStatus('saving');
        const currentPrompt = prompts[stepIndex];
        const updatePayload = { [currentPrompt.id]: selectedOption.key };

        console.log(`[Step ${stepIndex}] Updating mentee ${mentee.id} with payload:`, updatePayload);

        try {
            await updateMenteeById(mentee.id, updatePayload);

            if (currentPrompt.id === 'language_preference') {
                if (language !== selectedOption.key) {
                    setLanguage(selectedOption.key);
                } else {
                    setStepIndex(prev => prev + 1);
                    setStatus('onboarding');
                }
            } else if (stepIndex < prompts.length - 1) {
                setStepIndex(prev => prev + 1);
                setStatus('onboarding');
            } else {
                setStatus('complete');
            }
        } catch (err) {
            console.error('Failed to save response:', err);
            setStatus('error');
        }
    };

    // --- Voice Recording Handlers ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setStatus('transcribing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'response.webm', { type: 'audio/webm' });

                try {
                    const { transcript } = await transcribeAudio(audioFile, language);
                    if (!transcript) throw new Error('Could not understand. Please try again.');

                    const matchedOption = findBestOption(transcript, prompts[stepIndex].options);
                    if (matchedOption) {
                        await handleOptionSelect(matchedOption);
                    } else {
                        alert(`Sorry, I didn't catch that. Please select an option or try speaking again.`);
                        setStatus('onboarding');
                    }
                } catch (err) {
                    console.error('Transcription/Processing Error:', err);
                    alert(err.message || 'There was an error processing your voice.');
                    setStatus('onboarding');
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Could not access the microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    // --- UI Rendering ---
    if (status === 'loading') return <div className="p-4 text-center">Loading your dashboard...</div>;
    if (status === 'error') return <div className="p-4 text-center text-red-500">Sorry, something went wrong. Please refresh the page.</div>;
    if (status === 'complete') return <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">✅ Onboarding Complete!</h1>
        <p className="mt-2">Welcome! You are all set up.</p>
    </div>;

    const currentPrompt = prompts[stepIndex];

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Mentee Voice Onboarding</h1>
            {currentPrompt && (
                <Stepper forceStep={stepIndex} onFinalStepCompleted={() => setStatus('complete')}>
                    {prompts.map((prompt) => (
                        <Step key={prompt.id}>
                            <h2 className="text-xl font-semibold mb-4">{prompt.question}</h2>
                            <div className="flex flex-wrap gap-3 my-4">
                                {prompt.options.map(option => (
                                    <button
                                        key={option.key}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={status !== 'onboarding'}
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 text-center">
                                <p className="mb-2 text-gray-600">Or, answer with your voice:</p>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={status !== 'onboarding'}
                                    className={`px-6 py-3 rounded-full text-white font-bold ${
                                        isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                                    } disabled:bg-gray-400`}
                                >
                                    {isRecording ? 'Stop' : 'Record Answer'}
                                </button>
                                {status === 'transcribing' && <p className="mt-2 text-blue-600">Processing your voice...</p>}
                            </div>
                        </Step>
                    ))}
                </Stepper>
            )}
        </div>
    );
};

export default MenteeDashboard;