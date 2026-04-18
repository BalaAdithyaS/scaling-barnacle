import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
            const response = await axios.post(`http://localhost:8000${endpoint}`, {
                email,
                password
            });

            const { token, email: userEmail } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: userEmail }));
            
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail || 'Authentication failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass">
                <div className="login-header">
                    <div className="login-logo">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'hsl(var(--primary))', marginBottom: '1rem'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h1>Finxtract AI</h1>
                    <p>{isSignUp ? 'Create your neural extraction profile' : 'Secure Enterprise Financial Intelligence'}</p>
                </div>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Business Email</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-text" style={{color: 'hsl(var(--error))', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1rem'}}>{error}</p>}
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Initialize Account' : 'Sign In to Repository')}
                    </button>
                </form>
                <div className="login-footer" style={{marginTop: '1.5rem', textAlign: 'center'}}>
                    <p style={{fontSize: '0.9rem', color: 'hsl(var(--text-secondary))'}}>
                        {isSignUp ? 'Already have an account?' : 'New to Finxtract AI?'}
                        <button 
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{background: 'none', border: 'none', color: 'hsl(var(--primary))', fontWeight: 600, marginLeft: '0.5rem', cursor: 'pointer'}}
                        >
                            {isSignUp ? 'Sign In' : 'Register Profile'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
