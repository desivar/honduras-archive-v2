import React, { useState } from 'react';
import axios from 'axios';

// ─── ResultCard ───────────────────────────────────────────────────────────────
const ResultCard = ({ record, onDeleteSuccess }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';
  const isGenealogist = user && user.role === 'genealogist';

  const isBusiness = record.category === 'Business';
  const isHistoricEvent = record.category === 'Historic Event';

  // 🟢 Smart display name: business > event > names > fallback
  const displayName = isBusiness
    ? (record.businessName || 'Unnamed Business')
    : isHistoricEvent
      ? (record.eventName || 'Unnamed Event')
      : (Array.isArray(record.names) && record.names.length > 0
          ? record.names.join(', ')
          : record.fullName || 'Unknown');

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token },
        });
        alert('Record deleted successfully');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch {
        alert('Error deleting record');
      }
    }
  };

  const copyCitation = () => {
    const { category, location, newspaperName, pageNumber, eventDate, publicationDate } = record;
    const source = newspaperName || 'Archivo Nacional';
    const page = pageNumber || 's/n';
    const dateForCitation = publicationDate || eventDate || 'n.d.';
    const citation = `${displayName} (${dateForCitation}). ${category}. ${location || 'Honduras'}: ${source}, p. ${page}.`;
    navigator.clipboard.writeText(citation);
    alert('APA Citation copied to clipboard!');
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://honduras-archive.onrender.com/api/auth/activity/bookmark/${record._id}`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      alert(res.data.bookmarked ? '🔖 Bookmarked!' : 'Bookmark removed');
    } catch {
      alert('Error updating bookmark');
    }
  };

  return (
    <div style={{
      backgroundColor: 'white', padding: '20px', marginBottom: '20px',
      borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      border: `2px solid ${isBusiness ? '#586379' : '#737958'}`,
    }}>
      {record.imageUrl && (
        <img src={record.imageUrl} alt={displayName} loading="lazy"
          style={{ width: '100%', borderRadius: '4px', marginBottom: '15px', display: 'block', height: 'auto', objectFit: 'contain', maxHeight: '500px' }}
        />
      )}

      <h3 style={{ color: isBusiness ? '#586379' : '#737958', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
        {isBusiness && <span style={{ marginRight: '6px' }}>🏢</span>}
        {isHistoricEvent && <span style={{ marginRight: '6px' }}>🏛️</span>}
        {displayName}
        {record.countryOfOrigin && (
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            {' '}(from {record.countryOfOrigin})
          </span>
        )}
      </h3>

      <div style={{ fontSize: '0.9rem', color: '#333' }}>
        <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {record.category}</p>

        {/* 🟢 Business-specific fields */}
        {isBusiness && (
          <div style={{ backgroundColor: '#f0f2f5', border: '1px solid #c5cae9', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
            {record.businessType && (
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}>
                <strong>🏷️ Type:</strong> {record.businessType}
              </p>
            )}
            {record.owner && (
              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}>
                <strong>👤 Owner:</strong> {record.owner}
              </p>
            )}
            {record.yearFounded && (
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                <strong>📅 Year:</strong> {record.yearFounded}
              </p>
            )}
          </div>
        )}

        {/* Dates */}
        <div style={{
          backgroundColor: '#f7f5ef', border: '1px solid #e0dcc8',
          borderRadius: '6px', padding: '8px 12px', marginBottom: '10px',
          display: 'flex', gap: '20px', flexWrap: 'wrap'
        }}>
          {record.eventDate && (
            <span style={{ fontSize: '0.85rem' }}><strong>📅 Event Date:</strong> {record.eventDate}</span>
          )}
          {record.publicationDate && (
            <span style={{ fontSize: '0.85rem' }}><strong>📰 Published:</strong> {record.publicationDate}</span>
          )}
          {!record.eventDate && !record.publicationDate && record.dateOfPublication && (
            <span style={{ fontSize: '0.85rem' }}><strong>📅 Date:</strong> {record.dateOfPublication}</span>
          )}
          {!record.eventDate && !record.publicationDate && !record.dateOfPublication && (
            <span style={{ fontSize: '0.85rem', color: '#999' }}>📅 Date: n.d.</span>
          )}
        </div>

        {/* People involved */}
        {record.peopleInvolved && record.peopleInvolved.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>People Involved:</strong> {record.peopleInvolved.join(', ')}
          </div>
        )}

        <p style={{ marginBottom: '8px' }}>
          <strong>Source:</strong> {record.newspaperName || 'Archivo Nacional'}
          {record.pageNumber && ` (Pg. ${record.pageNumber})`}
        </p>
        <p style={{ marginBottom: '8px' }}><strong>Location:</strong> {record.location}</p>

        {record.summary && (
          <p style={{ marginBottom: '8px', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '5px' }}>
            {record.summary.substring(0, 100)}...
          </p>
        )}
      </div>

      {/* Actions */}
      <button onClick={copyCitation} style={{
        marginTop: '15px', width: '100%', padding: '12px',
        backgroundColor: isBusiness ? '#586379' : '#737958',
        color: 'white', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem',
      }}>
        📄 Copy APA Citation
      </button>

      {/* Genealogist bookmark button */}
      {isGenealogist && (
        <button onClick={handleBookmark} style={{
          marginTop: '8px', width: '100%', padding: '10px',
          backgroundColor: 'white', color: '#737958',
          border: '2px solid #737958', borderRadius: '4px',
          cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
        }}>
          🔖 Bookmark
        </button>
      )}

      {isAdmin && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => window.location.href = `/edit/${record._id}`} style={{
            flex: 1, padding: '10px', backgroundColor: '#586379',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>✏️ Edit</button>
          <button onClick={handleDelete} style={{
            flex: 1, padding: '10px', backgroundColor: '#a94442',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
          }}>🗑️ Delete</button>
        </div>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const btnBase = {
    padding: '8px 14px', border: '2px solid #737958', borderRadius: '4px',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', minWidth: '40px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
      <button style={currentPage === 1 ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
        onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Prev</button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`e-${idx}`} style={{ padding: '8px 4px', color: '#737958' }}>…</span>
        ) : (
          <button key={page}
            style={page === currentPage ? { ...btnBase, backgroundColor: '#737958', color: 'white' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
            onClick={() => onPageChange(page)}>{page}</button>
        )
      )}

      <button style={currentPage === totalPages ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }}
        onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
    </div>
  );
};

// ─── ResultList ───────────────────────────────────────────────────────────────
export const ResultList = ({ records = [], pageSize = 20, onDeleteSuccess }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(records.length / pageSize);
  const paginated = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    setCurrentPage(1);
    if (onDeleteSuccess) onDeleteSuccess();
  };

  return (
    <div>
      <p style={{ color: '#737958', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>
        Showing {paginated.length} of {records.length} result{records.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {paginated.map(record => (
          <ResultCard key={record._id} record={record} onDeleteSuccess={handleDelete} />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

export default ResultCard;