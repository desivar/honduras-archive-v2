import { Link } from 'react-router-dom'; // Add this to your imports

// Inside your return() function, before the form starts:
<div style={switchContainerStyle}>
  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
    Have a full PDF magazine or newspaper?
  </p>
  <Link to="/batch-upload" style={batchLinkStyle}>
    🚀 Switch to AI Batch Mode
  </Link>
</div>


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Shared
  const [category, setCategory] = useState('Portrait');
  const [eventDate, setEventDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState(null);

  // Person fields
  const [names, setNames] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');

  // Historic Event fields
  const [eventName, setEventName] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState('');

  // 🟢 Business fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [owner, setOwner] = useState('');
  const [yearFounded, setYearFounded] = useState('');

  const isHistoricEvent = category === 'Historic Event';
  const isBusiness = category === 'Business';
  const isPersonRecord = !isHistoricEvent && !isBusiness;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('eventDate', eventDate);
    formData.append('publicationDate', publicationDate);
    formData.append('location', location);
    formData.append('newspaperName', newspaperName);
    formData.append('pageNumber', pageNumber);
    formData.append('summary', summary);
    if (image) formData.append('image', image);

    if (isHistoricEvent) {
      formData.append('eventName', eventName);
      formData.append('peopleInvolved', JSON.stringify(
        peopleInvolved.split(',').map(n => n.trim()).filter(Boolean)
      ));
      formData.append('names', JSON.stringify([]));
    } else if (isBusiness) {
      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      formData.append('owner', owner);
      formData.append('yearFounded', yearFounded);
      formData.append('names', JSON.stringify([]));
      formData.append('peopleInvolved', JSON.stringify([]));
    } else {
      formData.append('names', JSON.stringify(
        names.split(',').map(n => n.trim()).filter(Boolean)
      ));
      formData.append('countryOfOrigin', countryOfOrigin);
      formData.append('peopleInvolved', JSON.stringify([]));
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive.onrender.com/api/archive', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
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

        {/* Category */}
        <div>
          <label style={labelStyle}>Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            <option value="Portrait">Portrait</option>
            <option value="News">News &amp; Clippings</option>
            <option value="Birth">Birth</option>
            <option value="Marriage">Marriage</option>
            <option value="Death">Death</option>
            <option value="Historic Event">🏛️ Historic Event</option>
            <option value="Business">🏢 Business</option>
          </select>
        </div>

        {/* Historic Event fields */}
        {isHistoricEvent && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🏛️ Historic Event Details</p>
            <div>
              <label style={labelStyle}>Event Name: *</label>
              <input type="text" value={eventName} onChange={e => setEventName(e.target.value)}
                required placeholder="e.g. Battle of La Trinidad" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>People Involved (separate with commas):</label>
              <textarea value={peopleInvolved} onChange={e => setPeopleInvolved(e.target.value)}
                placeholder="e.g. Francisco Morazán, José Cecilio del Valle..."
                rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
              <p style={hintStyle}>Separate each name with a comma</p>
            </div>
          </div>
        )}

        {/* 🟢 Business fields */}
        {isBusiness && (
          <div style={sectionStyle}>
            <p style={sectionTitleStyle}>🏢 Business Details</p>
            <div>
              <label style={labelStyle}>Business Name: *</label>
              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                required placeholder="e.g. Casa Comercial Morazán" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Type of Business:</label>
                <input type="text" value={businessType} onChange={e => setBusinessType(e.target.value)}
                  placeholder="e.g. Import, Pharmacy, Hotel" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Year Founded / Mentioned:</label>
                <input type="text" value={yearFounded} onChange={e => setYearFounded(e.target.value)}
                  placeholder="e.g. 1905" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Owner(s):</label>
              <input type="text" value={owner} onChange={e => setOwner(e.target.value)}
                placeholder="e.g. Don Carlos Izaguirre" style={inputStyle} />
            </div>
          </div>
        )}

        {/* Person fields */}
        {isPersonRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Names (separate with commas): *</label>
              <input type="text" value={names} onChange={e => setNames(e.target.value)}
                required placeholder="e.g. Sara Gravina, Carlos Izaguirre" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Person's Origin:</label>
              <input type="text" value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)}
                placeholder="e.g. Italy" style={inputStyle} />
            </div>
          </div>
        )}

        {/* Dual dates */}
        <div style={{ ...sectionStyle, gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#737958', fontWeight: 'bold', textTransform: 'uppercase' }}>
            📅 Dates
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Event:</label>
              <input type="text" value={eventDate} onChange={e => setEventDate(e.target.value)}
                placeholder="e.g. 5 de Enero 1827" style={inputStyle} />
              <p style={hintStyle}>When it actually happened</p>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Publication:</label>
              <input type="text" value={publicationDate} onChange={e => setPublicationDate(e.target.value)}
                placeholder="e.g. 12 de Marzo 1930" style={inputStyle} />
              <p style={hintStyle}>When it appeared in the source</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location / Place:</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Tegucigalpa, Francisco Morazán" style={inputStyle} />
        </div>

        {/* Source */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Newspaper / Source:</label>
            <input type="text" value={newspaperName} onChange={e => setNewspaperName(e.target.value)}
              placeholder="e.g. El Cronista" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Page:</label>
            <input type="text" value={pageNumber} onChange={e => setPageNumber(e.target.value)}
              placeholder="e.g. 5" style={inputStyle} />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label style={labelStyle}>Description / Summary:</label>
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows="4"
            placeholder={
              isHistoricEvent ? 'Describe what happened during this event...'
              : isBusiness ? 'Describe the business, its history, products or services...'
              : 'Summary of the record...'}
            style={inputStyle} />
        </div>

        {/* Image */}
        <div>
          <label style={labelStyle}>Upload Image:</label>
          <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" style={inputStyle} />
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '15px', backgroundColor: loading ? '#aaa' : '#737958',
          color: 'white', border: 'none', borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem'
        }}>
          {loading ? 'Uploading...' : '💾 Save to Archive'}
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const hintStyle = { margin: '4px 0 0 0', fontSize: '0.75rem', color: '#999', fontStyle: 'italic' };
const sectionStyle = { backgroundColor: '#f7f5ef', border: '2px solid #ACA37E', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' };
const sectionTitleStyle = { margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' };

// --

const switchContainerStyle = {
  backgroundColor: '#f0f4f8',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  textAlign: 'center',
  border: '1px dashed #4A90E2'
};

const batchLinkStyle = {
  display: 'inline-block',
  marginTop: '8px',
  padding: '10px 20px',
  backgroundColor: '#4A90E2',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};
export default UploadPage;