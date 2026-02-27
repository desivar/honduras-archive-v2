import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultCard, { ResultList } from '../components/ResultCard';

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

      {loading ? (
        <p style={{ textAlign: 'center', color: '#737958', fontSize: '1.1rem' }}>⏳ Loading...</p>
      ) : results.length > 0 ? (
        <ResultList
          records={results}
          pageSize={10}
          onDeleteSuccess={fetchAllRecords}
        />
      ) : (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem' }}>
          {query ? `No records found for "${query}".` : 'No records in archive yet.'}
        </p>
      )}
    </div>
  );
};

export default SearchPage;