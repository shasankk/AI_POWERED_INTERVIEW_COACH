import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { WavRecorder } from '../utils/WavRecorder';
import apiService from '../api/client';

const Interview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionId = location.state?.sessionId;

    // UI State
    const [messages, setMessages] = useState([
        { role: 'system', text: 'Initialization Complete. Please check your camera settings before starting.' }
    ]);
    const [isRecording, setIsRecording] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('Waiting for speech...');

    // Proctoring State
    const [proctorWarning, setProctorWarning] = useState(null);
    const [violationsCount, setViolationsCount] = useState(0);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const wavRecorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const modelRef = useRef(null);
    const reqAnimFrameRef = useRef(null);

    const lastFaceTime = useRef(Date.now());
    const ALERT_THRESHOLD = 500;
    const lastWarning = useRef(null);
    const lastViolationTime = useRef(0);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            initMedia();
            initSpeechRecognition();
        }

        return () => {
            // Cleanup // ... existing code continues
            if (reqAnimFrameRef.current) cancelAnimationFrame(reqAnimFrameRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            }
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const initMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
            if (videoRef.current) videoRef.current.srcObject = stream;

            setMessages(prev => [...prev, { role: 'system', text: 'Initializing Proctoring System...' }]);
            await tf.ready();
            modelRef.current = await blazeface.load();
            setMessages(prev => [...prev, { role: 'system', text: 'System Ready. Please press "Start Interview".' }]);

            detectFaces();
        } catch (e) {
            console.error(e);
            alert("Camera access denied. Please allow camera access.");
        }
    };

    const detectFaces = async () => {
        if (!modelRef.current || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState === 4) {
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            const predictions = await modelRef.current.estimateFaces(video, false);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (predictions.length > 0) {
                lastFaceTime.current = Date.now();
                const pred = predictions[0];
                const start = pred.topLeft;
                const end = pred.bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];

                ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
                ctx.lineWidth = 2;
                ctx.strokeRect(start[0], start[1], size[0], size[1]);

                // Basic Logic
                const land = pred.landmarks;
                const nose = land[2];
                const rEar = land[4];
                const lEar = land[5];
                const rEye = land[0];
                const lEye = land[1];
                const faceWidth = Math.abs(rEar[0] - lEar[0]);
                const upperFaceHeight = Math.abs(nose[1] - (rEye[1] + lEye[1]) / 2);

                let warning = null;
                if (Math.abs(nose[0] - rEar[0]) < faceWidth * 0.20) warning = "Looking Right";
                else if (Math.abs(nose[0] - lEar[0]) < faceWidth * 0.20) warning = "Looking Left";
                if (upperFaceHeight < faceWidth * 0.12) warning = "Looking Up";
                if (upperFaceHeight > faceWidth * 0.40) warning = "Looking Down";
                if (predictions.length > 1) warning = "Multiple Faces";

                handleWarning(warning);
            } else {
                if (Date.now() - lastFaceTime.current > ALERT_THRESHOLD) {
                    handleWarning("No Face Detected");
                }
            }
        }

        reqAnimFrameRef.current = requestAnimationFrame(detectFaces);
    };

    const handleWarning = (warning) => {
        if (warning !== lastWarning.current) {
            if (["Looking Right", "Looking Left", "Looking Up", "Looking Down"].includes(warning)) {
                if (Date.now() - lastViolationTime.current > 3000) {
                    setViolationsCount(prev => prev + 1);
                    lastViolationTime.current = Date.now();
                }
            }
            lastWarning.current = warning;
        }
        setProctorWarning(warning);
    };

    const initSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.onresult = (event) => {
                let interim = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interim += event.results[i][0].transcript;
                }
                setLiveTranscript(interim);
            };
        }
    };

    const handleStartInterview = async () => {
        if (!sessionId) {
            alert("Session missing. Please complete the Setup phase first.");
            navigate('/setup');
            return;
        }
        setHasStarted(true);
        try {
            const data = await apiService.resetInterview(sessionId);
            setMessages(prev => [...prev, { role: 'assistant', text: data.question }]);
            playAudio(data.audio_url);
            wavRecorderRef.current = new WavRecorder();
        } catch (err) {
            console.error("Failed to start", err);
        }
    };

    const handleRecord = async () => {
        setIsRecording(true);
        if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) { }
        }
        if (wavRecorderRef.current) {
            try { await wavRecorderRef.current.start(); } catch (err) { console.error(err); }
        }
    };

    const handleStop = async () => {
        setIsRecording(false);
        setLiveTranscript("Processing answer...");
        if (recognitionRef.current) recognitionRef.current.stop();

        if (wavRecorderRef.current && wavRecorderRef.current.recording) {
            const blob = await wavRecorderRef.current.stop();
            await submitAnswer(blob);
        }
    };

    const submitAnswer = async (blob) => {
        // Save current transcript or fallback
        setMessages(prev => {
            const currentTranscript = document.getElementById('live-stt-text').innerText;
            return [...prev, { role: 'user', text: currentTranscript && currentTranscript !== "Processing answer..." ? currentTranscript : "(Audio Answer)" }];
        });

        setLiveTranscript("AI is thinking...");

        try {
            const data = await apiService.processInterviewAnswer(sessionId, blob);
            setMessages(prev => [...prev, { role: 'assistant', text: data.llm_response }]);
            playAudio(data.audio_url);
            setLiveTranscript("Listening...");

            if (data.is_finished) {
                setTimeout(() => navigate('/results', { state: { report: data.final_report, violations: violationsCount } }), 5000);
            }
        } catch (err) {
            console.error(err);
            setLiveTranscript("Error processing answer.");
            setMessages(prev => [...prev, { role: 'system', text: "Error processing answer. Please try again." }]);
        }
    };

    const playAudio = (url) => {
        if (url) {
            const fullUrl = url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
            const audio = new Audio(fullUrl + "?t=" + new Date().getTime());
            audio.play().catch(e => console.log("Autoplay blocked:", e));
        }
    };

    return (
        <div style={{ padding: '4rem 2rem', minHeight: '100vh', position: 'relative' }}>
            <Link to="/" className="return-home" style={{ position: 'absolute', top: '1.5rem', left: '2rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                <i className="fa-solid fa-arrow-left"></i> Return Home
            </Link>
            <div className="interview-grid">
                <div className="chat-panel card">
                    <div className="panel-header">
                        <div className="bot-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div className="bot-avatar" style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                <i className="fa-solid fa-robot"></i>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AI Interviewer</h4>
                            </div>
                        </div>
                    </div>

                    <div className="chat-viewport" id="chat-history">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="controls-bar" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        {!hasStarted ? (
                            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleStartInterview}>
                                Start Interview
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {!isRecording ? (
                                    <button className="btn btn-record" onClick={handleRecord}>
                                        <i className="fa-solid fa-microphone"></i> Answer
                                    </button>
                                ) : (
                                    <button className="btn btn-stop" onClick={handleStop}>
                                        <i className="fa-solid fa-stop"></i> Finish
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="visual-panel">
                    <div className="video-card card">
                        <div className="video-overlay">
                            <span className={`badge ${proctorWarning ? 'badge-warning' : 'badge-success'}`}>
                                {proctorWarning ? <><i className="fa-solid fa-triangle-exclamation"></i> Alert</> : <><i className="fa-solid fa-check"></i> Secure</>}
                            </span>
                        </div>

                        <video ref={videoRef} autoPlay playsInline muted></video>
                        <canvas ref={canvasRef}></canvas>

                        {proctorWarning && (
                            <div className="toast-warning">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>{proctorWarning}</span>
                            </div>
                        )}
                    </div>

                    <div className="transcript-card card">
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Live Transcript</h4>
                        <p id="live-stt-text" className="live-text">{liveTranscript}</p>
                    </div>
                </div>

                <audio ref={audioRef} className="hidden"></audio>
            </div>
        </div>
    );
};

export default Interview;
