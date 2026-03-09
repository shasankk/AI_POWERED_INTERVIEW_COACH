import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../api/client';

const Setup = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleAnalyze = async () => {
        const cvFile = document.getElementById('cv-upload').files[0];
        const jdFile = document.getElementById('jd-upload').files[0];

        if (!cvFile || !jdFile) {
            alert("Please upload both your CV and the Job Description.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await apiService.uploadAnalysis(cvFile, jdFile);
            setIsLoading(false);
            if (data.status === 'success') {
                setAnalysisResult(data);
            }
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '4rem 2rem', minHeight: '100vh', position: 'relative' }}>
            <Link to="/" className="return-home" style={{ position: 'absolute', top: '1.5rem', left: '2rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                <i className="fa-solid fa-arrow-left"></i> Return Home
            </Link>
            <div className="setup-grid">
                <div className="card upload-box">
                    {!analysisResult ? (
                        <>
                            <div className="card-header" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                    <i className="fa-solid fa-file-arrow-up" style={{ color: 'var(--primary-color)', marginRight: '0.5rem' }}></i>
                                    Document Analysis
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Upload your CV and Job Description to tailor the interview.
                                </p>
                            </div>
                            <div className="file-inputs">
                                <div className="file-drop-area" id="drop-cv">
                                    <i className="fa-regular fa-file-pdf"></i>
                                    <span className="file-label">Upload CV (PDF/DOCX)</span>
                                    <input type="file" id="cv-upload" accept=".pdf,.docx,.txt" />
                                </div>
                                <div className="file-drop-area" id="drop-jd">
                                    <i className="fa-regular fa-file-lines"></i>
                                    <span className="file-label">Upload Job Description</span>
                                    <input type="file" id="jd-upload" accept=".pdf,.docx,.txt" />
                                </div>
                            </div>
                            <div className="actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button id="analyze-btn" className="btn btn-primary" onClick={handleAnalyze} disabled={isLoading}>
                                    {isLoading ? (
                                        <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> Analyzing Document...</>
                                    ) : (
                                        <><i className="fa-solid fa-microchip" style={{ marginRight: '0.5rem' }}></i> Analyze & Proceed</>
                                    )}
                                </button>
                                <button id="skip-setup-btn" className="btn btn-text" onClick={() => navigate('/interview')} disabled={isLoading}>
                                    Skip Analysis (Demo)
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="analysis-success" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Analysis Complete!</h2>
                            <div className="score-display" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>
                                    Resume Match Score: {analysisResult.score}%
                                </h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Your customized interview questions have been successfully generated based on your skills map.
                                </p>
                            </div>
                            <button className="btn btn-primary btn-lg" onClick={() => navigate('/interview', { state: { sessionId: analysisResult.session_id } })}>
                                Start Interview Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                            </button>
                        </div>
                    )}
                </div>

                <div className="card info-box">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary-color)' }}></i> How it works
                    </h3>
                    <ul className="steps-list">
                        <li><span className="num">1</span> <span><strong>Context:</strong> AI reads your CV to understand your background.</span></li>
                        <li><span className="num">2</span> <span><strong>Match:</strong> It compares your skills against the Job Description.</span></li>
                        <li><span className="num">3</span> <span><strong>Interview:</strong> Generates unique questions to test your fit.</span></li>
                        <li><span className="num">4</span> <span><strong>Proctoring:</strong> Uses webcam to ensure interview integrity.</span></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Setup;
