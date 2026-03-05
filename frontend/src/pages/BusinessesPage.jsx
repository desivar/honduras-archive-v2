import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BusinessCard = ({ record, onDeleteSuccess }) => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user && user.role === 'admin';

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${record.businessName}"?`)) {
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

  const copyCitation = () => {
    const source = record.newspaperName || 'Archivo Nacional';
    const page = record.pageNumber || 's/n';
    const date = record.publicationDate || record.eventDate || record.yearFounded || 'n.d.';
    const citation = `${record.businessName} (${date}). Business Record. ${record.location || 'Honduras'}: ${source}, p. ${page}.`;
    navigator.clipboard.writeText(citation);
    alert('APA Citation copied to clipboard!');
  };

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '2px solid #ACA37E',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ backgroundColor: '#586379', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>🏢</span>
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', fontFamily: 'serif' }}>
            {record.businessName || 'Unnamed Business'}
          </h3>
          {record.businessType && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)' }}>{record.businessType}</p>
          )}
        </div>
      </div>

      {record.imageUrl && (
        <img src={record.imageUrl} alt={record.businessName} loading="lazy"
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
      )}

      <div style={{ padding: '16px', flex: 1, fontSize: '0.9rem', color: '#333' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {record.yearFounded && <span style={badgeStyle}>📅 {record.yearFounded}</span>}
          {record.location && <span style={badgeStyle}>📍 {record.location}</span>}
        </div>

        {record.owner && (
          <p style={{ marginBottom: '8px' }}>
            <strong>Owner:</strong> {record.owner}
          </p>
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

      <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={copyCitation} style={citeBtnStyle}>📄 Copy APA Citation</button>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.location.href = `/edit/${record._id}`} style={editBtnStyle}>✏️ Edit</button>
            <button onClick={handleDelete} style={deleteBtnStyle}>🗑️ Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

const badgeStyle = {
  backgroundColor: '#f0ede3', border: '1px solid #ACA37E',
  borderRadius: '20px', padding: '3px 10px', fontSize: '0.82rem', color: '#555'
};
const citeBtnStyle = {
  width: '100%', padding: '10px', backgroundColor: '#586379',
  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
};
const editBtnStyle = {
  flex: 1, padding: '9px', backgroundColor: '#737958',
  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
};
const deleteBtnStyle = {
  flex: 1, padding: '9px', backgroundColor: '#a94442',
  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const BusinessesPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 9;

  const fetchBusinesses = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category: 'Business' });
      if (searchTerm) params.append('search', searchTerm);
      const res = await axios.get(`https://honduras-archive.onrender.com/api/archive?${params.toString()}`);
      setBusinesses(res.data.items || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchBusinesses(searchInput);
  };

  const handleClear = () => {
    setSearchInput(''); setSearch('');
    fetchBusinesses('');
  };

  const totalPages = Math.ceil(businesses.length / PAGE_SIZE);
  const paginated = businesses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ padding: '40px', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#737958', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Search</Link>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'serif', color: '#737958', fontSize: '2rem', margin: '0 0 4px 0', borderBottom: '2px solid #ACA37E', paddingBottom: '10px' }}>
          🏢 Businesses
        </h1>
        <p style={{ color: '#888', margin: '8px 0 0 0', fontSize: '0.95rem' }}>
          {businesses.length} business record{businesses.length !== 1 ? 's' : ''} in the archive
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px', maxWidth: '520px' }}>
        <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
          placeholder="Search by name, owner, type..."
          style={{ flex: 1, padding: '11px 14px', borderRadius: '6px', border: '2px solid #ACA37E', fontSize: '0.95rem', backgroundColor: 'white', outline: 'none' }} />
        <button type="submit" style={{ padding: '11px 20px', backgroundColor: '#737958', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Search
        </button>
        {search && (
          <button type="button" onClick={handleClear} style={{ padding: '11px 16px', backgroundColor: 'white', color: '#737958', border: '2px solid #737958', borderRadius: '6px', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <p style={{ color: '#737958' }}>⏳ Loading businesses...</p>
      ) : paginated.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>
          <p style={{ fontSize: '2rem' }}>🏢</p>
          <p>No business records found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {paginated.map(record => (
              <BusinessCard key={record._id} record={record} onDeleteSuccess={() => fetchBusinesses(search)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '36px' }}>
              <button onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === 1} style={currentPage === 1 ? pageBtnDisabled : pageBtnInactive}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={page === currentPage ? pageBtnActive : pageBtnInactive}>{page}</button>
              ))}
              <button onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === totalPages} style={currentPage === totalPages ? pageBtnDisabled : pageBtnInactive}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const pageBtnBase = { padding: '8px 14px', borderRadius: '4px', border: '2px solid #737958', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', minWidth: '40px' };
const pageBtnActive = { ...pageBtnBase, backgroundColor: '#737958', color: 'white' };
const pageBtnInactive = { ...pageBtnBase, backgroundColor: 'white', color: '#737958' };
const pageBtnDisabled = { ...pageBtnBase, backgroundColor: '#f0f0f0', color: '#aaa', borderColor: '#ccc', cursor: 'not-allowed' };

export default BusinessesPage;
