import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Curated rotating quotes from Honduran / Central American historical figures
const HISTORICAL_QUOTES = [
  { quote: "La unión hace la fuerza, y la fuerza hace la libertad.", author: "Francisco Morazán", year: "1830" },
  { quote: "La patria no es un pedazo de tierra; es una abstracción, un espíritu, una idea.", author: "Ramón Rosa", year: "1876" },
  { quote: "No hay mayor gloria que morir por la libertad.", author: "Francisco Morazán", year: "1842" },
  { quote: "El pueblo que no conoce su historia está condenado a repetirla.", author: "José Cecilio del Valle", year: "1821" },
  { quote: "La educación es el arma más poderosa para cambiar el mundo.", author: "José Trinidad Reyes", year: "1845" },
  { quote: "Nuestra América debe ser gobernada por sus propios hijos.", author: "José Cecilio del Valle", year: "1822" },
];

// ── Helper: get today's date string as "DD de MonthName"
const getTodayLabel = () => {
  const now = new Date();
  const day = now.getDate();
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return { label: `${day} de ${months[now.getMonth()]}`, day, month: months[now.getMonth()] };
};

// ── Grain texture overlay via SVG data URI
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

const styles = {
  // Google Fonts loaded inline
  '@import': "url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap')",
};

export default function TodayInHistory() {
  const [archiveRecords, setArchiveRecords] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { label, day, month } = getTodayLabel();

  // Mount animation
  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  // Fetch archive records matching today's date string
  useEffect(() => {
    const fetchTodayRecords = async () => {
      try {
        const res = await axios.get('https://honduras-archive.onrender.com/api/archive', {
          params: { search: day.toString() }
        });
        // Filter records whose eventDate or publicationDate contains today's day + month
        const today = label.toLowerCase();
        const matches = (res.data.items || []).filter(r => {
          const ed = (r.eventDate || '').toLowerCase();
          const pd = (r.publicationDate || '').toLowerCase();
          return ed.includes(day.toString()) || pd.includes(day.toString());
        }).slice(0, 3);
        setArchiveRecords(matches);
      } catch (e) {
        // silently fail — the banner still shows quotes
      }
    };
    fetchTodayRecords();
  }, []);

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex(i => (i + 1) % HISTORICAL_QUOTES.length);
        setFadeQuote(true);
      }, 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const q = HISTORICAL_QUOTES[quoteIndex];

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { opacity: 0.5; }
          50%  { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .tih-quote-fade {
          transition: opacity 0.6s ease;
        }
        .tih-record-card:hover {
          background: rgba(115,121,88,0.13) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(80,60,20,0.15) !important;
        }
        .tih-record-card {
          transition: all 0.25s ease;
        }
      `}</style>

      <div style={{
        width: '100%',
        marginBottom: '32px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>

        {/* ── HERO BANNER ── */}
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #3b2a14 0%, #5c3d1e 40%, #7a5230 70%, #4a3010 100%)',
          boxShadow: '0 8px 40px rgba(40,20,5,0.35), inset 0 1px 0 rgba(255,220,140,0.15)',
          border: '1px solid rgba(172,130,60,0.4)',
        }}>

          {/* Grain texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '180px 180px',
            opacity: 0.6,
          }} />

          {/* Decorative corner ornaments */}
          <div style={{ position: 'absolute', top: 12, left: 14, color: 'rgba(210,175,90,0.5)', fontSize: '1.4rem', fontFamily: 'serif', lineHeight: 1, zIndex: 2 }}>❧</div>
          <div style={{ position: 'absolute', top: 12, right: 14, color: 'rgba(210,175,90,0.5)', fontSize: '1.4rem', fontFamily: 'serif', lineHeight: 1, zIndex: 2, transform: 'scaleX(-1)' }}>❧</div>
          <div style={{ position: 'absolute', bottom: 12, left: 14, color: 'rgba(210,175,90,0.5)', fontSize: '1.4rem', fontFamily: 'serif', lineHeight: 1, zIndex: 2, transform: 'scaleY(-1)' }}>❧</div>
          <div style={{ position: 'absolute', bottom: 12, right: 14, color: 'rgba(210,175,90,0.5)', fontSize: '1.4rem', fontFamily: 'serif', lineHeight: 1, zIndex: 2, transform: 'scale(-1)' }}>❧</div>

          {/* Inner content */}
          <div style={{ position: 'relative', zIndex: 3, padding: '32px 36px 28px' }}>

            {/* ── IMAGE SLOT ── */}
            <div style={{
              width: '100%',
              height: '180px',
              marginBottom: '24px',
              borderRadius: '6px',
              border: '2px dashed rgba(210,175,90,0.35)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'default',
            }}>
              <span style={{ fontSize: '2rem', opacity: 0.4 }}>🖼</span>
              <p style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.85rem',
                color: 'rgba(210,175,90,0.5)',
                letterSpacing: '0.08em',
                fontStyle: 'italic',
              }}>
                Your historical image goes here
              </p>
              <p style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: 'rgba(210,175,90,0.3)',
              }}>
                Replace this div with &lt;img src="..." /&gt;
              </p>
            </div>

            {/* ── DATE HEADER ── */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              animation: 'fadeInDown 0.8s ease both',
            }}>
              <p style={{
                margin: '0 0 4px',
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.7rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(210,175,90,0.7)',
              }}>
                ── Archivo de Honduras ──
              </p>
              <h2 style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 700,
                color: '#f0d898',
                letterSpacing: '0.02em',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                lineHeight: 1.1,
              }}>
                Hoy en la Historia
              </h2>
              <p style={{
                margin: '6px 0 0',
                fontFamily: "'IM Fell English', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'rgba(240,216,152,0.75)',
                letterSpacing: '0.04em',
              }}>
                {label}
              </p>

              {/* Decorative rule */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, rgba(210,175,90,0.6))' }} />
                <span style={{ color: 'rgba(210,175,90,0.7)', fontSize: '0.65rem' }}>✦</span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, rgba(210,175,90,0.6))' }} />
              </div>
            </div>

            {/* ── ROTATING QUOTE ── */}
            <div style={{
              textAlign: 'center',
              marginBottom: '28px',
              minHeight: '90px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeInUp 1s ease 0.2s both',
            }}>
              <p className="tih-quote-fade" style={{
                opacity: fadeQuote ? 1 : 0,
                margin: '0 0 10px',
                fontFamily: "'IM Fell English', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                color: 'rgba(255,240,200,0.9)',
                lineHeight: 1.65,
                maxWidth: '540px',
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}>
                "{q.quote}"
              </p>
              <p className="tih-quote-fade" style={{
                opacity: fadeQuote ? 1 : 0,
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(210,175,90,0.7)',
              }}>
                — {q.author}, {q.year}
              </p>

              {/* Quote dots indicator */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
                {HISTORICAL_QUOTES.map((_, i) => (
                  <div key={i} onClick={() => { setFadeQuote(false); setTimeout(() => { setQuoteIndex(i); setFadeQuote(true); }, 300); }}
                    style={{
                      width: i === quoteIndex ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: i === quoteIndex ? 'rgba(210,175,90,0.85)' : 'rgba(210,175,90,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── ARCHIVE RECORDS MATCHING TODAY ── */}
            {archiveRecords.length > 0 && (
              <div style={{ animation: 'fadeInUp 1s ease 0.5s both' }}>
                <p style={{
                  margin: '0 0 12px',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.72rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(210,175,90,0.6)',
                  textAlign: 'center',
                }}>
                  ✦ Registros del Archivo para este día ✦
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {archiveRecords.map(record => (
                    <a key={record._id} href={`/record/${record._id}`} style={{ textDecoration: 'none' }}>
                      <div className="tih-record-card" style={{
                        padding: '12px 16px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(210,175,90,0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}>
                        <div>
                          <p style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '0.95rem',
                            color: '#f0d898',
                            fontWeight: 600,
                          }}>
                            {record.names?.join(', ') || record.eventName || record.businessName || 'Registro'}
                          </p>
                          <p style={{
                            margin: '2px 0 0',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.8rem',
                            color: 'rgba(240,216,152,0.55)',
                            fontStyle: 'italic',
                          }}>
                            {record.category} · {record.eventDate || record.publicationDate}
                          </p>
                        </div>
                        <span style={{ color: 'rgba(210,175,90,0.5)', fontSize: '1rem' }}>›</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ── EMPTY STATE — no archive records today ── */}
            {archiveRecords.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '10px 0 4px',
                animation: 'fadeInUp 1s ease 0.5s both',
              }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '0.85rem',
                  color: 'rgba(210,175,90,0.4)',
                  letterSpacing: '0.05em',
                }}>
                  No hay registros en el archivo para el día de hoy — aún.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}