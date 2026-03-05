import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://honduras-archive.onrender.com/api/auth/login', {
        username, password
      });

      if (response.data.success) {
        const userData = response.data.user;
        const token = response.data.token;
        const sessionIndex = response.data.sessionIndex;

        // Store user, token, session start info
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('sessionStart', new Date().toISOString());
        if (sessionIndex !== undefined) {
          localStorage.setItem('sessionIndex', sessionIndex);
        }

        if (onLogin) onLogin(userData);

        // Role-based redirect
        if (userData.role === 'admin') {
          navigate('/upload');
        } else if (userData.role === 'genealogist') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#EFE7DD', minHeight: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', padding: '40px', borderRadius: '12px',
        border: '2px solid #737958', maxWidth: '400px', width: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '10px', fontSize: '1.8rem' }}>
          Recuerdos de Honduras
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '0.95rem' }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#737958', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Username
            </label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', color: '#737958', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Password
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputStyle} />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#ffebee', color: '#c62828', padding: '12px',
              borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', backgroundColor: loading ? '#999' : '#737958',
            color: 'white', border: 'none', padding: '14px', borderRadius: '6px',
            fontSize: '1.05rem', fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: '#737958', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Register
          </Link>
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link to="/" style={{ color: '#999', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '12px', border: '2px solid #ddd',
  borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
};

export default LoginPage;