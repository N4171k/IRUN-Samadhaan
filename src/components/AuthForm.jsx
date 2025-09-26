import React from 'react';

export default function AuthForm({ type, user, onChange, onSubmit, loading }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <div className="input-group">
        <input
          type="text"
          name="name"
          placeholder="Username"
          value={user.name}
          onChange={onChange}
          required={type === 'signup'}
          className="auth-input"
        />
      </div>
      <div className="input-group">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={onChange}
          required
          className="auth-input"
        />
      </div>
      <button type="submit" className="auth-button" disabled={loading}>
        {type === 'login' ? 'continue' : 'Sign Up'}
      </button>
    </form>
  );
}
