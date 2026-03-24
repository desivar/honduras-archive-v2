import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // 1. Added useNavigate

// ── Event Card ────────────────────────────────────────────────────────────────
const EventCard = ({ record, onDeleteSuccess }) => {
  const navigate = useNavigate(); // 2. Initialize navigate
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';

  const handleDelete = async (e) => {
    e.stopPropagation(); // 3. Prevent card click
    if (window.confirm(`Are you sure you want to delete "${record.eventName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://honduras-archive.onrender.com/api/archive/${record._id}`, {
          headers: { 'x-auth-token': token }
        });
        alert('Record deleted successfully');
        if (onDeleteSuccess) onDeleteSuccess();
      } catch {
        alert('Error deleting record');
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // 4. Prevent card click
    navigate(`/edit/${record._id}`); // Use navigate instead of window.location
  };

  const copyCitation = (e) => {
    e.stopPropagation(); // 5. Prevent card click
    const source = record.newspaperName || 'Archivo Nacional';
    const page = record.pageNumber || 's/n';
    const dateForCitation = record.publicationDate || record.eventDate || 'n.d.';
    const citation = `${record.eventName} (${dateForCitation}). Historic Event. ${record.location || 'Honduras'}: ${source}, p. ${page}.`;
    navigator.clipboard.writeText(citation);
    alert('APA Citation copied to clipboard!');
  };

  return (
    <div 
      onClick={() => navigate(`/record/${record._id}`)} // 6. Make entire card clickable
      style={{
        backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #ACA37E',
        display: 'flex', flexDirection: 'column', cursor: 'pointer', // Added cursor
        transition: 'transform 0.15s, box-shadow 0.15s' // Smooth hover
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
    >
      {/* Header banner */}
      <div style={{ backgroundColor: '#737958', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>🏛️</span>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', fontFamily: 'serif' }}>
          {record.eventName || 'Unnamed Event'}
        </h3>
      </div>

      {/* Image */}
      {record.imageUrl && (
        <div style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #eee' }}>
          <img
            src={record.imageUrl}
            alt={record.eventName}
            loading="lazy"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block' }} // Changed to contain to see full image
          />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '16px', flex: 1, fontSize: '0.9rem', color: '#333' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          {record.eventDate && <span style={badgeStyle}>📅 {record.eventDate}</span>}
          {record.publicationDate && <span style={badgeStyle}>📰 {record.publicationDate}</span>}
          {record.location && <span style={badgeStyle}>📍 {record.location}</span>}
        </div>

        {record.peopleInvolved && record.peopleInvolved.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <strong>People Involved:</strong>
            <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {record.peopleInvolved.map((person, i) => (
                <span key={i} style={personBadgeStyle}>{person}</span>
              ))}
            </div>
          </div>
        )}

        {record.summary && (
          <p style={{
            marginTop: '10px', fontStyle: 'italic', borderTop: '1px solid #eee', 
            paddingTop: '10px', lineHeight: '1.5', color: '#555'
          }}>
            {record.summary.substring(0, 140)}{record.summary.length > 140 ? '…' : ''}
          </p>
        )}

        <p style={{ marginTop: '10px', fontSize: '0.82rem', color: '#888' }}>
          <strong>Source:</strong> {record.newspaperName || 'Archivo Nacional'}
          {record.pageNumber && ` (Pg. ${record.pageNumber})`}
        </p>
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={copyCitation} style={citeBtnStyle}>📄 Copy APA Citation</button>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleEdit} style={editBtnStyle}>✏️ Edit</button>
            <button onClick={handleDelete} style={deleteBtnStyle}>🗑️ Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ... Rest of your code (badgeStyle, HistoricEventsPage, etc.) stays the same ...