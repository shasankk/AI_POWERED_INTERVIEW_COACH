import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import './Auth.css';

const Home = () => {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('token');

    const handleStart = () => {
        if (isAuthenticated) {
            navigate('/setup');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="auth-body" style={{ flexDirection: 'column', overflowY: 'auto' }}>
            <AnimatedBackground />

            {/* Navigation Bar */}
            <nav className="home-nav" style={{ width: '100%', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, position: 'absolute', top: 0 }}>
                <div className="brand" style={{ margin: 0 }}>
                    <i className="fa-solid fa-robot brand-icon"></i>
                    <span style={{ color: 'white' }}>AI Mock Interviewer</span>
                </div>
                <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
                    <Link to="/how-it-works" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>How it Works</Link>
                    <Link to="/faq" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>FAQ</Link>
                    <Link to="/setup" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>JD vs Resume</Link>
                    <Link to="/results" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 500 }}>Global Reports</Link>
                    <button className="btn btn-outline" style={{ padding: '0.4rem 1.2rem', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={handleStart}>
                        {isAuthenticated ? 'Dashboard' : 'Sign In'}
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem', marginTop: '80px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{ fontSize: '4rem', fontWeight: 800, background: 'linear-gradient(to right, #e0e7ff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', lineHeight: 1.1 }}>
                        Master Your Next <br /> Technical Interview
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
                        AI-powered mock interviews that analyze your <strong>speech clarity</strong>, <strong>prosody</strong>, and <strong>technical knowledge</strong> through live webcam tracking and Gemini intelligence.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)' }}
                            onClick={handleStart}
                        >
                            Start Practicing Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                        </motion.button>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="#features"
                            className="btn btn-outline"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            View Insights
                        </motion.a>
                    </div>
                </motion.div>

                {/* Visual Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', maxWidth: '1100px', width: '100%', paddingBottom: '3rem' }}
                    id="features"
                >
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                        <i className="fa-solid fa-microphone-lines" style={{ fontSize: '2rem', color: '#818cf8', marginBottom: '1rem' }}></i>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Speech & Prosody</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>Advanced audio analysis measures your WPM and filler-word usage to refine your confidence.</p>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                        <i className="fa-solid fa-camera" style={{ fontSize: '2rem', color: '#10b981', marginBottom: '1rem' }}></i>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Live AI Proctoring</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>TensorFlow facial detection ensures you maintain eye contact and interview integrity.</p>
                    </div>
                    <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                        <i className="fa-solid fa-brain" style={{ fontSize: '2rem', color: '#f59e0b', marginBottom: '1rem' }}></i>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Gemini Analytics</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>Your answers are evaluated in real-time against your uploaded CV and the target Job Description.</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Home;
