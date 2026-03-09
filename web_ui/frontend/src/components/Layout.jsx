import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
    const location = useLocation();
    // Do not show sidebar/topbar on login/signup full screen pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    if (isAuthPage) {
        return <Outlet />;
    }

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="main-content">
                <TopBar />
                <div className="view-section active">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
