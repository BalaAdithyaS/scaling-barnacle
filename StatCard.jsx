import React from 'react';

function StatCard({ title, value, icon, color }) {
    return (
        <div className={`stat-card ${color} interactive-stat`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <h3>{title}</h3>
                <p className="stat-value">{value}</p>
            </div>
            <div className="stat-glow"></div>
        </div>
    );
}

export default StatCard;
