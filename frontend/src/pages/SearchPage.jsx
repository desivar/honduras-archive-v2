import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultCard from '../components/ResultCard';

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllRecords();
  }, []);

  const fetchAllRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://honduras-archive.onrender.com/api/archive');
      // ✅ Using .items to match your new backend format
      setResults(response.data.items || []);
    } catch (error) {
      console.error("Error loading archive:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      fetchAllRecords();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`https://honduras-archive.onrender.com/api/archive?search=${query}`);
      // ✅ Using .items here as well
      setResults(response.data.items || []);
    } catch (error) {
      console.error("Error fetching from database:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#EFE7DD', minHeight: '100vh' }}>
      
      {/* 🧹 Removed the Magnitude box from here since it's moving to the Sidebar */}

      <h1 style={{ color: '#737958', marginBottom: '20px', fontSize: '2.5rem' }}>Recuerdos de Honduras</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          placeholder="Search by name or country..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ padding: '12px', flex: 1, borderRadius: '6px', border: '2px solid #737958', fontSize: '1rem' }}
        />
        <button 
          onClick={handleSearch}
          style={{ padding: '12px 24px', backgroundColor: '#737958', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Searching...' : 'Search Archive'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {!loading && results.length > 0 ? (
          results.map(record => <ResultCard key={record._id} record={record} />)
        ) : (
          !loading && <p style={{ textAlign: 'center', color: '#666', gridColumn: '1 / -1', fontSize: '1.1rem' }}>
            {query ? `No records found for "${query}".` : 'No records in archive yet.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;