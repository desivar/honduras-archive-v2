import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArchiveCard = ({ record, category, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

  // 1. Determine the color based on category
  const accentColor = (category === 'Business' || record.category === 'Business') ? '#586379' : '#737958';

  // 2. The Logic for Icons and Titles (Unified)
  const getInfo = () => {
    const currentCat = category || record.category;
    switch (currentCat) {
      case 'Business': 
        return { title: record.businessName || 'Unnamed Business', icon: '🏢', sub: record.businessType };
      case 'Portrait': 
        return { title: record.fullName || 'Portrait', icon: '🖼️', sub: record.eventDate };
      case 'Birth': case 'Births':
        return { title: record.fullName || 'Birth Record', icon: '👶', sub: record.eventDate };
      case 'News': case 'Newspaper':
        return { title: record.headline || 'News Clipping', icon: '📰', sub: record.newspaperName };
      default: 
        return { title: record.fullName || record.title || 'Archive Record', icon: '📄', sub: record.location || '' };
    }
  };

  const { title, icon, sub } = getInfo();

  // 3. Handle Delete (This uses axios and onDeleteSuccess)
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevents the card from opening
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token }
        });
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        alert('Error deleting');
      }
    }
  };

  return (
    <div 
      onClick={() => navigate(`/record/${record._id}`)} 
      style={{
        backgroundColor: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        border: `2px solid ${accentColor}`,
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <h3 style={{ color: accentColor, margin: 0 }}>{title}</h3>
      </div>
      
      {record.imageUrl && (
        <img 
          src={record.imageUrl} 
          alt={title} 
          style={{ width: '100%', borderRadius: '4px', marginBottom: '10px' }} 
        />
      )}

      <p style={{ fontSize: '0.9rem', margin: '5px 0' }}><strong>{sub}</strong></p>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); alert("Citation Copied!"); }} 
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          📄 Cite
        </button>
        
        {isAdmin && (
          <button 
            onClick={handleDelete} 
            style={{ padding: '5px 10px', color: 'red', cursor: 'pointer' }}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ArchiveCard;