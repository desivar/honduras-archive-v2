import React, { useState } from 'react';
import axios from 'axios';

// ─── ResultCard ───────────────────────────────────────────────────────────────

const ResultCard = ({ record, onDeleteSuccess }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';

  const displayName = Array.isArray(record.names)
    ? record.names.join(', ')
    : record.fullName || 'Unknown';

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token },
        });
        alert('Record deleted successfully');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch (err) {
        alert('Error deleting record');
      }
    }
  };

  const copyCitation = () => {
    const { eventDate, category, location, newspaperName, pageNumber } = record;
    const source = newspaperName || 'Documento de Archivo';
    const page = pageNumber || 's/n';
    const citation = `${displayName} (${eventDate || 'n.d.'}). ${category}. ${location || 'Honduras'}: ${source}, p. ${page}.`;
    navigator.clipboard.writeText(citation);
    alert('APA Citation copied to clipboard!');
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        border: '2px solid #737958',
      }}
    >
      {record.imageUrl && (
        <img
          src={record.imageUrl}
          alt={displayName}
          loading="lazy"
          style={{
            width: '100%',
            borderRadius: '4px',
            marginBottom: '15px',
            display: 'block',
            height: 'auto',
            objectFit: 'contain',
            maxHeight: '500px',
          }}
        />
      )}

      <h3 style={{ color: '#737958', margin: '0 0 10px 0', fontSize: '1.3rem' }}>
        {displayName}
        {record.countryOfOrigin && (
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            {' '}(from {record.countryOfOrigin})
          </span>
        )}
      </h3>

      <div style={{ fontSize: '0.9rem', color: '#333' }}>
        <p style={{ marginBottom: '8px' }}><strong>Category:</strong> {record.category}</p>
        <p style={{ marginBottom: '8px' }}><strong>Date:</strong> {record.dateOfPublication || record.eventDate || 'n.d.'}</p>
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

      <button
        onClick={copyCitation}
        style={{
          marginTop: '15px',
          width: '100%',
          padding: '12px',
          backgroundColor: '#737958',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '0.95rem',
        }}
      >
        📄 Copy APA Citation
      </button>

      {isAdmin && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            onClick={() => (window.location.href = `/edit/${record._id}`)}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#586379',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: '#a94442',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Pagination Controls ──────────────────────────────────────────────────────

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis logic
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages to show on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const btnBase = {
    padding: '8px 14px',
    border: '2px solid #737958',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    transition: 'background-color 0.2s, color 0.2s',
    minWidth: '40px',
  };

  const activeStyle = {
    ...btnBase,
    backgroundColor: '#737958',
    color: 'white',
  };

  const inactiveStyle = {
    ...btnBase,
    backgroundColor: 'white',
    color: '#737958',
  };

  const disabledStyle = {
    ...btnBase,
    backgroundColor: '#f0f0f0',
    color: '#aaa',
    borderColor: '#ccc',
    cursor: 'not-allowed',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        marginTop: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap',
      }}
    >
      {/* Previous */}
      <button
        style={currentPage === 1 ? disabledStyle : inactiveStyle}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ padding: '8px 4px', color: '#737958' }}>
            …
          </span>
        ) : (
          <button
            key={page}
            style={page === currentPage ? activeStyle : inactiveStyle}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        style={currentPage === totalPages ? disabledStyle : inactiveStyle}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
};

// ─── ResultList (paginated wrapper) ──────────────────────────────────────────

/**
 * Drop-in replacement for wherever you render your list of ResultCards.
 *
 * Props:
 *   records        – full array of record objects
 *   pageSize       – how many cards per page (default: 10)
 *   onDeleteSuccess – callback forwarded to each card
 */
export const ResultList = ({ records = [], pageSize = 10, onDeleteSuccess }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(records.length / pageSize);

  // Slice the records for the current page
  const paginated = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll smoothly to the top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a record is deleted, reset to page 1 so we don't land on an empty page
  const handleDelete = () => {
    setCurrentPage(1);
    if (onDeleteSuccess) onDeleteSuccess();
  };

  return (
    <div>
      {/* Results count */}
      <p style={{ color: '#737958', fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>
        Showing {paginated.length} of {records.length} result{records.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
      </p>

      {/* Cards */}
      {paginated.map((record) => (
        <ResultCard
          key={record._id}
          record={record}
          onDeleteSuccess={handleDelete}
        />
      ))}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ResultCard;