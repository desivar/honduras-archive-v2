import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await axios.get(`https://honduras-archive-v2.onrender.com/api/archive/${id}`);
        setRecord(response.data);
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  if (loading) return (
    <div style={{ backgroundColor: '#EFE7DD', minHeight: '100vh', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p style={{ fontSize: '1.2rem', color: '#737958' }}>Loading record...</p>
    </div>
  );

  if (!record) return (
    <div style={{ backgroundColor: '#EFE7DD', minHeight: '100vh', padding: '40px', textAlign: 'center' }}>
      <h2 style={{ color: '#737958' }}>Record not found</h2>
      <button onClick={() => navigate('/')} style={{ backgroundColor: '#737958', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', marginTop: '20px' }}>
        ← Back to Search
      </button>
    </div>
  );

  // ── Display name ──────────────────────────────────────────────────────────
  const displayName = record.businessName
    || record.eventName
    || (Array.isArray(record.names) && record.names.length > 0 ? record.names.join(', ') : null)
    || record.fullName
    || 'Unknown';

  const recordUrl = `${window.location.origin}/record/${id}`;

  // ── Share functions ───────────────────────────────────────────────────────
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: `Check out this record from Recuerdos de Honduras: ${displayName}`,
          url: recordUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`📜 *${displayName}* — Recuerdos de Honduras\n${recordUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recordUrl)}`, '_blank');
  };

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(record.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${displayName.replace(/\s+/g, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(record.imageUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(recordUrl);
    setCopySuccess('✓ Link copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const generateCitation = () => {
    const source = record.newspaperName || 'Archivo Nacional';
    const date = record.publicationDate || record.eventDate || 'n.d.';
    return `${displayName} (${date}). ${record.category}. ${record.location || 'Honduras'}: ${source}. Recuerdos de Honduras. ${recordUrl}`;
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(generateCitation());
    setCopySuccess('✓ Citation copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <div style={{ backgroundColor: '#EFE7DD', minHeight: '100vh', padding: '40px' }}>

     <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
  <button onClick={() => navigate(-1)} style={{
    backgroundColor: 'transparent', color: '#737958', border: '2px solid #737958',
    padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem'
  }}>
    ← Back
  </button>

  {/* Edit button — only shows if logged in as admin */}
  {localStorage.getItem('token') && (
    <button onClick={() => navigate(`/edit/${id}`)} style={{
      backgroundColor: '#737958', color: 'white', border: 'none',
      padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem'
    }}>
      ✏️ Edit Record
    </button>
  )}
</div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

        {/* ── Image Section ── */}
        <div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '2px solid #737958' }}>
            {record.imageUrl ? (
              <img src={record.imageUrl} alt={displayName}
                style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                <p style={{ fontSize: '2rem' }}>🖼️</p>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* 🟢 Share & Download buttons */}
          {record.imageUrl && (
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Download */}
              <button onClick={handleDownloadImage} style={{
                width: '100%', padding: '12px', backgroundColor: '#737958',
                color: 'white', border: 'none', borderRadius: '6px',
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem'
              }}>
                💾 Download Image
              </button>

              {/* Share menu */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowShareMenu(prev => !prev)} style={{
                  width: '100%', padding: '12px', backgroundColor: '#ACA37E',
                  color: 'white', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem'
                }}>
                  📤 Share Record
                </button>

                {showShareMenu && (
                  <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0,
                    backgroundColor: 'white', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    border: '1px solid #ddd', zIndex: 100, overflow: 'hidden'
                  }}>
                    {/* Native share (mobile) */}
                    {'share' in navigator && (
                      <button onClick={() => { handleNativeShare(); setShowShareMenu(false); }} style={shareItemStyle}>
                        📱 Share (Mobile)
                      </button>
                    )}
                    {/* WhatsApp */}
                    <button onClick={() => { handleShareWhatsApp(); setShowShareMenu(false); }} style={{ ...shareItemStyle, color: '#25D366' }}>
                      💬 Share on WhatsApp
                    </button>
                    {/* Facebook */}
                    <button onClick={() => { handleShareFacebook(); setShowShareMenu(false); }} style={{ ...shareItemStyle, color: '#1877F2' }}>
                      📘 Share on Facebook
                    </button>
                    {/* Copy link */}
                    <button onClick={() => { handleCopyLink(); setShowShareMenu(false); }} style={shareItemStyle}>
                      🔗 Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Metadata Section ── */}
        <div>
          <h1 style={{ color: '#737958', marginTop: 0, marginBottom: '20px', fontSize: '2rem' }}>
            {displayName}
          </h1>

          {/* Category badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ backgroundColor: '#737958', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {record.category}
            </span>
          </div>

          {/* Details */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>

            {/* Business fields */}
            {record.businessName && (
              <>
                {record.businessType && <DetailRow label="Type" value={record.businessType} />}
                {record.owner && <DetailRow label="Owner" value={record.owner} />}
                {record.yearFounded && <DetailRow label="Year" value={record.yearFounded} />}
              </>
            )}

            {/* Historic Event fields */}
            {record.peopleInvolved && record.peopleInvolved.length > 0 && (
              <DetailRow label="People Involved" value={record.peopleInvolved.join(', ')} />
            )}

            {/* Shared fields */}
            {record.eventDate && <DetailRow label="Event Date" value={record.eventDate} />}
            {record.publicationDate && <DetailRow label="Published" value={record.publicationDate} />}
            {record.location && <DetailRow label="Location" value={record.location} />}
            {record.countryOfOrigin && <DetailRow label="Origin" value={record.countryOfOrigin} />}
            {record.newspaperName && (
              <DetailRow label="Source" value={`${record.newspaperName}${record.pageNumber ? ` (Pg. ${record.pageNumber})` : ''}`} />
            )}
            {record.summary && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <strong style={{ color: '#737958' }}>Summary:</strong>
                <p style={{ margin: '8px 0 0 0', lineHeight: '1.6', color: '#444' }}>{record.summary}</p>
              </div>
            )}
          </div>

          {/* Citation */}
          <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ color: '#737958', marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>Citation</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', fontStyle: 'italic', marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #ddd' }}>
              {generateCitation()}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCopyCitation} style={{ flex: 1, backgroundColor: '#737958', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                📄 Copy Citation
              </button>
              <button onClick={handleCopyLink} style={{ flex: 1, backgroundColor: '#ACA37E', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                🔗 Copy Link
              </button>
            </div>
            {copySuccess && (
              <p style={{ marginTop: '10px', color: '#4CAF50', fontWeight: 'bold', textAlign: 'center' }}>
                {copySuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Small helper ──────────────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div style={{ marginBottom: '15px' }}>
    <strong style={{ color: '#737958' }}>{label}:</strong>
    <p style={{ margin: '5px 0 0 0', color: '#444' }}>{value}</p>
  </div>
);

const shareItemStyle = {
  display: 'block', width: '100%', padding: '12px 16px',
  backgroundColor: 'white', border: 'none', borderBottom: '1px solid #f0f0f0',
  cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', color: '#333',
  fontWeight: 'bold'
};

export default RecordDetail;