import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Results = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Safely parse state
    const report = location.state?.report || {};
    const violations = location.state?.violations || 0;

    // Fallbacks
    const finalScore = report.final_score !== undefined ? report.final_score : 0;
    const weakPoints = report.weak_points || [];
    const isSecure = violations === 0;

    // Calculate ring offset
    const circumference = 326.72; // Fixed circle dash length
    const strokeDashoffset = circumference - (finalScore / 100) * circumference;

    return (
        <div style={{ padding: '4rem 2rem', minHeight: '100vh', position: 'relative' }}>
            <Link to="/" className="return-home" style={{ position: 'absolute', top: '1.5rem', left: '2rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 10 }}>
                <i className="fa-solid fa-arrow-left"></i> Return Home
            </Link>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="report-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Performance Report</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Session Summary & Feedback</p>
                </div>

                <div className="results-dashboard" style={{ flex: 1 }}>
                    <div className="card score-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="score-ring-container">
                            <svg className="progress-ring" width="120" height="120">
                                <circle
                                    className="progress-ring__circle"
                                    stroke="var(--primary-color)"
                                    strokeWidth="8"
                                    fill="transparent"
                                    r="52" cx="60" cy="60"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                />
                            </svg>
                            <span className="score-text" id="final-score-display">{finalScore}</span>
                        </div>
                        <h3 style={{ marginTop: '1rem' }}>Overall Score</h3>
                    </div>

                    <div className="card stats-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-user-shield" style={{ color: 'var(--primary-color)' }}></i> Integrity Check
                        </h3>
                        <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 600 }}>Status</span>
                            <span id="integrity-status" className={`stat-val ${isSecure ? 'text-success' : 'text-danger'}`} style={{ fontWeight: 700 }}>
                                {isSecure ? 'Secure' : 'Alert'}
                            </span>
                        </div>
                        <div className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontWeight: 600 }}>Focus Violations</span>
                            <span id="violation-count" className="stat-val" style={{ fontWeight: 700 }}>{violations}</span>
                        </div>
                    </div>

                    <div className="card feedback-details">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-clipboard-check" style={{ color: 'var(--primary-color)' }}></i> Areas for Improvement
                        </h3>
                        <ul id="weakness-list" className="feedback-list" style={{ listStyleType: 'none', padding: 0 }}>
                            {weakPoints.length > 0 ? (
                                weakPoints.map((wp, idx) => (
                                    <li key={idx} style={{ padding: '1.25rem', marginBottom: '1rem', background: 'var(--bg-light)', borderRadius: '8px', borderLeft: '4px solid var(--warning)', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                                            <i className="fa-solid fa-circle-question" style={{ marginRight: '0.5rem' }}></i>
                                            Question {wp.question_idx + 1}
                                        </div>
                                        <div style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>{wp.evaluation?.feedback || "Needs more technical depth."}</div>
                                    </li>
                                ))
                            ) : (
                                <li style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                                    <strong style={{ color: 'var(--success)' }}><i className="fa-solid fa-circle-check" style={{ marginRight: '0.5rem' }}></i> Great Job:</strong> No major critical weak points detected!
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="action-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Start New Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Results;
