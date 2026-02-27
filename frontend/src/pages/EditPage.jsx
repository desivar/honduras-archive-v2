import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [names, setNames] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [category, setCategory] = useState('Portrait');
  const [eventDate, setEventDate] = useState('');
  const [publicationDate, setPublicationDate] = useState(''); // 🟢 NEW
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [eventName, setEventName] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState('');

  const isHistoricEvent = category === 'Historic Event';

  useEffect(() => {
    if (!id) {
      setFetchError('No record ID found in the URL.');
      setLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        const res = await axios.get(`https://honduras-archive.onrender.com/api/archive/${id}`);
        const r = res.data;

        if (!r || Object.keys(r).length === 0) {
          setFetchError('The server returned an empty record. Please try again.');
          setLoading(false);
          return;
        }

        setNames(Array.isArray(r.names) ? r.names.join(', ') : r.fullName || '');
        setCountryOfOrigin(r.countryOfOrigin || '');
        setCategory(r.category || 'Portrait');
        setEventDate(r.eventDate || '');
        setPublicationDate(r.publicationDate || ''); // 🟢
        setLocation(r.location || '');
        setNewspaperName(r.newspaperName || '');
        setPageNumber(r.pageNumber || '');
        setSummary(r.summary || '');
        setEventName(r.eventName || '');
        setPeopleInvolved(Array.isArray(r.peopleInvolved) ? r.peopleInvolved.join(', ') : '');
        setImageUrl(r.imageUrl || '');
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message;
        setFetchError(
          status === 404
            ? `Record not found (ID: ${id}). It may have been deleted.`
            : `Error loading record: ${message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://honduras-archive.onrender.com/api/archive/${id}`,
        {
          names: names.split(',').map(n => n.trim()).filter(Boolean),
          countryOfOrigin, category,
          eventDate, publicationDate, // 🟢
          location, newspaperName, pageNumber, summary,
          eventName,
          peopleInvolved: peopleInvolved.split(',').map(n => n.trim()).filter(Boolean)
        },
        { headers: { 'x-auth-token': token } }
      );
      alert('Record updated successfully!');
      navigate(-1);
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      alert(`Error updating record: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <p style={{ padding: '40px', color: '#737958', textAlign: 'center' }}>⏳ Loading record…</p>
  );

  if (fetchError) return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      <p style={{ color: '#a94442', fontWeight: 'bold' }}>⚠️ {fetchError}</p>
      <button onClick={() => navigate(-1)} style={{
        marginTop: '16px', padding: '10px 20px', backgroundColor: '#737958',
        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
      }}>← Go Back</button>
    </div>
  );

  return (
    <div style={{
      maxWidth: '620px', margin: '40px auto', padding: '30px',
      backgroundColor: 'white', borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '20px' }}>
        Edit Archive Record
      </h2>

      {/* Image preview */}
      {imageUrl && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px' }}>Current image (read-only):</p>
          <img
            src={imageUrl} alt="Record"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
            style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <p style={{ display: 'none', color: '#a94442', fontSize: '0.85rem', marginTop: '6px' }}>
            ⚠️ Image could not be loaded.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* Category */}
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

        {/* Historic Event fields */}
        {isHistoricEvent && (
          <div style={{
            backgroundColor: '#f7f5ef', border: '2px solid #ACA37E',
            borderRadius: '8px', padding: '14px',
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.9rem' }}>
              🏛️ Historic Event Details
            </p>
            <div>
              <label style={labelStyle}>Event Name:</label>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Battle of La Trinidad" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>People Involved (separate with commas):</label>
              <input type="text" value={peopleInvolved} onChange={(e) => setPeopleInvolved(e.target.value)}
                placeholder="e.g. Francisco Morazán" style={inputStyle} />
            </div>
          </div>
        )}

        {/* Person fields */}
        {!isHistoricEvent && (
          <>
            <div>
              <label style={labelStyle}>Names (separate with commas):</label>
              <input type="text" value={names} onChange={(e) => setNames(e.target.value)}
                required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Country of Origin:</label>
              <input type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)}
                style={inputStyle} />
            </div>
          </>
        )}

        {/* 🟢 Dual date fields */}
        <div style={{
          backgroundColor: '#f7f5ef', border: '1px solid #ACA37E',
          borderRadius: '8px', padding: '14px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#737958', fontWeight: 'bold', textTransform: 'uppercase' }}>
            📅 Dates
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Event:</label>
              <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                placeholder="e.g. 5 de Enero 1827" style={inputStyle} />
              <p style={hintStyle}>When it actually happened</p>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date of Publication:</label>
              <input type="text" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)}
                placeholder="e.g. 12 de Marzo 1930" style={inputStyle} />
              <p style={hintStyle}>When it appeared in the source</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location:</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
        </div>

        {/* Source */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Newspaper / Source:</label>
            <input type="text" value={newspaperName} onChange={(e) => setNewspaperName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Page:</label>
            <input type="text" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label style={labelStyle}>Summary:</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows="4" style={inputStyle} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            flex: 1, padding: '14px', backgroundColor: 'white', color: '#737958',
            border: '2px solid #737958', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
          }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{
            flex: 2, padding: '14px',
            backgroundColor: saving ? '#aaa' : '#737958',
            color: 'white', border: 'none', borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold'
          }}>
            {saving ? '⏳ Saving…' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

const labelStyle = {
  display: 'block', marginBottom: '4px',
  fontWeight: 'bold', fontSize: '0.9rem', color: '#444'
};

const inputStyle = {
  padding: '10px', borderRadius: '4px',
  border: '1px solid #ccc', fontSize: '1rem',
  width: '100%', boxSizing: 'border-box'
};

const hintStyle = {
  margin: '4px 0 0 0', fontSize: '0.75rem', color: '#999', fontStyle: 'italic'
};

export default EditPage;