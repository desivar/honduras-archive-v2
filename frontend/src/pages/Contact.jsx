import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const WHATSAPP_NUMBER = '+50498497898'; // Replace with your actual Honduras WhatsApp number

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      await axios.post('http://localhost:5000/api/contact', {
        ...formData,
        userId: user.userId
      });

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try WhatsApp instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello! I'm contacting you from Recuerdos de Honduras.\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage: ${formData.message}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div style={{
      backgroundColor: '#EFE7DD',
      minHeight: '100vh',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          color: '#737958',
          marginBottom: '10px',
          fontSize: '2.2rem'
        }}>
          Contact Us
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '40px',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Have questions about the archive? Want to contribute documents? Need help with your genealogy research?
          <br />We'd love to hear from you!
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Contact Form */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            border: '2px solid #737958'
          }}>
            <h2 style={{
              color: '#737958',
              marginTop: 0,
              marginBottom: '20px',
              fontSize: '1.4rem'
            }}>
              Send a Message
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: '#737958',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: '#737958',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: '#737958',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {success && (
                <div style={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div style={{
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#999' : '#737958',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '6px',
                  fontSize: '1.05rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Direct Contact Options */}
          <div>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              border: '2px solid #737958',
              marginBottom: '20px'
            }}>
              <h2 style={{
                color: '#737958',
                marginTop: 0,
                marginBottom: '20px',
                fontSize: '1.4rem'
              }}>
                Direct Contact
              </h2>

              <div style={{ marginBottom: '25px' }}>
                <h3 style={{
                  color: '#737958',
                  fontSize: '1rem',
                  marginBottom: '10px'
                }}>
                  💬 WhatsApp
                </h3>
                <p style={{
                  color: '#666',
                  marginBottom: '15px',
                  fontSize: '0.95rem'
                }}>
                  For quick responses, reach us on WhatsApp:
                </p>
                <button
                  onClick={handleWhatsApp}
                  style={{
                    width: '100%',
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>📱</span>
                  Message on WhatsApp
                </button>
              </div>

              <div>
                <h3 style={{
                  color: '#737958',
                  fontSize: '1rem',
                  marginBottom: '10px'
                }}>
                  📧 Email
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '0.95rem',
                  marginBottom: '8px'
                }}>
                  For detailed inquiries:
                </p>
                <a
                  href="mailto:yourname@email.com"
                  style={{
                    color: '#737958',
                    fontSize: '1.05rem',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                  }}
                >
                  yourname@email.com
                </a>
              </div>
            </div>

            {/* Support Section */}
            <div style={{
              backgroundColor: '#fff9e6',
              padding: '25px',
              borderRadius: '12px',
              border: '2px solid #f4c430'
            }}>
              <h3 style={{
                color: '#737958',
                marginTop: 0,
                marginBottom: '15px',
                fontSize: '1.2rem'
              }}>
                ❤️ Support the Archive
              </h3>
              <p style={{
                color: '#666',
                marginBottom: '15px',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Help preserve Honduran genealogy history! Your donations help us digitize more newspapers and vital records.
              </p>
              <a
                href="https://paypal.me/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: '#0070ba',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                💝 Donate via PayPal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
