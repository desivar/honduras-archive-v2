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
import About from './pages/About';
import HistoricEventsPage from './pages/HistoricEventsPage';
import BusinessesPage from './pages/BusinessesPage';           // 🟢
import GenealogistDashboard from './pages/GenealogistDashboard'; // 🟢

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem('user'); }
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('https://honduras-archive.onrender.com/api/archive');
        setTotalCount(response.data.totalCount || 0);
        setLastUpdate(response.data.lastUpdate || null);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('sessionStart');
    localStorage.removeItem('sessionIndex');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#EFE7DD' }}>
        <p style={{ fontSize: '1.2rem', color: '#737958', fontWeight: 'bold' }}>Downloading Archive...</p>
      </div>
    );
  }

  const isAdmin = user && user.role === 'admin';
  const isGenealogist = user && user.role === 'genealogist';

  return (
    <Router>
      <div style={{ display: 'flex', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={handleLogout} totalCount={totalCount} lastUpdate={lastUpdate} />

        <main style={{ marginLeft: '260px', flex: 1, padding: '20px', width: 'calc(100% - 260px)', boxSizing: 'border-box' }}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<SearchPage />} />
            <Route path="/record/:id" element={<RecordDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            {/* Auth */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route path="/upload" element={isAdmin ? <UploadPage /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={isAdmin ? <AdminPanel /> : <Navigate to="/login" replace />} />
            <Route path="/edit/:id" element={isAdmin ? <EditPage /> : <Navigate to="/login" replace />} />

            {/* Genealogist */}
            <Route path="/dashboard" element={isGenealogist ? <GenealogistDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} />

            {/* Collections */}
            <Route path="/category/:value" element={<CollectionView type="category" />} />
            <Route path="/alpha/:value" element={<CollectionView type="letter" />} />
            <Route path="/historic-events" element={<HistoricEventsPage />} />
            <Route path="/businesses" element={<BusinessesPage />} />  {/* 🟢 */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;