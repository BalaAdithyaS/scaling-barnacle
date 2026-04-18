import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Upload({ setExtractedData }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload-pdf-data', formData);
            const { data, summary } = response.data;
            setExtractedData(data);

            // Utility to parse currency strings to numbers
            const parseCurrency = (str) => {
                if (!str || typeof str !== 'string') return 0;
                return parseFloat(str.replace(/[$,]/g, '')) || 0;
            };

            const formatCurrency = (num) => {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
            };

            // Update stats and activity
            const stats = JSON.parse(localStorage.getItem('stats')) || { totalProcessed: 0, totalBS: 0, totalPL: 0, lastFile: 'N/A' };
            const activity = JSON.parse(localStorage.getItem('activity')) || [];
            const aggregate = JSON.parse(localStorage.getItem('aggregateInsights')) || { totalRevenue: 0, netProfit: 0, docCount: 0 };

            // Extract current values
            const currentRevenueStr = data['Profit and Loss']?.find(row => row.Particulars?.toLowerCase().includes('revenue'))?.Amount || '$0.00';
            const currentProfitStr = data['Profit and Loss']?.find(row => row.Particulars?.toLowerCase().includes('net profit'))?.Amount || '$0.00';
            
            const currentRevenueNum = parseCurrency(currentRevenueStr);
            const currentProfitNum = parseCurrency(currentProfitStr);

            // Update aggregate insights
            const newAggregate = {
                totalRevenue: aggregate.totalRevenue + currentRevenueNum,
                netProfit: aggregate.netProfit + currentProfitNum,
                docCount: aggregate.docCount + 1,
                lastRevenue: currentRevenueStr, // For reference if needed
                lastProfit: currentProfitStr
            };

            // Update financial timeline for visualization
            const timeline = JSON.parse(localStorage.getItem('financialTimeline')) || [];
            const newTimeline = [
                ...timeline,
                {
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    revenue: currentRevenueNum,
                    profit: currentProfitNum
                }
            ].slice(-10); // Keep last 10 points

            const newStats = {
                totalProcessed: stats.totalProcessed + 1,
                totalBS: stats.totalBS + (data['Balance Sheet']?.length > 0 ? 1 : 0),
                totalPL: stats.totalPL + (data['Profit and Loss']?.length > 0 ? 1 : 0),
                lastFile: file.name
            };

            const newActivity = [
                { name: file.name, date: new Date().toLocaleDateString() },
                ...activity.slice(0, 4)
            ];

            localStorage.setItem('stats', JSON.stringify(newStats));
            localStorage.setItem('activity', JSON.stringify(newActivity));
            localStorage.setItem('aggregateInsights', JSON.stringify(newAggregate));
            localStorage.setItem('financialTimeline', JSON.stringify(newTimeline));
            localStorage.setItem('aiSummary', JSON.stringify(summary));
            localStorage.setItem('lastExtracted', JSON.stringify({
                totalRevenue: currentRevenueStr,
                netProfit: currentProfitStr
            }));
            
            navigate('/results');
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError(err.response.data.detail);
            } else {
                setError('Error processing PDF. Please ensure it is a valid financial statement.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container centered">
            <div className="upload-section glass">
                <div className="upload-header">
                    <h2>Document Intelligence</h2>
                    <p>Ingest financial datasets for autonomous neural extraction</p>
                </div>

                <div className={`drop-zone ${file ? 'has-file' : ''}`}>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden-input"
                    />
                    <label htmlFor="file-upload" className="upload-label">
                        <div className="upload-icon-large">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                        </div>
                        <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{file ? file.name : 'Select PDF Intelligence Source'}</span>
                        {!file && <p style={{color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontSize: '0.9rem'}}>Drag & drop or browse local storage</p>}
                    </label>
                </div>

                {error && <p className="error-message" style={{color: 'hsl(var(--error))', marginBottom: '1.5rem'}}>{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`primary-btn ${loading ? 'loading' : ''}`}
                >
                    {loading ? 'Processing Pipeline...' : 'Initiate Extraction'}
                </button>

                {loading && (
                    <div className="progress-container">
                        <div className="progress-bar infinite"></div>
                        <p className="progress-text" style={{fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Synthesizing layers & neural mapping...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Upload;
