import React from 'react';

function AIInsight({ data }) {
    if (!data) {
        return (
            <div className="ai-insight-panel glass empty">
                <div className="pulse-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </div>
                <h3>Neural Extraction Standby</h3>
                <p>Waiting for financial document ingestion to generate deep insights.</p>
            </div>
        );
    }

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
    };

    return (
        <div className="ai-insight-panel glass">
            <header className="insight-header">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="insight-badge">AGGREGATE ANALYTICS</div>
                    <div className="insight-badge" style={{ background: 'hsla(var(--accent) / 0.15)', color: 'hsl(var(--accent))', borderColor: 'hsla(var(--accent) / 0.2)' }}>
                        {data.docCount || 0} DOCUMENTS
                    </div>
                </div>
                <h3>Portfolio Intelligence</h3>
            </header>
            <div className="insight-grid">
                <div className="insight-item">
                    <span className="label">Total Aggregate Revenue</span>
                    <span className="value accent">{formatCurrency(data.totalRevenue)}</span>
                </div>
                <div className="insight-item">
                    <span className="label">Total Cumulative Net Profit</span>
                    <span className="value success">{formatCurrency(data.netProfit)}</span>
                </div>
            </div>
        </div>
    );
}

export default AIInsight;
