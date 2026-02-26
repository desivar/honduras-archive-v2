import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [category, setCategory] = useState('Portrait');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState(null);

  // Person-record fields
  const [names, setNames] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');

  // Historic Event fields
  const [eventName, setEventName] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState('');

  const isHistoricEvent = category === 'Historic Event';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('eventDate', eventDate);
    formData.append('location', location);
    formData.append('newspaperName', newspaperName);
    formData.append('pageNumber', pageNumber);
    formData.append('summary', summary);
    if (image) formData.append('image', image);

    if (isHistoricEvent) {
      formData.append('eventName', eventName);
      formData.append(
        'peopleInvolved',
        JSON.stringify(peopleInvolved.split(',').map(n => n.trim()).filter(Boolean))
      );
      formData.append('names', JSON.stringify([])); // keep schema happy
    } else {
      formData.append(
        'names',
        JSON.stringify(names.split(',').map(n => n.trim()).filter(Boolean))
      );
      formData.append('countryOfOrigin', countryOfOrigin);
      formData.append('peopleInvolved', JSON.stringify([]));
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive.onrender.com/api/archive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
      alert('Record uploaded successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error uploading record. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '620px', margin: '40px auto', padding: '30px',
      backgroundColor: 'white', borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '24px' }}>
        Upload New Archive Record
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Category (controls which fields appear) ── */}
        <div>
          <label style={labelStyle}>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            <option value="Portrait">Portrait</option>
            <option value="News">News &amp; Clippings</option>
            <option value="Birth">Birth</option>
            <option value="Marriage">Marriage</option>
            <option value="Death">Death</option>
            <option value="Historic Event">🏛️ Historic Event</option>
          </select>
        </div>

        {/* ── HISTORIC EVENT fields ── */}
        {isHistoricEvent && (
          <div style={{
            backgroundColor: '#f7f5ef', border: '2px solid #ACA37E',
            borderRadius: '8px', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' }}>
              🏛️ Historic Event Details
            </p>

            <div>
              <label style={labelStyle}>Event Name: *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                placeholder="e.g. Battle of La Trinidad"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>People Involved (separate with commas):</label>
              <input
                type="text"
                value={peopleInvolved}
                onChange={(e) => setPeopleInvolved(e.target.value)}
                placeholder="e.g. Francisco Morazán, José Cecilio del Valle"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* ── PERSON record fields ── */}
        {!isHistoricEvent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Names (separate with commas): *</label>
              <input
                type="text"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                required
                placeholder="e.g. Sara Gravina, Carlos Izaguirre"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Person's Origin:</label>
              <input
                type="text"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                placeholder="e.g. Italy"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* ── Shared fields ── */}
        <div>
          <label style={labelStyle}>Date:</label>
          <input
            type="text"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="e.g. 5 de Enero 1830"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Location / Place:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Tegucigalpa, Francisco Morazán"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Newspaper / Source:</label>
            <input
              type="text"
              value={newspaperName}
              onChange={(e) => setNewspaperName(e.target.value)}
              placeholder="e.g. El Cronista"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Page:</label>
            <input
              type="text"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="e.g. 5"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Description / Summary:</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows="4"
            placeholder={isHistoricEvent ? 'Describe what happened during this event...' : 'Summary of the record...'}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Upload Image:</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '15px',
            backgroundColor: loading ? '#aaa' : '#737958',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            marginTop: '4px'
          }}
        >
          {loading ? 'Uploading...' : '💾 Save to Archive'}
        </button>
      </form>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  color: '#444'
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  width: '100%',
  boxSizing: 'border-box'
};

export default UploadPage;