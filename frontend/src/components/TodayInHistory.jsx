import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ── Curated rotating quotes from Honduran / Central American
const HISTORICAL_QUOTES = [
  { quote: "No puedes cambiar lo que otros te hacen a ti, pero puedes ensenar a tus hijos a vivir la ley de oro que incluye el perdon, el respeto y el amor.", author: "Desire Vargas", year: "2026" },
  { quote: "La patria no es un pedazo de tierra; es una abstracción, un espíritu, una idea.", author: "Ramón Rosa", year: "1876" },
  { quote: "Las sociedades viven, crecen y se perfeccionan bajo la influencia de las ideas.", author: "Ramón Rosa", year: "1876" },
  { quote: "El pueblo que no conoce su historia está condenado a repetirla.", author: "José Cecilio del Valle", year: "1821" },
  { quote: "La educación es el arma más poderosa para cambiar el mundo.", author: "José Trinidad Reyes", year: "1845" },
  { quote: "Haz de tu hogar un centro de instruccion, un centro de paz, un refugio de perdon, un refugio de amor.", author: "Desire Vargas", year: "2026" },
];

// ── Get today's date label
const getTodayLabel = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${day} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
};

// ── Seeded random — same record all day, changes at midnight
const getDailyIndex = (total) => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % total;
};

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function TodayInHistory() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mount animation
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  // Fetch all records and pick daily one
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await axios.get('https://honduras-archive-v2.onrender.com/api/archive');
        const items = res.data.items || [];
        if (items.length === 0) { setLoading(false); return; }
        const index = getDailyIndex(items.length);
        setRecord(items[index]);
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
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

  // Display name for the record
  const displayName = record
    ? (record.names?.join(', ') || record.eventName || record.businessName || 'Registro Histórico')
    : '';

  return (
    <>
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
        .tih-quote-fade { transition: opacity 0.6s ease; }
        .tih-record-card:hover {
          background: rgba(115,121,88,0.18) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(80,60,20,0.2) !important;
        }
        .tih-record-card { transition: all 0.25s ease; }
        .tih-dot:hover { opacity: 0.9; }
      `}</style>

      <div style={{
        width: '100%',
        marginBottom: '32px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #5b2d16 0%, #a56844 40%, #956b2f 70%, #7a3d13 100%)',
          boxShadow: '0 8px 40px rgba(40,20,5,0.35), inset 0 1px 0 rgba(255,220,140,0.15)',
          border: '1px solid rgba(180,130,140,0.4)',
        }}>
          {/* Grain texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            backgroundImage: GRAIN_SVG, backgroundSize: '180px 180px', opacity: 0.6,
          }} />

          {/* Corner ornaments */}
          {['top:12px;left:14px','top:12px;right:14px;transform:scaleX(-1)',
            'bottom:12px;left:14px;transform:scaleY(-1)','bottom:12px;right:14px;transform:scale(-1)'].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', color: 'rgba(199, 145, 19, 0.75)', fontSize: '1.4rem',
              fontFamily: 'serif', lineHeight: 1, zIndex: 2,
              ...Object.fromEntries(s.split(';').map(p => { const [k,v]=p.split(':'); return [k.trim(), v?.trim()]; }).filter(([k])=>k))
            }}>❧</div>
          ))}

          <div style={{ position: 'relative', zIndex: 3, padding: '32px 36px 28px' }}>

            {/* ── Header image ── */}
            <div style={{ width: '100%', marginBottom: '24px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(210,175,90,0.35)' }}>
              <img src="/hond-memoirs.png" alt="Archivo Histórico de Honduras"
                style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block', opacity: 0.92 }} />
            </div>

            {/* ── Date header ── */}
            <div style={{ textAlign: 'center', marginBottom: '20px', animation: 'fadeInDown 0.8s ease both' }}>
              <p style={{ margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.7rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(210,175,90,0.7)' }}>
                ── Archivo de Honduras ──
              </p>
              <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: '#f0d898', textShadow: '0 2px 12px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
                Registro del Día
              </h2>
              <p style={{ margin: '6px 0 0', fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(240,216,152,0.75)', letterSpacing: '0.04em' }}>
                {getTodayLabel()}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to right, transparent, rgba(182, 171, 143, 0.81))' }} />
                <span style={{ color: 'rgba(210,175,90,0.7)', fontSize: '0.65rem' }}>✦</span>
                <div style={{ height: '1px', width: '60px', background: 'linear-gradient(to left, transparent, rgba(210,175,90,0.6))' }} />
              </div>
            </div>

            {/* ── Rotating quote ── */}
            <div style={{ textAlign: 'center', marginBottom: '28px', minHeight: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 1s ease 0.2s both' }}>
              <p className="tih-quote-fade" style={{ opacity: fadeQuote ? 1 : 0, margin: '0 0 10px', fontFamily: "'IM Fell English', serif", fontStyle: 'italic', fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)', color: 'rgba(255,240,200,0.9)', lineHeight: 1.65, maxWidth: '540px', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
                "{q.quote}"
              </p>
              <p className="tih-quote-fade" style={{ opacity: fadeQuote ? 1 : 0, margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(210,175,90,0.7)' }}>
                — {q.author}, {q.year}
              </p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
                {HISTORICAL_QUOTES.map((_, i) => (
                  <div key={i} className="tih-dot" onClick={() => { setFadeQuote(false); setTimeout(() => { setQuoteIndex(i); setFadeQuote(true); }, 300); }}
                    style={{ width: i === quoteIndex ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === quoteIndex ? 'rgba(210,175,90,0.85)' : 'rgba(210,175,90,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                ))}
              </div>
            </div>

            {/* ── Daily record ── */}
            <div style={{ animation: 'fadeInUp 1s ease 0.5s both' }}>
              <p style={{ margin: '0 0 12px', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(210,175,90,0.6)', textAlign: 'center' }}>
                ✦ Registro Destacado de Hoy ✦
              </p>

              {loading && (
                <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(210,175,90,0.4)' }}>
                  Cargando registro...
                </p>
              )}

              {!loading && !record && (
                <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: 'rgba(210,175,90,0.4)' }}>
                  No hay registros en el archivo aún.
                </p>
              )}

              {!loading && record && (
                <a href={`/record/${record._id}`} style={{ textDecoration: 'none' }}>
                  <div className="tih-record-card" style={{
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(210,175,90,0.25)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}>
                 {/* Record image */}
                 {record.imageUrl && (
                 <div style={{ width: '100%', 
                 background: 'rgba(0,0,0,0.2)', 
                 borderBottom: '1px solid rgba(210,175,90,0.2)',
                 display: 'flex',
                 justifyContent: 'center' }}>
                <img src={record.imageUrl} alt={displayName}
                 style={{ width: '100%', 
                 height: 'auto', maxHeight: '160px', 
                 objectFit: 'contain',
                 opacity: 0.85, display: 'block' }} />
                 </div>
                
                 )}

                 {/* Record info */}
                 <div style={{ padding: '8px 12px' }}></div>

                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          {/* Category badge */}
                          <span style={{
                            display: 'inline-block', marginBottom: '8px',
                            padding: '2px 10px', borderRadius: '999px',
                            background: 'rgba(210,175,90,0.15)',
                            border: '1px solid rgba(210,175,90,0.3)',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.7rem', letterSpacing: '0.15em',
                            textTransform: 'uppercase', color: 'rgba(210,175,90,0.8)',
                          }}>
                            {record.category}
                          </span>

                          {/* Name */}
                          <p style={{ margin: '0 0 6px', fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0d898', lineHeight: 1.3 }}>
                            {displayName}
                          </p>

                          {/* Date & location */}
                          <p style={{ margin: '0 0 8px', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.82rem', color: 'rgba(240,216,152,0.55)' }}>
                            {[record.eventDate || record.publicationDate, record.location, record.newspaperName].filter(Boolean).join(' · ')}
                          </p>

                          {/* Summary */}
                          {record.summary && (
                            <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', color: 'rgba(255,240,200,0.65)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {record.summary}
                            </p>
                          )}
                        </div>
                        <span style={{ color: 'rgba(210,175,90,0.5)', fontSize: '1.2rem', marginLeft: '12px', marginTop: '4px' }}>›</span>
                      </div>

                      {/* View link */}
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(210,175,90,0.15)', textAlign: 'right' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(210,175,90,0.6)' }}>
                          Ver registro completo ›
                        </span>
                      </div>
                    </div>
                
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}