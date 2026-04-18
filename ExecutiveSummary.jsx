import React, { useState, useEffect } from 'react';

const ExecutiveSummary = ({ summary }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!summary || !summary.insights) return;
        
        const fullText = summary.insights.join(' ');
        if (index < fullText.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + fullText[index]);
                setIndex(prev => prev + 1);
            }, 30);
            return () => clearTimeout(timer);
        }
    }, [index, summary]);

    if (!summary) {
        return (
            <div className="executive-summary glass empty">
                <div className="neural-ping"></div>
                <p>Establishing neural connection for executive analysis...</p>
            </div>
        );
    }

    return (
        <div className={`executive-summary glass ${summary.sentiment?.toLowerCase()}`}>
            <header className="summary-header">
                <div className="ai-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2zM12 12L2.6 12A10 10 0 0 0 12 22V12z" />
                        <path d="M12 12V2.6A10 10 0 0 1 21.4 12H12z" />
                    </svg>
                </div>
                <h3>{summary.headline || 'Strategic Analysis'}</h3>
                <span className={`sentiment-badge ${summary.sentiment?.toLowerCase()}`}>
                    {summary.sentiment || 'Neutral'}
                </span>
            </header>
            
            <div className="summary-content">
                <p className="typing-text">{displayedText}<span className="cursor">|</span></p>
                <div className="insight-bullets">
                    {summary.insights?.map((insight, i) => (
                        <div key={i} className="bullet-item">
                            <span className="bullet-dot"></span>
                            {insight}
                        </div>
                    ))}
                </div>
            </div>

            <footer className="summary-footer">
                {summary.footer || 'Finxtract Intelligence Engine'}
            </footer>
        </div>
    );
};

export default ExecutiveSummary;
