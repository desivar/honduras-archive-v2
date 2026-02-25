import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [names, setNames] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState(""); // 👈 Add this state
  const [category, setCategory] = useState("Portrait");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [newspaperName, setNewspaperName] = useState(""); // 👈 Added Origin
  const [pageNumber, setPageNumber] = useState("");     // 👈 Added Page
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('names', JSON.stringify(names.split(',').map(n => n.trim())));
    formData.append('countryOfOrigin', countryOfOrigin);
    formData.append('category', category);
    formData.append('eventDate', eventDate);
    formData.append('location', location);
    formData.append('newspaperName', newspaperName);
    formData.append('pageNumber', pageNumber);
    formData.append('summary', summary);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive.onrender.com/api/archive', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token 
        }
      });
      alert("Record uploaded successfully!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Error uploading record. Make sure you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#737958', textAlign: 'center' }}>Upload New Archive Record</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label>Names (separate with commas):</label>
        <input type="text" value={names} onChange={(e) => setNames(e.target.value)} required placeholder="e.g. Sara Gravina, Carlos Izaguirre" style={inputStyle} />
         {/* 🟢 ADD THIS BOX HERE */}
<label>Person's Origin (e.g. from Italy, from New York):</label>
<input 
  type="text" 
  value={countryOfOrigin} 
  onChange={(e) => setCountryOfOrigin(e.target.value)} 
  placeholder="e.g. Italy" 
  style={inputStyle} 
/>
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          <option value="Portrait">Portrait</option>
          <option value="News">News & Clippings</option>
          <option value="Birth">Birth </option>
          <option value="Marriage">Marriage</option>
          <option value="Death">Death</option>
        </select>

        <label>Event Date:</label>
        <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="e.g. 5 de Enero 1930" style={inputStyle} />

        <label>Location:</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Tegucigalpa, Francisco Morazán" style={inputStyle} />

        {/* 🟢 NEW FIELDS */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label>Newspaper/Source:</label>
            <input type="text" value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} placeholder="e.g. El Cronista" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Page:</label>
            <input type="text" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} placeholder="e.g. 5" style={inputStyle} />
          </div>
        </div>

        <label>Summary of Record:</label>
<textarea 
  value={summary} // 🟢 Changed from description to summary
  onChange={(e) => setSummary(e.target.value)} // 🟢 Changed from setDescription
  rows="4" 
  style={inputStyle} 
/>

        <label>Upload Image:</label>
        <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" style={inputStyle} />

        <button type="submit" disabled={loading} style={{ padding: '15px', backgroundColor: '#737958', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? "Uploading..." : "Save to Archive"}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem'
};

export default UploadPage;