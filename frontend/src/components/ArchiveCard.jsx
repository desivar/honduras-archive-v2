import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ArchiveCard = ({ record, category, onDeleteSuccess }) => {
  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem('user'))?.role === 'admin';

  // This "Switch" handles the differences between collections
  const getInfo = () => {
    switch (category) {
      case 'Business': return { title: record.businessName, icon: '🏢', sub: record.businessType };
      case 'Historic Event': return { title: record.eventName, icon: '🏛️', sub: record.location };
      case 'Portrait': return { title: record.fullName, icon: '🖼️', sub: record.eventDate };
      case 'Person': return { title: record.fullName, icon: '👤', sub: record.occupation };
      default: return { title: record.title || 'Record', icon: '📄', sub: '' };
    }
  };

  const { title, icon, sub } = getInfo();

  const stop = (e) => e.stopPropagation(); // Helper to stop "double clicks"

  return (
    <div 
      onClick={() => navigate(`/record/${record._id}`)} 
      style={cardStyle}
    >
      <div style={headerStyle}>
        <span>{icon}</span>
        <h3 style={{ color: 'white', margin: 0 }}>{title}</h3>
      </div>
      
      {record.imageUrl && <img src={record.imageUrl} style={imgStyle} alt={title} />}

      <div style={{ padding: '15px' }}>
        <p><strong>{sub}</strong></p>
        <button onClick={(e) => { stop(e); /* Citation Logic */ }}>📄 Cite</button>
        {isAdmin && <button onClick={(e) => { stop(e); /* Delete Logic */ }}>🗑️ Delete</button>}
      </div>
    </div>
  );
};

// ... add your styles here ...
export default ArchiveCard;