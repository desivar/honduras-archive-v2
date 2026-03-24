import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ResultCard from '../components/ResultCard';

const CollectionView = ({ type }) => {  // 👈 type comes from props, not useParams
  const { value } = useParams();        // 👈 only value comes from URL
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        // 👇 Fix 1: correct query param mapping
        const queryParam = type === 'letter' ? 'letter' : 'category';
        
        // 👇 Fix 2: correct API endpoint + res.data.items
        const res = await axios.get(`https://honduras-archive.onrender.com/api/archive?${queryParam}=${value}`);
        setResults(res.data.items);  // 👈 Fix 3: was res.data
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [type, value]);

  return (
    <div style={{ 
      padding: '40px',   // 👈 removed marginLeft, App.jsx already handles this
      backgroundColor: '#EFE7DD', 
      minHeight: '100vh' 
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#737958', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to Search
        </Link>
      </div>

      <h2 style={{ 
        fontFamily: 'serif', 
        color: '#737958', 
        borderBottom: '2px solid #ACA37E',
        paddingBottom: '10px',
        textTransform: 'capitalize'
      }}>
        {type === 'letter' ? 'Surname Index' : 'Collection'}: {value}
      </h2>

      {loading ? (
        <p style={{ marginTop: '20px', color: '#666' }}>Loading records...</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '25px', 
          marginTop: '30px' 
        }}>
          {results.length > 0 ? (
            results.map(record => (
              <ResultCard key={record._id} 
              record={record} />
              
            ))
          ) : (
            <p style={{ color: '#666' }}>No records found in this section yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionView;