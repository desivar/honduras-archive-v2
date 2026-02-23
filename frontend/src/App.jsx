import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/SideBar';
import SearchPage from './pages/SearchPage';
import UploadPage from './pages/UploadPage';
import CollectionView from './pages/CollectionView';
import RecordDetail from './pages/RecordDetail';
import Login from './pages/LoginPage';
import Register from './pages/Register';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import EditPage from './pages/EditPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0); // 📊 Added state for Magnitude
  const [lastUpdate, setLastUpdate] = useState(null); // 👈 add this

  useEffect(() => {
    // 1. Restore User Session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        localStorage.removeItem('user');
      }
    }

    // 2. Fetch Archive Magnitude for Sidebar
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://honduras-archive.onrender.com/api/archive');
        setTotalCount(response.data.totalCount || 0);
        setLastUpdate(response.data.lastUpdate || null); // 👈 add this
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#EFE7DD' }}>
        <p style={{ fontSize: '1.2rem', color: '#737958', fontWeight: 'bold' }}>Downloading Archive...</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
        
        {/* ✅ Sidebar now receives user AND totalCount */}
      
<Sidebar user={user} onLogout={handleLogout} totalCount={totalCount} lastUpdate={lastUpdate} />
        
        {/* ✅ Main Content Area: MarginLeft matches Sidebar width to prevent overlapping */}
        <main style={{ 
          marginLeft: '260px', 
          flex: 1, 
          padding: '20px', 
          width: 'calc(100% - 260px)', 
          boxSizing: 'border-box' 
        }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SearchPage />} />
            <Route path="/record/:id" element={<RecordDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/edit/:id" element={user && user.role === 'admin' ? <EditPage /> : <Navigate to="/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/upload" element={user && user.role === 'admin' ? <UploadPage /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/login" replace />} />

            {/* Archive Navigation */}
            <Route path="/category/:value" element={<CollectionView type="category" />} />
            
            <Route path="/alpha/:value" element={<CollectionView type="letter" />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;