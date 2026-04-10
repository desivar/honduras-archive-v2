import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        axios.get('https://honduras-archive-v2.onrender.com/api/auth/users'),
        axios.get('https://honduras-archive-v2.onrender.com/api/auth/users/pending')
      ]);
      setUsers(usersRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const changeRole = async (userId, newRole) => {
    try {
      await axios.put(`https://honduras-archive-v2.onrender.com/api/auth/users/role/${userId}`, { role: newRole });
      alert('Role updated!');
      fetchData();
    } catch {
      alert('Error updating role');
    }
  };

  const approveUser = async (userId, status) => {
    try {
      await axios.put(`https://honduras-archive.onrender.com/api/auth/users/approve/${userId}`, { status });
      alert(`User ${status}!`);
      fetchData();
    } catch {
      alert('Error updating status');
    }
  };

  const roleBadge = (role) => {
    const colors = {
      admin: { bg: '#737958', color: 'white' },
      genealogist: { bg: '#5c6bc0', color: 'white' },
      visitor: { bg: '#e0e0e0', color: '#555' }
    };
    const style = colors[role] || colors.visitor;
    return (
      <span style={{
        ...style, padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.8rem', fontWeight: 'bold'
      }}>
        {role}
      </span>
    );
  };

  const tabStyle = (tab) => ({
    padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold',
    borderBottom: activeTab === tab ? '3px solid #737958' : '3px solid transparent',
    color: activeTab === tab ? '#737958' : '#888',
    background: 'none', border: 'none', fontSize: '0.95rem'
  });

  return (
    <div style={{ padding: '40px', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
      <h2 style={{ color: '#737958', marginBottom: '24px' }}>⚙️ Admin Panel</h2>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: '24px', display: 'flex', gap: '4px' }}>
        <button style={tabStyle('pending')} onClick={() => setActiveTab('pending')}>
          ⏳ Pending Approvals
          {pending.length > 0 && (
            <span style={{
              marginLeft: '8px', backgroundColor: '#a94442', color: 'white',
              borderRadius: '20px', padding: '1px 7px', fontSize: '0.75rem'
            }}>
              {pending.length}
            </span>
          )}
        </button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>
          👥 All Users
        </button>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={{ fontSize: '1.5rem' }}>✅</p>
              <p>No pending registrations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pending.map(user => (
                <div key={user._id} style={{
                  backgroundColor: 'white', padding: '16px 20px', borderRadius: '8px',
                  border: '2px solid #ACA37E', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{user.username}</p>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#666' }}>{user.email}</p>
                    {user.whatsapp && (
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#888' }}>
                        📱 {user.whatsapp}
                      </p>
                    )}
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#aaa' }}>
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => approveUser(user._id, 'approved')} style={{
                      padding: '8px 16px', backgroundColor: '#737958', color: 'white',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => approveUser(user._id, 'rejected')} style={{
                      padding: '8px 16px', backgroundColor: '#a94442', color: 'white',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#737958', color: 'white' }}>
              <tr>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={tdStyle}><strong>{user.username}</strong></td>
                  <td style={tdStyle}>{user.email}</td>
                  <td style={tdStyle}>{roleBadge(user.role)}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem',
                      backgroundColor: user.status === 'approved' ? '#e8f5e9' : user.status === 'pending' ? '#fff8e1' : '#ffebee',
                      color: user.status === 'approved' ? '#2e7d32' : user.status === 'pending' ? '#f57f17' : '#c62828'
                    }}>
                      {user.status || 'approved'}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {user.role !== 'admin' && (
                        <button onClick={() => changeRole(user._id, 'admin')} style={smallBtnStyle('#737958')}>
                          → Admin
                        </button>
                      )}
                      {user.role !== 'genealogist' && (
                        <button onClick={() => changeRole(user._id, 'genealogist')} style={smallBtnStyle('#5c6bc0')}>
                          → Genealogist
                        </button>
                      )}
                      {user.role !== 'visitor' && (
                        <button onClick={() => changeRole(user._id, 'visitor')} style={smallBtnStyle('#888')}>
                          → Visitor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const thStyle = { padding: '12px 16px', textAlign: 'left', fontWeight: 'bold' };
const tdStyle = { padding: '12px 16px', verticalAlign: 'middle' };
const smallBtnStyle = (bg) => ({
  padding: '4px 10px', backgroundColor: bg, color: 'white',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
});

export default AdminPanel;