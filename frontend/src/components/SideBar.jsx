import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import LanguageToggle from './LanguageToggle';

const Sidebar = ({ user, onLogout, totalCount, lastUpdate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Record session end for genealogists
    if (user && user.role === 'genealogist') {
      try {
        const token = localStorage.getItem('token');
        const sessionIndex = localStorage.getItem('sessionIndex');
        await axios.post('https://honduras-archive-v2.onrender.com/api/auth/logout',
          { sessionIndex: parseInt(sessionIndex) },
          { headers: { 'x-auth-token': token } }
        );
      } catch (err) {
        console.error('Logout tracking error:', err);
      }
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionIndex');
    if (onLogout) onLogout();
    navigate('/');
  };

  const linkStyle = {
    color: '#f5f1eb', textDecoration: 'none',
    padding: '7px 0', display: 'block',
    fontSize: '1rem', transition: 'padding-left 0.2s'
  };

  const headerStyle = {
    fontSize: '0.8rem', color: '#ACA37E',
    marginTop: '20px', textTransform: 'uppercase', fontWeight: 'bold'
  };

  const specialLinkStyle = {
    ...linkStyle,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '6px', padding: '8px 10px',
    marginTop: '4px', borderLeft: '3px solid #ACA37E'
  };

  return (
    <div style={{
      width: '260px', backgroundColor: '#737958', color: '#EFE7DD',
      height: '100vh', padding: '20px', position: 'fixed', top: 0, left: 0,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      boxSizing: 'border-box', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', overflowY: 'auto'
    }}>
      <h2 style={{
        fontFamily: 'serif', borderBottom: '2px solid #ACA37E',
        paddingBottom: '10px', marginBottom: '10px', fontSize: '1.3rem'
      }}>
        {t('sidebar.title')}
      </h2>

      <div style={{ marginBottom: '15px' }}>
        <LanguageToggle />
      </div>

      {/* Stats */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px',
        borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #ACA37E'
      }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#EFE7DD' }}>
          <strong>{t('sidebar.magnitude')}:</strong> {totalCount || 0} {t('sidebar.records')}
        </p>
        {lastUpdate && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#EFE7DD', marginTop: '5px' }}>
            <strong>{t('sidebar.lastUpdate')}:</strong> {new Date(lastUpdate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* User block */}
      {user ? (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px',
          borderRadius: '6px', marginBottom: '20px'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', marginBottom: '2px', color: '#ACA37E' }}>
            {t('sidebar.loggedAs')}:
          </p>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '2px' }}>
            {user.username}
          </p>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#ACA37E', textTransform: 'capitalize' }}>
            {user.role === 'genealogist' ? '🔬 Genealogist' : user.role === 'admin' ? '⚙️ Admin' : '👤 Visitor'}
          </p>

          {/* Genealogist dashboard link */}
          {user.role === 'genealogist' && (
            <Link to="/dashboard" style={{
              display: 'block', backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#EFE7DD', textAlign: 'center', padding: '7px',
              borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem',
              fontWeight: 'bold', marginBottom: '8px'
            }}>
              📊 My Dashboard
            </Link>
          )}

          <button onClick={handleLogout} style={{
            width: '100%', backgroundColor: 'rgba(255,255,255,0.2)',
            color: '#EFE7DD', border: '1px solid #ACA37E',
            padding: '6px', borderRadius: '4px', fontSize: '0.85rem', cursor: 'pointer'
          }}>
            🚪 {t('sidebar.logout')}
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <Link to="/login" style={{
            display: 'block', backgroundColor: 'rgba(255,255,255,0.15)',
            color: '#EFE7DD', textAlign: 'center', padding: '10px',
            borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem',
            fontWeight: 'bold', marginBottom: '8px'
          }}>
            🔐 {t('sidebar.login')}
          </Link>
        </div>
      )}

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Link to="/" style={linkStyle}>🏠 {t('sidebar.home')}</Link>
        {user && user.role === 'admin' && (
          <Link to="/upload" style={{ ...linkStyle, fontWeight: 'bold' }}>📤 {t('sidebar.upload')}</Link>
        )}
        <Link to="/about" style={linkStyle}>📖 {t('sidebar.about')}</Link>
        <Link to="/contact" style={linkStyle}>✉️ {t('sidebar.contact')}</Link>

        <hr style={{ borderColor: 'rgba(172, 163, 126, 0.5)', width: '100%', margin: '15px 0' }} />

        <h3 style={headerStyle}>{t('sidebar.collections')}</h3>
        <Link to="/category/Portrait" style={linkStyle}>👤 {t('sidebar.portrait')}</Link>
        <Link to="/category/News" style={linkStyle}>📰 {t('sidebar.news')}</Link>
        <Link to="/historic-events" style={specialLinkStyle}>🏛️ Historic Events</Link>
        <Link to="/businesses" style={specialLinkStyle}>🏢 Businesses</Link>

        <h3 style={headerStyle}>{t('sidebar.vitalRecords')}</h3>
        <Link to="/category/Birth" style={linkStyle}>🍼 {t('sidebar.births')}</Link>
        <Link to="/category/Marriage" style={linkStyle}>💍 {t('sidebar.marriages')}</Link>
        <Link to="/category/Death" style={linkStyle}>⚰️ {t('sidebar.deaths')}</Link>
      </nav>

      <div style={{ marginTop: '30px' }}>
        <h3 style={headerStyle}>{t('sidebar.surnameIndex')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '12px' }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
            <Link key={l} to={'/alpha/' + l} style={{
              color: '#EFE7DD', textDecoration: 'none', fontSize: '0.85rem',
              textAlign: 'center', padding: '5px', borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.1)', transition: 'all 0.2s'
            }}>
              {l}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '15px', paddingBottom: '20px' }}>
        <a href="https://paypal.me/yourusername" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', backgroundColor: '#0070ba', color: 'white',
          textAlign: 'center', padding: '10px', borderRadius: '6px',
          textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold'
        }}>
          ❤️ {t('sidebar.support')}
        </a>
      </div>
    </div>
  );
};

export default Sidebar;