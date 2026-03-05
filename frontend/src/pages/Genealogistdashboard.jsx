import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const GenealogistDashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://honduras-archive.onrender.com/api/auth/dashboard', {
          headers: { 'x-auth-token': token }
        });
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      const sessionIndex = localStorage.getItem('sessionIndex');
      await axios.post('https://honduras-archive.onrender.com/api/auth/logout',
        { sessionIndex: parseInt(sessionIndex) },
        { headers: { 'x-auth-token': token } }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('sessionStart');
      localStorage.removeItem('sessionIndex');
      if (onLogout) onLogout();
      navigate('/');
    }
  };

  const removeBookmark = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://honduras-archive.onrender.com/api/auth/activity/bookmark/${recordId}`,
        {}, { headers: { 'x-auth-token': token } }
      );
      setData(prev => ({
        ...prev,
        bookmarks: prev.bookmarks.filter(b => b._id !== recordId)
      }));
    } catch (err) {
      alert('Error removing bookmark');
    }
  };

  const saveNote = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://honduras-archive.onrender.com/api/auth/activity/note/${recordId}`,
        { text: noteText },
        { headers: { 'x-auth-token': token } }
      );
      setData(prev => ({
        ...prev,
        notes: prev.notes.map(n =>
          n.recordId?._id === recordId ? { ...n, text: noteText } : n
        )
      }));
      setEditingNote(null);
      setNoteText('');
    } catch {
      alert('Error saving note');
    }
  };

  // Calculate current session duration
  const sessionStart = localStorage.getItem('sessionStart');
  const currentSessionMinutes = sessionStart
    ? Math.round((new Date() - new Date(sessionStart)) / 60000)
    : 0;

  const formatMinutes = (mins) => {
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const tabStyle = (tab) => ({
    padding: '10px 18px', cursor: 'pointer', fontWeight: 'bold',
    borderBottom: activeTab === tab ? '3px solid #737958' : '3px solid transparent',
    color: activeTab === tab ? '#737958' : '#888',
    background: 'none', border: 'none', fontSize: '0.9rem'
  });

  if (loading) return (
    <div style={{ padding: '40px', color: '#737958', textAlign: 'center' }}>⏳ Loading dashboard...</div>
  );

  if (!data) return (
    <div style={{ padding: '40px', color: '#a94442', textAlign: 'center' }}>
      Could not load dashboard. <Link to="/">← Go home</Link>
    </div>
  );

  return (
    <div style={{ padding: '40px', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#737958', fontFamily: 'serif', fontSize: '1.8rem' }}>
            🔬 Genealogist Dashboard
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#888', fontSize: '0.95rem' }}>
            Welcome back, <strong>{data.username}</strong> · Member since {new Date(data.memberSince).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/" style={{
            padding: '9px 16px', backgroundColor: 'white', color: '#737958',
            border: '2px solid #737958', borderRadius: '6px', textDecoration: 'none',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}>
            ← Archive
          </Link>
          <button onClick={handleLogout} style={{
            padding: '9px 16px', backgroundColor: '#737958', color: 'white',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { icon: '⏱️', label: 'This Session', value: formatMinutes(currentSessionMinutes) },
          { icon: '📊', label: 'Total Time', value: formatMinutes(data.totalMinutesSpent) },
          { icon: '🔍', label: 'Searches Made', value: data.recentSearches.length },
          { icon: '🔖', label: 'Bookmarks', value: data.bookmarks.length },
          { icon: '📝', label: 'Notes', value: data.notes.length },
          { icon: '🗓️', label: 'Sessions', value: data.totalSessions },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: 'white', padding: '16px', borderRadius: '8px',
            border: '2px solid #ACA37E', textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.6rem', margin: '0 0 4px 0' }}>{stat.icon}</p>
            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold', color: '#737958' }}>{stat.value}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#888' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '24px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📋 Overview</button>
        <button style={tabStyle('bookmarks')} onClick={() => setActiveTab('bookmarks')}>
          🔖 Bookmarks ({data.bookmarks.length})
        </button>
        <button style={tabStyle('notes')} onClick={() => setActiveTab('notes')}>
          📝 Notes ({data.notes.length})
        </button>
        <button style={tabStyle('history')} onClick={() => setActiveTab('history')}>
          🔍 Search History
        </button>
        <button style={tabStyle('sessions')} onClick={() => setActiveTab('sessions')}>
          🗓️ Sessions
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Recent searches */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🔍 Recent Searches</h3>
            {data.recentSearches.length === 0 ? (
              <p style={emptyStyle}>No searches yet.</p>
            ) : (
              data.recentSearches.slice(0, 8).map((s, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem' }}>"{s.query}"</span>
                  <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{new Date(s.searchedAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent bookmarks */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>🔖 Recent Bookmarks</h3>
            {data.bookmarks.length === 0 ? (
              <p style={emptyStyle}>No bookmarks yet. Click the bookmark button on any record.</p>
            ) : (
              data.bookmarks.slice(0, 5).map(record => (
                <div key={record._id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: '#737958' }}>
                    {Array.isArray(record.names) && record.names.length > 0
                      ? record.names.join(', ')
                      : record.eventName || 'Unknown'}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#888' }}>{record.category}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Bookmarks Tab ── */}
      {activeTab === 'bookmarks' && (
        <div>
          {data.bookmarks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={{ fontSize: '1.5rem' }}>🔖</p>
              <p>No bookmarks yet. Browse the archive and click the bookmark button on records.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {data.bookmarks.map(record => (
                <div key={record._id} style={{
                  backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden',
                  border: '2px solid #ACA37E'
                }}>
                  {record.imageUrl && (
                    <img src={record.imageUrl} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '14px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#737958' }}>
                      {Array.isArray(record.names) && record.names.length > 0
                        ? record.names.join(', ') : record.eventName || 'Unknown'}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '0.82rem', color: '#888' }}>
                      {record.category} · {record.eventDate || 'n.d.'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <Link to={`/record/${record._id}`} style={{
                        flex: 1, textAlign: 'center', padding: '7px', backgroundColor: '#737958',
                        color: 'white', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem'
                      }}>View</Link>
                      <button onClick={() => removeBookmark(record._id)} style={{
                        flex: 1, padding: '7px', backgroundColor: 'white', color: '#a94442',
                        border: '1px solid #a94442', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem'
                      }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Notes Tab ── */}
      {activeTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={{ fontSize: '1.5rem' }}>📝</p>
              <p>No notes yet. Add notes to records while browsing the archive.</p>
            </div>
          ) : (
            data.notes.map((note, i) => (
              <div key={i} style={{
                backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '2px solid #ACA37E'
              }}>
                <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#737958', fontSize: '0.9rem' }}>
                  {note.recordId
                    ? (Array.isArray(note.recordId.names) && note.recordId.names.length > 0
                      ? note.recordId.names.join(', ')
                      : note.recordId.eventName || 'Unknown Record')
                    : 'Record'}
                </p>
                {editingNote === i ? (
                  <div>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                      rows="3" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '0.9rem' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => saveNote(note.recordId?._id)} style={{
                        padding: '7px 16px', backgroundColor: '#737958', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer'
                      }}>Save</button>
                      <button onClick={() => setEditingNote(null)} style={{
                        padding: '7px 16px', backgroundColor: 'white', color: '#737958',
                        border: '1px solid #737958', borderRadius: '4px', cursor: 'pointer'
                      }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: '1.5', flex: 1 }}>{note.text}</p>
                    <button onClick={() => { setEditingNote(i); setNoteText(note.text); }} style={{
                      marginLeft: '12px', padding: '4px 10px', backgroundColor: 'white', color: '#737958',
                      border: '1px solid #737958', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem'
                    }}>✏️ Edit</button>
                  </div>
                )}
                <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#aaa' }}>
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Search History Tab ── */}
      {activeTab === 'history' && (
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Your Search History</h3>
          {data.recentSearches.length === 0 ? (
            <p style={emptyStyle}>No searches recorded yet.</p>
          ) : (
            data.recentSearches.map((s, i) => (
              <div key={i} style={{
                padding: '8px 0', borderBottom: '1px solid #f0f0f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem' }}>🔍 "{s.query}"</span>
                <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{new Date(s.searchedAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Sessions Tab ── */}
      {activeTab === 'sessions' && (
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Recent Sessions</h3>
          {data.sessions.length === 0 ? (
            <p style={emptyStyle}>No session data yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f7f5ef' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#737958' }}>Login</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#737958' }}>Logout</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#737958' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((session, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                      {new Date(session.loginAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#888' }}>
                      {session.logoutAt ? new Date(session.logoutAt).toLocaleString() : '— active'}
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold', color: '#737958' }}>
                      {session.duration ? formatMinutes(session.duration) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  backgroundColor: 'white', borderRadius: '8px',
  padding: '20px', border: '2px solid #ACA37E'
};
const cardTitleStyle = {
  margin: '0 0 14px 0', color: '#737958', fontSize: '1rem', fontWeight: 'bold'
};
const emptyStyle = { color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' };

export default GenealogistDashboard;