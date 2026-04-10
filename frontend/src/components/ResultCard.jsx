import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ─── ResultCard (The Individual Card) ────────────────────────────────────────
const ResultCard = ({ record, category, onDeleteSuccess }) => {
  const navigate = useNavigate();

  // Auth & Permissions
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem('token');
  const isAdmin = user && user.role === 'admin';

  // Determine Accent Color
  const isBusiness = record.category === 'Business' || category === 'Business';
  const accentColor = isBusiness ? '#586379' : '#737958';

  // 1. Unified Logic for different collections
  const getInfo = () => {
    const currentCat = category || record.category;
    switch (currentCat) {
      case 'Business':
        return { title: record.businessName || 'Unnamed Business', icon: '🏢', sub: record.businessType };
      case 'Portrait':
        return { title: record.fullName || 'Portrait', icon: '🖼️', sub: record.eventDate };
      case 'Birth': case 'Births':
        return { title: record.fullName || 'Birth Record', icon: '👶', sub: record.eventDate };
      case 'Death': case 'Deaths':
        return { title: record.fullName || 'Death Record', icon: '⚰️', sub: record.eventDate };
      case 'Marriage': case 'Marriages':
        return { title: record.fullName || 'Marriage Record', icon: '💍', sub: record.eventDate };
      case 'News': case 'Newspaper':
        return { title: record.headline || 'News Clipping', icon: '📰', sub: record.newspaperName };
      default:
        return { title: record.fullName || record.title || 'Archive Record', icon: '📄', sub: record.location || '' };
    }
  };

  const { title, icon, sub } = getInfo();
  

  // 2. Handlers
  // ✅ KEY FIX: Instead of stopPropagation on every button,
  // we check if the click target was a button before navigating.
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return; // let buttons handle themselves
    navigate(`/record/${record._id}`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axios.delete(`https://honduras-archive-v2.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token }
        });
        alert('Record deleted');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        alert('Error deleting record');
      }
    }
  };

const copyCitation = (e) => {
  e.preventDefault();
  const source = record.newspaperName || 'Archivo Nacional';
  const date = record.publicationDate || record.eventDate || 'n.d.';
  const url = `${window.location.origin}/record/${record._id}`; // 👈 moved here
  navigator.clipboard.writeText(`${title} (${date}). ${record.category}. ${record.location || 'Honduras'}: ${source}. ${url}`);
  alert('APA Citation copied!');
};

  return (
    <div
      onClick={handleCardClick}   // ✅ smart click — ignores button clicks
      style={{
        backgroundColor: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        border: `2px solid ${accentColor}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <h3 style={{ color: accentColor, margin: 0, fontSize: '1.2rem' }}>{title}</h3>
      </div>

      {/* Image Area — rendered once, here only */}
      {record.imageUrl && (
        <img
          src={record.imageUrl}
          alt={title}
          loading="lazy"
          style={{
            width: '100%',
            borderRadius: '4px',
            marginBottom: '15px',
            display: 'block',
            height: 'auto',
            objectFit: 'contain',
            maxHeight: '400px'
          }}
        />
      )}

      {/* Info Area */}
      <div style={{ flex: 1 }}>
        {sub && <p style={{ fontSize: '0.9rem', color: '#333', margin: '5px 0' }}><strong>{sub}</strong></p>}
        <p style={{ fontSize: '0.8rem', color: '#777' }}>Category: {record.category || category}</p>
      </div>

      {/* Button Area — no stopPropagation needed, handleCardClick handles it */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
        <button onClick={copyCitation} style={btnStyle(accentColor, true)}>📄 Cite</button>

        {isAdmin && (
          <>
            <button
              onClick={() => window.location.href = `/edit/${record._id}`}
              style={btnStyle('#586379')}
            >
              ✏️ Edit
            </button>
            <button onClick={handleDelete} style={btnStyle('#a94442')}>🗑️ Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── ResultList (The Grid Layout) ───────────────────────────────────────────
export const ResultList = ({ records = [], pageSize = 20, onDeleteSuccess }) => {
 const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(records.length / pageSize);
  const paginated = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <p style={{ color: '#737958', fontWeight: 'bold', marginBottom: '16px' }}>
        Showing {records.length} results
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {paginated.map(record => (
          <ResultCard key={record._id} record={record} onDeleteSuccess={onDeleteSuccess} />
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────
const btnStyle = (color, isSolid = false) => ({
  padding: '8px 12px',
  backgroundColor: isSolid ? color : 'white',
  color: isSolid ? 'white' : color,
  border: `1px solid ${color}`,
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 'bold'
});

export default ResultCard;