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

  const displayName = isBusiness
    ? (record.businessName || 'Unnamed Business')
    : isHistoricEvent
      ? (record.eventName || 'Unnamed Event')
      : (Array.isArray(record.names) && record.names.length > 0
          ? record.names.join(', ')
          : record.fullName || 'Unknown');

  const [showShare, setShowShare] = useState(false);
  const recordUrl = `${window.location.origin}/record/${record._id}`;
  const accentColor = isBusiness ? '#586379' : '#737958';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: displayName, text: `📜 ${displayName} — Recuerdos de Honduras`, url: recordUrl }); }
      catch {}
    } else { navigator.clipboard.writeText(recordUrl); alert('Link copied!'); }
    setShowShare(false);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`📜 *${displayName}* — Recuerdos de Honduras\n${recordUrl}`)}`, '_blank');
    setShowShare(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recordUrl)}`, '_blank');
    setShowShare(false);
  };

  const handleDownload = async () => {
    if (!record.imageUrl) return;
    try {
      const response = await fetch(record.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${displayName.replace(/\s+/g, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { window.open(record.imageUrl, '_blank'); }
    setShowShare(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, { headers: { 'x-auth-token': token } });
        alert('Record deleted successfully');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch { alert('Error deleting record'); }
    }
  };

  const copyCitation = () => {
    const source = record.newspaperName || 'Archivo Nacional';
    const page = record.pageNumber || 's/n';
    const dateForCitation = record.publicationDate || record.eventDate || 'n.d.';
    navigator.clipboard.writeText(`${displayName} (${dateForCitation}). ${record.category}. ${record.location || 'Honduras'}: ${source}, p. ${page}.`);
    alert('APA Citation copied to clipboard!');
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`https://honduras-archive.onrender.com/api/auth/activity/bookmark/${record._id}`, {}, { headers: { 'x-auth-token': token } });
      alert(res.data.bookmarked ? '🔖 Bookmarked!' : 'Bookmark removed');
    } catch { alert('Error updating bookmark'); }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: `2px solid ${accentColor}`, position: 'relative' }}>
      {record.imageUrl && (
        <img src={record.imageUrl} alt={displayName} loading="lazy"
          style={{ width: '100%', borderRadius: '4px', marginBottom: '15px', display: 'block', height: 'auto', objectFit: 'contain', maxHeight: '500px' }} />
      )}

      <h3 style={{ color: accentColor, margin: '0 0 10px 0', fontSize: '1.3rem' }}>
        {isBusiness && '🏢 '}{isHistoricEvent && '🏛️ '}{displayName}
        {record.countryOfOrigin && <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}> (from {record.countryOfOrigin})</span>}
      </h3>

      <div style={{ fontSize: '0.9rem', color: '#333' }}>
        <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {record.category}</p>

        {isBusiness && (
          <div style={{ backgroundColor: '#f0f2f5', border: '1px solid #c5cae9', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px' }}>
            {record.businessType && <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}><strong>🏷️ Type:</strong> {record.businessType}</p>}
            {record.owner && <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem' }}><strong>👤 Owner:</strong> {record.owner}</p>}
            {record.yearFounded && <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>📅 Year:</strong> {record.yearFounded}</p>}
          </div>
        )}

        <div style={{ backgroundColor: '#f7f5ef', border: '1px solid #e0dcc8', borderRadius: '6px', padding: '8px 12px', marginBottom: '10px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {record.eventDate && <span style={{ fontSize: '0.85rem' }}><strong>📅 Event Date:</strong> {record.eventDate}</span>}
          {record.publicationDate && <span style={{ fontSize: '0.85rem' }}><strong>📰 Published:</strong> {record.publicationDate}</span>}
          {!record.eventDate && !record.publicationDate && record.dateOfPublication && <span style={{ fontSize: '0.85rem' }}><strong>📅 Date:</strong> {record.dateOfPublication}</span>}
          {!record.eventDate && !record.publicationDate && !record.dateOfPublication && <span style={{ fontSize: '0.85rem', color: '#999' }}>📅 Date: n.d.</span>}
        </div>

        {record.peopleInvolved && record.peopleInvolved.length > 0 && (
          <div style={{ marginBottom: '8px' }}><strong>People Involved:</strong> {record.peopleInvolved.join(', ')}</div>
        )}

        <p style={{ marginBottom: '8px' }}><strong>Source:</strong> {record.newspaperName || 'Archivo Nacional'}{record.pageNumber && ` (Pg. ${record.pageNumber})`}</p>
        <p style={{ marginBottom: '8px' }}><strong>Location:</strong> {record.location}</p>

        {record.summary && (
          <p style={{ marginBottom: '8px', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '5px' }}>
            {record.summary.substring(0, 100)}...
          </p>
        )}
      </div>

      <button onClick={copyCitation} style={{ marginTop: '15px', width: '100%', padding: '12px', backgroundColor: accentColor, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>
        📄 Copy APA Citation
      </button>

      {/* 🟢 Share button */}
      <div style={{ position: 'relative', marginTop: '8px' }}>
        <button onClick={() => setShowShare(prev => !prev)} style={{ width: '100%', padding: '10px', backgroundColor: 'white', color: accentColor, border: `2px solid ${accentColor}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
          📤 Share
        </button>
        {showShare && (
          <div style={{ position: 'absolute', bottom: '110%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #ddd', zIndex: 100, overflow: 'hidden' }}>
            {'share' in navigator && <button onClick={handleNativeShare} style={shareItemStyle}>📱 Share (Mobile)</button>}
            <button onClick={handleShareWhatsApp} style={{ ...shareItemStyle, color: '#25D366' }}>💬 WhatsApp</button>
            <button onClick={handleShareFacebook} style={{ ...shareItemStyle, color: '#1877F2' }}>📘 Facebook</button>
            {record.imageUrl && <button onClick={handleDownload} style={shareItemStyle}>💾 Download Image</button>}
          </div>
        )}
      </div>

      {isGenealogist && (
        <button onClick={handleBookmark} style={{ marginTop: '8px', width: '100%', padding: '10px', backgroundColor: 'white', color: '#737958', border: '2px solid #737958', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
          🔖 Bookmark
        </button>
      )}

      {isAdmin && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => window.location.href = `/edit/${record._id}`} style={{ flex: 1, padding: '10px', backgroundColor: '#586379', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>
          <button onClick={handleDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#a94442', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
        </div>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const getPageNumbers = () => {
    const pages = [], delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) pages.push(i);
      else if (pages[pages.length - 1] !== '...') pages.push('...');
    }
    return pages;
  };
  const btnBase = { padding: '8px 14px', border: '2px solid #737958', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', minWidth: '40px' };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
      <button style={currentPage === 1 ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Prev</button>
      {getPageNumbers().map((page, idx) => page === '...'
        ? <span key={`e-${idx}`} style={{ padding: '8px 4px', color: '#737958' }}>…</span>
        : <button key={page} style={page === currentPage ? { ...btnBase, backgroundColor: '#737958', color: 'white' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }} onClick={() => onPageChange(page)}>{page}</button>
      )}
      <button style={currentPage === totalPages ? { ...btnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' } : { ...btnBase, backgroundColor: 'white', color: '#737958' }} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
    </div>
  );
};

// ─── ResultList ───────────────────────────────────────────────────────────────
export const ResultList = ({ records = [], pageSize = 20, onDeleteSuccess }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(records.length / pageSize);
  const paginated = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleDelete = () => { setCurrentPage(1); if (onDeleteSuccess) onDeleteSuccess(); };
  return (
    <div>
      <p style={{ color: '#737958', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>
        Showing {paginated.length} of {records.length} result{records.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {paginated.map(record => <ResultCard key={record._id} record={record} onDeleteSuccess={handleDelete} />)}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
};

const shareItemStyle = { display: 'block', width: '100%', padding: '11px 16px', backgroundColor: 'white', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: '#333', fontWeight: 'bold' };

export default ResultCard;