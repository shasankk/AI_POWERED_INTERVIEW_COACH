import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import apiService from '../api/client';
import './Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        setIsLoading(true);
        try {
            await apiService.register(name, email, password);
            // Optionally auto-login then navigate
            await apiService.login(email, password);
            navigate('/');
        } catch (error) {
            alert("Signup failed. Email may already be in use.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-body">
            <AnimatedBackground />

            <Link to="/" className="return-home">
                <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
            </Link>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                style={{ zIndex: 1 }}
            >
                <div className="auth-header">
                    <h1 className="signup-h1">Create Account</h1>
                    <p>Join us to practice and master your interviews</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" className="form-control" placeholder="John Doe" required />
                        <i className="fa-regular fa-user input-icon"></i>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" className="form-control" placeholder="you@example.com" required />
                        <i className="fa-regular fa-envelope input-icon"></i>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="form-control" placeholder="••••••••" required />
                        <i className="fa-solid fa-lock input-icon"></i>
                    </div>

                    <button type="submit" className="btn-submit signup-btn">
                        Create Account <i className="fa-solid fa-user-plus" style={{ marginLeft: '5px' }}></i>
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
