import React from 'react';
import profilePhoto from '../assets/profile.jpg';
const About = () => {
  return (
    <div style={{
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#EFE7DD',
      minHeight: '100vh',
      fontFamily: 'Georgia, serif'
    }}>

      {/* Header */}
      <div style={{
        borderBottom: '3px solid #737958',
        paddingBottom: '20px',
        marginBottom: '40px'
      }}>
        <p style={{
          color: '#ACA37E',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          marginBottom: '10px'
        }}>
          Honduras Newspaper Archive
        </p>
        <h1 style={{
          color: '#737958',
          fontSize: '2.8rem',
          margin: '0 0 15px 0',
          lineHeight: 1.2
        }}>
          About the Honduras Archive
        </h1>
        <p style={{
          color: '#5a5a3a',
          fontSize: '1.25rem',
          fontStyle: 'italic',
          margin: 0,
          borderLeft: '4px solid #ACA37E',
          paddingLeft: '20px'
        }}>
          "Preserving the past to enlighten the future."
        </p>
      </div>

      {/* Mission */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #737958'
      }}>
        <h2 style={{ color: '#737958', marginTop: 0, fontSize: '1.4rem' }}>
          🎯 Our Mission
        </h2>
        <p style={{ color: '#444', lineHeight: 1.8, fontSize: '1.05rem', margin: 0 }}>
          This archive was created because valuable historical information and portraits are buried in old 
          Honduran newspapers and magazines. This tool helps genealogists build better family trees and 
          rebuild the history of Honduran citizens — making these records searchable, accessible, and 
          preserved for future generations.
        </p>
      </div>

      {/* About the Creator */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #ACA37E'
      }}>
        <h2 style={{ color: '#737958', marginTop: 0, fontSize: '1.4rem' }}>
          👤 About the Creator
          <img 
  src={profilePhoto} 
  alt="Creator portrait"
  style={{
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #737958',
    display: 'block',
    marginBottom: '20px'
  }}
/>
        </h2>
        <p style={{ color: '#444', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '20px' }}>
          I am a Software Engineer and passionate genealogical researcher with deep roots in Honduran history. 
          I built this archive to bridge the gap between technology and historical preservation.
        </p>

        {/* Credentials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {[
            { icon: '🎓', title: 'B.S. Software Development', sub: 'BYU-Idaho' },
            { icon: '🌳', title: 'FamilySearch Volunteer', sub: 'Since 2009' },
            { icon: '📋', title: 'Certified Record Management', sub: 'RMU Certification' },
            { icon: '🔍', title: 'Family History Research', sub: 'Certified Researcher' },
            { icon: '📜', title: 'Advanced Research Certificate', sub: 'In progress — completing August 2025' },
            { icon: '🏛️', title: 'Associate Degree', sub: 'Family History Research', 'In progress — completing August 2025'},
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: '#EFE7DD',
              borderRadius: '6px',
              padding: '15px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' }}>{item.title}</p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What you can find */}
      <div style={{
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '30px',
  marginBottom: '30px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  borderLeft: '5px solid #ACA37E'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
    <img 
      src={profilePhoto} 
      alt="Creator portrait"
      style={{
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid #737958',
        flexShrink: 0
      }}
    />
    <h2 style={{ color: '#737958', margin: 0, fontSize: '1.4rem' }}>
      👤 About the Creator
    </h2>
  </div>

  <p style={{ color: '#444', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '20px' }}>
    I am a Software Engineer and passionate genealogical researcher with deep roots in Honduran history. 
    I built this archive to bridge the gap between technology and historical preservation.
  </p>

  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
    {[
      { icon: '🎓', title: 'B.S. Software Development', sub: 'BYU-Idaho' },
      { icon: '🌳', title: 'FamilySearch Volunteer', sub: 'Since 2009' },
      { icon: '📋', title: 'Certified Record Management', sub: 'RMU Certification' },
      { icon: '🔍', title: 'Family History Research', sub: 'Certified Researcher' },
      { icon: '📜', title: 'Advanced Research Certificate', sub: 'In progress — completing August 2025' },
      { icon: '🏛️', title: 'Associate Degree', sub: 'Family History Research' },
    ].map((item, i) => (
      <div key={i} style={{
        backgroundColor: '#EFE7DD',
        borderRadius: '6px',
        padding: '15px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#737958', fontSize: '0.95rem' }}>{item.title}</p>
          <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>{item.sub}</p>
        </div>
      </div>
    ))}
  </div>
</div>
 {/* Footer note */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#888',
        fontSize: '0.9rem',
        borderTop: '1px solid #ACA37E'
      }}>
        <p style={{ margin: 0 }}>
          This is a non-commercial project dedicated to the preservation of Honduran historical records. <br />
          All newspaper images are used for historical and genealogical research purposes.
        </p>
      </div>

    </div>
  );
};

export default About;