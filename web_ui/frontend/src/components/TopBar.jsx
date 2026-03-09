import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TopBar = () => {
    const location = useLocation();

    // Determine page title based on route
    let pageTitle = "Dashboard";
    if (location.pathname === '/') pageTitle = "Session Setup";
    else if (location.pathname === '/interview') pageTitle = "Live Interview";
    else if (location.pathname === '/results') pageTitle = "Performance Report";
    else if (location.pathname === '/login') pageTitle = "Log In";
    else if (location.pathname === '/signup') pageTitle = "Sign Up";

    return (
        <header className="top-bar">
            <h1>{pageTitle}</h1>
            <div className="status-indicators">
                <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Log In</Link>
                <Link to="/signup" style={{ background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)' }}>Sign Up</Link>
                <div className="status-badge" id="ai-status">
                    {/* Simulated disconnected state, will hook to API later */}
                    <span className="dot disconnected"></span> AI System
                </div>
            </div>
        </header>
    );
};

export default TopBar;
