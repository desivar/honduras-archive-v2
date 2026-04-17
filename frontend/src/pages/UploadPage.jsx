import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TagInput = ({ tags, setTags, placeholder, inputId }) => {
  const [inputVal, setInputVal] = useState('');
  const addTag = (val) => {
    const trimmed = val.trim().replace(/,$/, '');
    if (trimmed) { setTags([...tags, trimmed]); setInputVal(''); }
  };
  return (
    <div
      style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', minHeight: '44px', height: 'auto', cursor: 'text', padding: '6px 10px' }}
      onClick={() => document.getElementById(inputId).focus()}
    >
      {tags.map((tag, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', background: '#e8e4d4', color: '#4a4a2a', border: '1px solid #ACA37E', borderRadius: '999px', padding: '2px 10px', fontSize: '13px', gap: '6px', whiteSpace: 'nowrap' }}>
          {tag}
          <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737958', fontSize: '15px', lineHeight: 1, padding: 0 }}>×</button>
        </span>
      ))}
      <input
        id={inputId} type="text" value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inputVal); }
          else if (e.key === 'Backspace' && !inputVal && tags.length > 0) setTags(tags.slice(0, -1));
        }}
        onBlur={() => addTag(inputVal)}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', flex: '1', minWidth: '160px' }}
      />
    </div>
  );
};

const UploadPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ── Scan / review state ─────────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);   // OCR finished, review mode ON
  const [approved, setApproved] = useState(false);   // human approved, ready to save
  const [imagePreview, setImagePreview] = useState(null);
  const [scannedImageUrl, setScannedImageUrl] = useState(null);
  const [scannedCloudinaryId, setScannedCloudinaryId] = useState(null);

  // ── Form fields ─────────────────────────────────────────────────────────────
  const [category, setCategory] = useState('Portrait');
  const [eventDate, setEventDate] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [location, setLocation] = useState('');
  const [newspaperName, setNewspaperName] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [image, setImage] = useState(null);
  const [names, setNames] = useState([]);
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [eventName, setEventName] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState([]);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [owner, setOwner] = useState('');
  const [yearFounded, setYearFounded] = useState('');

  const isHistoricEvent = category === 'Historic Event';
  const isBusiness = category === 'Business';
  const isPersonRecord = !isHistoricEvent && !isBusiness;

  // ── Reset everything ────────────────────────────────────────────────────────
  const handleReset = () => {
    setImage(null); setImagePreview(null);
    setScannedImageUrl(null); setScannedCloudinaryId(null);
    setScanDone(false); setApproved(false);
    setCategory('Portrait'); setEventDate(''); setPublicationDate('');
    setLocation(''); setNewspaperName(''); setPageNumber('');
    setSummary(''); setNames([]); setCountryOfOrigin('');
    setEventName(''); setPeopleInvolved([]);
    setBusinessName(''); setBusinessType(''); setOwner(''); setYearFounded('');
  };

  // ── Image pick ──────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setScanDone(false);
      setApproved(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Scan with Tesseract OCR ─────────────────────────────────────────────────
  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    setScanDone(false);
    setApproved(false);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('image', image);

      const res = await axios.post(
        'https://honduras-archive-v2.onrender.com/api/archive/scan',
        data,
        { headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token } }
      );

      const d = res.data;

      // Fill summary with extracted text — admin corrects everything else
      if (d.summary) setSummary(d.summary);

      // Save the Cloudinary info so we don't re-upload on save
      if (d.imageUrl)      setScannedImageUrl(d.imageUrl);
      if (d.cloudinaryId)  setScannedCloudinaryId(d.cloudinaryId);

      setScanDone(true);
    } catch (err) {
      console.error('Scan error:', err);
      alert('Scan failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScanning(false);
    }
  };

  // ── AI Auto-fill ────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    // 1. Token Check
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Session expired. Please log in again.");
      navigate('/login');
      return;
    }

    if (!image) return;
    setScanning(true);
    setScanDone(false);
    setApproved(false);

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      const res = await axios.post(
        'https://honduras-archive-v2.onrender.com/api/archive/analyze',
        { image: base64, category },
        { headers: { 'x-auth-token': token } } // Use the 'token' variable
      );
      
      const d = res.data;

      // Your existing form logic (these are all correctly inside the try block)
      if (d.summary)           { setSummary(d.summary); }
      if (d.eventDate)         { setEventDate(d.eventDate); }
      if (d.publicationDate)   { setPublicationDate(d.publicationDate); }
      if (d.location)          { setLocation(d.location); }
      if (d.newspaperName)     { setNewspaperName(d.newspaperName); }
      if (d.pageNumber)        { setPageNumber(d.pageNumber); }
      if (d.names?.length)     { setNames(d.names); }
      if (d.countryOfOrigin)   { setCountryOfOrigin(d.countryOfOrigin); }
      if (d.eventName)         { setEventName(d.eventName); }
      if (d.peopleInvolved?.length) { setPeopleInvolved(d.peopleInvolved); }
      if (d.businessName)      { setBusinessName(d.businessName); }
      if (d.businessType)      { setBusinessType(d.businessType); }
      if (d.owner)             { setOwner(d.owner); }
      if (d.yearFounded)       { setYearFounded(d.yearFounded); }
      if (d.imageUrl)          { setScannedImageUrl(d.imageUrl); }
      if (d.cloudinaryId)      { setScannedCloudinaryId(d.cloudinaryId); }

      setScanDone(true); 
    } catch (err) {
      console.error('AI Analyze error:', err);
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setScanning(false);
    }
  }; 
  // ── Submit — only works after human approves ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!approved) {
      alert('Please review all fields and click "✅ Approve Record" before saving.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('category', category);
    formData.append('eventDate', eventDate);
    formData.append('publicationDate', publicationDate);
    formData.append('location', location);
    formData.append('newspaperName', newspaperName);
    formData.append('pageNumber', pageNumber);
    formData.append('summary', summary);

    if (isHistoricEvent) {
      formData.append('eventName', eventName);
      formData.append('peopleInvolved', JSON.stringify(peopleInvolved));
      formData.append('names', JSON.stringify([]));
    } else if (isBusiness) {
      formData.append('businessName', businessName);
      formData.append('businessType', businessType);
      formData.append('owner', owner);
      formData.append('yearFounded', yearFounded);
      formData.append('names', JSON.stringify([]));
      formData.append('peopleInvolved', JSON.stringify([]));
    } else {
      formData.append('names', JSON.stringify(names));
      formData.append('countryOfOrigin', countryOfOrigin);
      formData.append('peopleInvolved', JSON.stringify([]));
    }

    // If image was already uploaded during scan, send its URL instead of re-uploading
    if (scannedImageUrl) {
      formData.append('imageUrl', scannedImageUrl);
      formData.append('cloudinaryId', scannedCloudinaryId);
    } else if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://honduras-archive-v2.onrender.com/api/archive', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      alert('✅ Record saved to archive successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error saving record: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#737958', textAlign: 'center', marginBottom: '24px' }}>
        Upload New Archive Record
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── STEP 1: Image upload ──────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#f7f5ef', border: '2px solid #ACA37E', borderRadius: '8px', padding: '16px' }}>
          <p style={stepTitleStyle}>📷 Step 1 — Upload the newspaper image</p>

          {imagePreview && (
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          )}

          <input type="file" onChange={handleImageChange} accept="image/*" style={inputStyle} />

          {/* Scan button */}
          {image && !scanDone && (
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleScan}
                disabled={scanning}
                style={{ ...btnStyle, backgroundColor: scanning ? '#aaa' : '#4a7c59' }}
              >
                {scanning ? '🔍 Scanning image... please wait' : '🔍 Scan image — extract text'}
              </button>
              {scanning && (
                <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#888' }}>
                  This may take 20–60 seconds depending on image size...
                </p>
              )}
            </div>
          )}

          {/* Scan done banner */}
          {scanDone && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff8e1', border: '2px solid #f4c430', borderRadius: '6px' }}>
              <strong style={{ color: '#737958' }}>✓ Text extracted!</strong>
              <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#555' }}>
                The extracted text is in the Summary field below. <strong>Please review every field, fix any errors, then click "Approve Record" at the bottom.</strong> Nothing is saved until you approve.
              </p>
              <button type="button" onClick={handleReset} style={{ marginTop: '8px', background: 'none', border: '1px solid #999', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.82rem', color: '#666' }}>
                ✖ Start over with a different image
              </button>
            </div>
          )}
        </div>

        {/* ── STEP 2: Review & fill fields (shown after scan OR can fill manually) ── */}
        <div style={{ backgroundColor: scanDone ? '#fffef5' : 'white', border: scanDone ? '2px solid #f4c430' : '2px solid #e0e0e0', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={stepTitleStyle}>
            {scanDone ? '✏️ Step 2 — Review extracted text and fill in all fields' : '✏️ Fill in the record details'}
          </p>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category: *</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setApproved(false); }} style={inputStyle}>
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
                <input type="text" value={eventName} onChange={e => { setEventName(e.target.value); setApproved(false); }} required placeholder="e.g. Battle of La Trinidad" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>People Involved:</label>
                <TagInput tags={peopleInvolved} setTags={v => { setPeopleInvolved(v); setApproved(false); }} placeholder="Type a name and press Enter…" inputId="people-involved-input" />
                <p style={hintStyle}>Press Enter or comma after each name</p>
              </div>
            </div>
          )}

          {/* Business fields */}
          {isBusiness && (
            <div style={sectionStyle}>
              <p style={sectionTitleStyle}>🏢 Business Details</p>
              <div>
                <label style={labelStyle}>Business Name: *</label>
                <input type="text" value={businessName} onChange={e => { setBusinessName(e.target.value); setApproved(false); }} required placeholder="e.g. Casa Comercial Morazán" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Type of Business:</label>
                  <input type="text" value={businessType} onChange={e => { setBusinessType(e.target.value); setApproved(false); }} placeholder="e.g. Import, Pharmacy, Hotel" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Year Founded / Mentioned:</label>
                  <input type="text" value={yearFounded} onChange={e => { setYearFounded(e.target.value); setApproved(false); }} placeholder="e.g. 1905" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Owner(s):</label>
                <input type="text" value={owner} onChange={e => { setOwner(e.target.value); setApproved(false); }} placeholder="e.g. Don Carlos Izaguirre" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Person fields */}
          {isPersonRecord && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Names: *</label>
                <TagInput tags={names} setTags={v => { setNames(v); setApproved(false); }} placeholder="Type a name and press Enter…" inputId="names-input" />
                <p style={hintStyle}>Press Enter or comma after each name</p>
              </div>
              <div>
                <label style={labelStyle}>Person's Origin:</label>
                <input type="text" value={countryOfOrigin} onChange={e => { setCountryOfOrigin(e.target.value); setApproved(false); }} placeholder="e.g. Italy" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Dates */}
          <div>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#737958', fontWeight: 'bold', textTransform: 'uppercase' }}>📅 Dates</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Date of Event:</label>
                <input type="text" value={eventDate} onChange={e => { setEventDate(e.target.value); setApproved(false); }} placeholder="e.g. 5 de Enero 1827" style={inputStyle} />
                <p style={hintStyle}>When it actually happened</p>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Date of Publication:</label>
                <input type="text" value={publicationDate} onChange={e => { setPublicationDate(e.target.value); setApproved(false); }} placeholder="e.g. 12 de Marzo 1930" style={inputStyle} />
                <p style={hintStyle}>When it appeared in the newspaper</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location / Place:</label>
            <input type="text" value={location} onChange={e => { setLocation(e.target.value); setApproved(false); }} placeholder="e.g. Tegucigalpa, Francisco Morazán" style={inputStyle} />
          </div>

          {/* Source */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Newspaper / Source:</label>
              <input type="text" value={newspaperName} onChange={e => { setNewspaperName(e.target.value); setApproved(false); }} placeholder="e.g. El Cronista" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Page:</label>
              <input type="text" value={pageNumber} onChange={e => { setPageNumber(e.target.value); setApproved(false); }} placeholder="e.g. 5" style={inputStyle} />
            </div>
          </div>

          {/* Summary / extracted text */}
          <div>
            <label style={labelStyle}>
              {scanDone ? 'Extracted Text — edit and correct errors:' : 'Description / Summary:'}
            </label>
            <textarea
              value={summary}
              onChange={e => { setSummary(e.target.value); setApproved(false); }}
              rows="8"
              placeholder={
                isHistoricEvent ? 'Describe what happened during this event...'
                : isBusiness ? 'Describe the business, its history, products or services...'
                : 'Summary of the record...'
              }
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
            />
            {scanDone && (
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#e65100', fontStyle: 'italic' }}>
                ⚠️ OCR text may have errors — please read carefully and fix names, dates, and words before approving.
              </p>
            )}
          </div>
        </div>

        {/* ── STEP 3: Approve ───────────────────────────────────────────────── */}
        <div style={{ backgroundColor: approved ? '#e8f5e9' : '#f5f5f5', border: `2px solid ${approved ? '#4caf50' : '#ccc'}`, borderRadius: '8px', padding: '16px' }}>
          <p style={stepTitleStyle}>
            {approved ? '✅ Step 3 — Record approved — ready to save' : '✅ Step 3 — Approve this record before saving'}
          </p>

          {!approved ? (
            <>
              <p style={{ fontSize: '0.88rem', color: '#555', margin: '0 0 12px' }}>
                Once you have reviewed and corrected all the fields above, click the button below to approve. <strong>Nothing goes into the database until you approve.</strong>
              </p>
              <button
                type="button"
                onClick={() => setApproved(true)}
                style={{ ...btnStyle, backgroundColor: '#2e7d32', fontSize: '1rem' }}
              >
                ✅ Approve Record
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.88rem', color: '#2e7d32', margin: '0 0 12px', fontWeight: 'bold' }}>
                Record approved! Click "Save to Archive" to store it in the database.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...btnStyle, backgroundColor: loading ? '#aaa' : '#737958', fontSize: '1rem', flex: 1 }}
                >
                  {loading ? '⏳ Saving...' : '💾 Save to Archive'}
                </button>
                <button
                  type="button"
                  onClick={() => setApproved(false)}
                  style={{ ...btnStyle, backgroundColor: '#888', fontSize: '0.9rem' }}
                >
                  ✏️ Go back and edit
                </button>
              </div>
            </>
          )}
        </div>

      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.9rem', color: '#444' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const hintStyle = { margin: '4px 0 0 0', fontSize: '0.75rem', color: '#999', fontStyle: 'italic' };
const sectionStyle = { backgroundColor: '#f0ede0', border: '1px solid #ACA37E', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' };
const sectionTitleStyle = { margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' };
const stepTitleStyle = { margin: '0 0 12px', fontWeight: 'bold', color: '#737958', fontSize: '1rem' };
const btnStyle = { padding: '11px 22px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' };

export default UploadPage;