import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for navigation

const BatchReviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // Form States (Matching your original structure)
  const [category, setCategory] = useState('News');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [newspaperName, setNewspaperName] = useState('Tegucigalpa');
  const [pageNumber, setPageNumber] = useState('');

  // 1. THE "SMART SCAN" TRIGGER
  const handleBatchScan = async () => {
    if (!pdfFile) return alert("Please select a PDF first!");
    
    setIsScanning(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      // Calling your new Backend Route on Render
      const res = await axios.post('https://honduras-archive.onrender.com/api/batch/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 🤖 THE HANDSHAKE: Filling the form with Internal AI results
      const { autoFields } = res.data;
      setCategory(autoFields.category || 'News');
      setSummary(autoFields.summary || '');
      setLocation(autoFields.location || '');
      
      alert("Internal AI Scan Complete! Please review the 1800s data below.");
    } catch (err) {
      console.error("Scanning error:", err);
      alert("The Internal AI had trouble reading this document. You can still fill it manually.");
    } finally {
      setIsScanning(false);
    }
  };

  // 2. THE FINAL SAVE (Sends to your original MongoDB route)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalData = new FormData();
    finalData.append('category', category);
    finalData.append('summary', summary);
    finalData.append('location', location);
    finalData.append('publicationDate', publicationDate);
    finalData.append('newspaperName', newspaperName);
    finalData.append('pageNumber', pageNumber);
    // Note: Since this is a PDF batch, we usually save the PDF text or a specific page image
    // For now, it will save the AI-extracted text to your database.

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive.onrender.com/api/archive', finalData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      alert('Record saved to the Archive!');
      navigate('/');
    } catch (err) {
      alert('Error saving record. Check if you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Back Button */}
      <Link to="/upload" style={{ textDecoration: 'none', color: '#4A90E2', fontSize: '0.8rem' }}>
        ← Back to Manual Upload
      </Link>

      <h2 style={{ color: '#737958', textAlign: 'center', marginTop: '10px' }}>🏛️ 1800s Batch Indexer</h2>
      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        Automated processing for historical magazines and newspapers.
      </p>

      {/* STEP 1: UPLOAD & SCAN */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Select Archive PDF:</label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={e => setPdfFile(e.target.files[0])} 
          style={inputStyle} 
        />
        <button 
          onClick={handleBatchScan} 
          disabled={isScanning || !pdfFile}
          style={{
            ...scanButtonStyle,
            backgroundColor: isScanning ? '#ccc' : '#4A90E2'
          }}
        >
          {isScanning ? '⏳ Internal AI is reading 1800s text...' : '🔍 Scan with Internal AI'}
        </button>
      </div>

      <hr style={{ margin: '30px 0', border: '0.5px solid #eee' }} />

      {/* STEP 2: REVIEW & SAVE */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Suggested Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            <option value="News">News & Clippings</option>
            <option value="Birth">Birth</option>
            <option value="Marriage">Marriage</option>
            <option value="Death">Death</option>
            <option value="Business">🏢 Business</option>
            <option value="Portrait">Portrait</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>AI Extracted Summary:</label>
          <textarea 
            value={summary} 
            onChange={e => setSummary(e.target.value)} 
            rows="6" 
            style={{ ...inputStyle, fontFamily: 'serif', lineHeight: '1.4' }} 
            placeholder="The AI results will appear here..."
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Location:</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Pub. Date:</label>
            <input type="text" value={publicationDate} onChange={e => setPublicationDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Source:</label>
            <input type="text" value={newspaperName} onChange={e => setNewspaperName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Page #:</label>
            <input type="text" value={pageNumber} onChange={e => setPageNumber(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={loading || isScanning} style={{
          ...saveButtonStyle,
          backgroundColor: (loading || isScanning) ? '#aaa' : '#737958'
        }}>
          {loading ? 'Saving to Archive...' : '💾 Confirm & Save to MongoDB'}
        </button>
      </form>
    </div>
  );
};

// --- STYLES ---
const containerStyle = { maxWidth: '700px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' };
const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const sectionStyle = { backgroundColor: '#f7f5ef', border: '2px solid #ACA37E', borderRadius: '8px', padding: '16px', marginBottom: '20px' };
const scanButtonStyle = { marginTop: '10px', width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const saveButtonStyle = { padding: '15px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };

export default BatchReviewPage;