import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, ID } from '../lib/appwrite';

function SignUp() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        // Basic validation
        if (user.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setLoading(false);
            return;
        }
        
        try {
            // Check if user is already logged in
            try {
                await account.get();
                // User is already logged in, redirect to dashboard
                navigate('/dashboard');
                return;
            } catch {
                // User is not logged in, proceed with signup
            }
            
            await account.create(ID.unique(), user.email, user.password, user.name);
            setSuccess('Account created successfully! Please sign in.');
            
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Failed to sign up:', error);
            if (error.message.includes('user_already_exists')) {
                setError('An account with this email already exists.');
            } else if (error.message.includes('password')) {
                setError('Password must be at least 8 characters long.');
            } else {
                setError('Failed to create account. Please try again.');
            }
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error when user starts typing
        if (success) setSuccess(''); // Clear success when user starts typing
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
                    <h1 className="hero-title">Join IRUN Today</h1>
                    <p className="hero-subtitle">
                        Start your journey towards a successful defense career with our intelligent platform
                    </p>
                    
                    <div className="hero-features">
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3 className="feature-title">Quick Start</h3>
                            <p className="feature-description">
                                Get started in minutes with our streamlined onboarding
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3 className="feature-title">Secure & Safe</h3>
                            <p className="feature-description">
                                Your data is protected with enterprise-grade security
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🎓</div>
                            <h3 className="feature-title">Expert Content</h3>
                            <p className="feature-description">
                                Learn from defense professionals and successful candidates
                            </p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">✨</div>
                            <h3 className="feature-title">Free to Start</h3>
                            <p className="feature-description">
                                Begin your preparation with our comprehensive free tier
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Column - Auth Form */}
            <div className="auth-form-section">
                <div className="logo-box">
                    <h1>IRUN</h1>
                    <p>Create your account to get started</p>
                </div>
                
                <div className="auth-card">
                    {/* Floating particles inside card */}
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    
                    <div className="auth-tabs">
                        <Link to="/login" className="inactive">Sign In</Link>
                        <span className="active">Sign Up</span>
                    </div>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}
                
                <form className="auth-form" onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={user.name}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className={`auth-input ${focusedField === 'name' ? 'focused' : ''}`}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={user.email}
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
                            placeholder="Create a strong password (min 8 characters)"
                            value={user.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            className={`auth-input ${focusedField === 'password' ? 'focused' : ''}`}
                            required
                            minLength={8}
                        />
                    </div>
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Creating your account...
                            </>
                        ) : (
                            'Create Account & Start Journey'
                        )}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}

export default SignUp;