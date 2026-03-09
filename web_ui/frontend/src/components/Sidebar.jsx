import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="brand">
                <i className="fa-solid fa-robot brand-icon"></i>
                <span>AI Mock Interviewer</span>
            </div>

            <nav className="nav-menu">
                <NavLink
                    to="/setup"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="fa-solid fa-layer-group"></i> Setup
                </NavLink>
                <NavLink
                    to="/interview"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="fa-solid fa-video"></i> Live Session
                </NavLink>
                <NavLink
                    to="/results"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <i className="fa-solid fa-chart-pie"></i> Report
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
