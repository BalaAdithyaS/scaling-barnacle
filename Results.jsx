import React, { useState } from 'react';
import axios from 'axios';

function Results({ data, lastFileName }) {
    const [downloading, setDownloading] = useState(false);

    if (!data || (!data['Balance Sheet']?.length && !data['Profit and Loss']?.length)) {
        return (
            <div className="page-container centered">
                <div className="empty-state glass">
                    <h2>No Data Found</h2>
                    <p>Please upload a document in the Upload section first.</p>
                </div>
            </div>
        );
    }

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/download-excel',
                { data },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    responseType: 'blob', // Important: treat response as binary
                }
            );

            // Create a temporary link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Finxtract_Export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download Excel file. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const renderTable = (title, items) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="data-section">
                <h3>{title}</h3>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.Description}</td>
                                    <td className="value-cell">{item.Value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <header className="page-header flex-header">
                <div>
                    <h2>Extracted Intelligence</h2>
                    <p style={{fontFamily: 'monospace', fontSize: '0.9rem', color: 'hsl(var(--primary))'}}>Source: {lastFileName || 'Verified Dataset'}</p>
                </div>
                <button onClick={handleDownload} className="primary-btn" style={{width: 'auto', margin: 0, padding: '10px 24px', background: 'transparent', border: '1px solid hsl(var(--primary))', color: 'hsl(var(--primary))'}}>
                    Export Dataset (XLSX)
                </button>
            </header>

            <div className="results-grid">
                {renderTable('Balance Sheet Intelligence', data['Balance Sheet'])}
                {renderTable('Performance (P&L) Data', data['Profit and Loss'])}
            </div>
        </div>
    );
}

export default Results;
