import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import AIInsight from '../components/AIInsight';
import TrendChart from '../components/TrendChart';
import ExecutiveSummary from '../components/ExecutiveSummary';
import { Link } from 'react-router-dom';

function Dashboard() {
    const [stats, setStats] = useState({
        totalProcessed: 0,
        totalBS: 0,
        totalPL: 0,
        lastFile: 'N/A',
    });
    const [activity, setActivity] = useState([]);
    const [lastExtracted, setLastExtracted] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [aiSummary, setAiSummary] = useState(null);

    useEffect(() => {
        const storedStats = JSON.parse(localStorage.getItem('stats')) || {
            totalProcessed: 0,
            totalBS: 0,
            totalPL: 0,
            lastFile: 'N/A',
        };
        const storedActivity = JSON.parse(localStorage.getItem('activity')) || [];
        const storedAggregate = JSON.parse(localStorage.getItem('aggregateInsights'));
        const storedTimeline = JSON.parse(localStorage.getItem('financialTimeline')) || [];
        const storedSummary = JSON.parse(localStorage.getItem('aiSummary'));

        setStats(storedStats);
        setActivity(storedActivity);
        setLastExtracted(storedAggregate);
        setTimeline(storedTimeline);
        setAiSummary(storedSummary);
    }, []);

    return (
        <div className="page-container">

            {/* ── Page Header ── */}
            <header className="page-header">
                <div className="dash-header-row">
                    <div>
                        <h2>Intelligence Hub</h2>
                        <p>Advanced monitoring of your autonomous extraction pipeline</p>
                    </div>
                    <div className="pipeline-status">
                        <span className="status-dot"></span>
                        Neural Pipeline: Active
                    </div>
                </div>
            </header>

            {/* ── Overview Cards (Top Row) ── */}
            <section className="dash-overview-grid">
                <StatCard
                    title="Total Processed"
                    value={stats.totalProcessed}
                    color="blue"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
                />
                <StatCard
                    title="Balance Sheets"
                    value={stats.totalBS}
                    color="green"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
                />
                <StatCard
                    title="P&L Statements"
                    value={stats.totalPL}
                    color="purple"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>}
                />
                <StatCard
                    title="Last Processed"
                    value={stats.lastFile}
                    color="slate"
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                />
            </section>

            {/* ── Main Content: Graph (70%) + Portfolio Panel (30%) ── */}
            <section className="dash-main-grid">

                {/* Graph Section — left, 70% */}
                <div className="dash-graph-col">
                    <div className="dash-card">
                        <ExecutiveSummary summary={aiSummary} />
                    </div>
                    <div className="dash-card dash-chart-card">
                        <TrendChart data={timeline} />
                    </div>
                </div>

                {/* Portfolio Intelligence Panel — right, 30% */}
                <div className="dash-portfolio-col">
                    <div className="dash-card dash-portfolio-card">
                        <div className="portfolio-header">
                            <h3>Portfolio Intelligence</h3>
                            <span className="insight-badge">LIVE</span>
                        </div>
                        <AIInsight data={lastExtracted} />
                    </div>

                    <div className="dash-card dash-activity-card">
                        <div className="portfolio-header" style={{ marginBottom: '1.5rem' }}>
                            <h3>Recent Activity</h3>
                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Real-time</span>
                        </div>
                        <div className="activity-list">
                            {activity.length > 0 ? (
                                activity.map((item, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-info">
                                            <span className="file-name" style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>{item.name}</span>
                                            <span className="file-date" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.date}</span>
                                        </div>
                                        <div className="activity-actions">
                                            <div className="activity-status success">Done</div>
                                            <Link to="/results" className="action-link">View →</Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-msg" style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                                    No activity yet. Upload a financial PDF to get started.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}

export default Dashboard;
