import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/dashboard" className="nav-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Finxtract
                </Link>
                <div className="nav-links">
                    <Link to="/dashboard" className="nav-item">Dashboard</Link>
                    <Link to="/upload" className="nav-item">Extract</Link>
                    <Link to="/results" className="nav-item">Insights</Link>
                    <button onClick={handleLogout} className="logout-btn">Sign Out</button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
