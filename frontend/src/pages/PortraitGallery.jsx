import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const PortraitGallery = () => {
  const [portraits, setPortraits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Added for navigation

  useEffect(() => {
    const fetchPortraits = async () => {
      setLoading(true);
      try {
        // Updated to use /api/archive to match your other working pages
        const res = await axios.get('https://honduras-archive.onrender.com/api/archive?category=Portrait');
        // Ensure we target .items if your backend uses pagination
        setPortraits(res.data.items || res.data || []);
      } catch (err) {
        console.error('Error fetching portraits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortraits();
  }, []);

  return (
    <div style={{ padding: '40px', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#737958', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Search</Link>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'serif', color: '#737958', fontSize: '2rem', borderBottom: '2px solid #ACA37E', paddingBottom: '10px' }}>
          🖼️ Family Portraits
        </h1>
        <p style={{ color: '#888' }}>{portraits.length} historical portraits in the archive</p>
      </div>

      {loading ? (
        <p style={{ color: '#737958' }}>⏳ Loading gallery...</p>
      ) : portraits.length === 0 ? (
        <p>No portraits found.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '24px' 
        }}>
          {portraits.map(p => (
            <div 
              key={p._id} 
              onClick={() => navigate(`/record/${p._id}`)} // Enables the click to document
              style={portraitCardStyle}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
            >
              <div style={{ overflow: 'hidden', height: '280px', backgroundColor: '#f5f5f5' }}>
                <img 
                  src={p.imageUrl} 
                  alt={p.fullName} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0', color: '#333', fontFamily: 'serif' }}>
                  {p.fullName || 'Unknown Person'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#737958', margin: 0 }}>
                  {p.eventDate || p.publicationDate || 'Year Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const portraitCardStyle = {
  backgroundColor: 'white',
  border: '1px solid #ACA37E',
  borderRadius: '4px', // Slight rounding for a "framed" look
  overflow: 'hidden',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
};

export default PortraitGallery;