import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import apiService from '../api/client';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        setIsLoading(true);
        try {
            await apiService.login(email, password);
            navigate('/');
        } catch (error) {
            alert("Login failed. Please check your credentials.");
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
                    <h1 className="login-h1">Welcome Back</h1>
                    <p>Log in to continue your interview journey</p>
                </div>

                <form onSubmit={handleSubmit}>
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

                    <a href="#" className="forgot-password">Forgot Password?</a>

                    <button type="submit" className="btn-submit login-btn">
                        Log In <i className="fa-solid fa-arrow-right" style={{ marginLeft: '5px' }}></i>
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
