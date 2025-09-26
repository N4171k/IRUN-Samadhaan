import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../lib/appwrite';

function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Check if user is already logged in
            try {
                await account.get();
                // User is already logged in, redirect to dashboard
                navigate('/dashboard');
                return;
            } catch {
                // User is not logged in, proceed with login
            }
            
            await account.createEmailPasswordSession(credentials.email, credentials.password);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to login:', error);
            setError('Invalid email or password. Please try again.');
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error when user starts typing
    };

    return (
        <div className={`auth-ui-wrapper ${isVisible ? 'fade-in' : ''}`}>
            {/* Aurora Background Effect */}
            <div className="aurora"></div>
            
            {/* Floating Background Shapes */}
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
            <div className="floating-shape shape-4"></div>
            <div className="floating-shape shape-5"></div>
            <div className="floating-shape shape-6"></div>
            
            {/* Sparkle Effects */}
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            
            {/* Left Column - Hero Section */}
            <div className="auth-hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to IRUN</h1>
                    <p className="hero-subtitle">
                        Your intelligent companion for SSB preparation and defense career success
                    </p>
                    
                    <div className="hero-features">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3 className="feature-title">Smart Practice</h3>
                            <p className="feature-description">
                                AI-powered tests and personalized training modules
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">Progress Tracking</h3>
                            <p className="feature-description">
                                Real-time performance analytics and improvement insights
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🤖</div>
                            <h3 className="feature-title">AI Mentor</h3>
                            <p className="feature-description">
                                24/7 intelligent guidance and personalized feedback
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🏆</div>
                            <h3 className="feature-title">Success Focused</h3>
                            <p className="feature-description">
                                Proven strategies from successful candidates
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Column - Auth Form */}
            <div className="auth-form-section">
                <div className="logo-box">
                    <h1>IRUN</h1>
                    <p>Sign in to continue your journey</p>
                </div>
                
                <div className="auth-card">
                    {/* Floating particles inside card */}
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    
                    <div className="auth-tabs">
                        <span className="active">Sign In</span>
                        <Link to="/signup" className="inactive">Sign Up</Link>
                    </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={credentials.email}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField(null)}
                            className={`auth-input ${focusedField === 'email' ? 'focused' : ''}`}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            className={`auth-input ${focusedField === 'password' ? 'focused' : ''}`}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Signing you in...
                            </>
                        ) : (
                            'Sign In to Continue'
                        )}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/signup">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Login;