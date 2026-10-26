import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import shopImg from './assets/ganesh.jpeg'; // Keep your background image here

const API_BASE = 'https://ganesh-ikqb.onrender.com';

const ORG = {
  name: 'ProNexa Projects',
  phone: '+91 9014212176', // Update with your company phone
  email: 'support@pronzxa.com', // Update with your company email
};

// ============================================================
// ROYAL DESIGN TOKENS
// ============================================================
const FONT_DISPLAY = "'Cinzel', 'Trajan Pro', Georgia, serif";
const FONT_BODY = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";

const GOLD = '#d4af37';
const GOLD_LIGHT = '#f7ef8a';
const GOLD_DEEP = '#8a6d1f';
const ROYAL_GREEN = '#0b3d2e';
const ROYAL_GREEN_DARK = '#04140f';

const GOLD_GRADIENT =
  'linear-gradient(135deg, #8a6d1f 0%, #d4af37 22%, #f7ef8a 50%, #d4af37 78%, #8a6d1f 100%)';

const GOLD_TEXT_GRADIENT =
  'linear-gradient(180deg, #f9f3b8 0%, #e6c85c 35%, #c9a233 60%, #f7ef8a 100%)';

export default function UserList() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [orderRes, statRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/orders`),
        axios.get(`${API_BASE}/api/admin/stats`),
      ]);
      if (orderRes.data.success) setOrders(orderRes.data.orders || []);
      if (statRes.data.success) setStats(statRes.data.stats);
    } catch (err) {
      console.error('UserList fetch error:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to load data from server'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = orders
    .filter((o) => (filter === 'ALL' ? true : o.status === filter))
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.name?.toLowerCase().includes(q) ||
        o.phone?.includes(q) ||
        o.orderNo?.toLowerCase().includes(q) ||
        o.paymentId?.toLowerCase().includes(q) ||
        o.projectName?.toLowerCase().includes(q)
      );
    });

  const totalAmount = stats?.totalAmount ?? 0;

  const goHome = () => {
    window.location.href = '/';
  };

  const downloadCSV = () => {
    // Added Project Name and GitHub Link columns
    const header = 'OrderNo,Name,Phone,Project,Status,GitHub Link,PaymentId,CreatedAt\n';
    const rows = filtered
      .map(
        (o) =>
          `${o.orderNo},"${o.name}",${o.phone},"${o.projectName || 'N/A'}",${o.status},${o.githubLink || 'N/A'},${o.paymentId || ''},${new Date(o.createdAt).toISOString()}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pronzxa-sales-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={s.root}>
      <RoyalStyles />

      <div style={s.bgWrapper}>
        <img src={shopImg} alt="Shop" style={s.bgImage} />
        <div style={s.bgOverlay} />
      </div>

      <div className="royal-admin-content" style={s.content}>
        <div style={s.header}>
          <h1 className="royal-admin-title" style={s.title}>
            Sales Dashboard
          </h1>
          <p className="royal-admin-subtitle" style={s.subtitle}>
            {ORG.name} · Admin Panel
          </p>
        </div>

        <div className="royal-admin-topbar" style={s.topBar}>
          <button
            onClick={fetchData}
            className="royal-admin-btn"
            style={s.refreshBtn}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={downloadCSV}
            className="royal-admin-btn"
            style={s.csvBtn}
          >
            Download CSV
          </button>
          <button
            onClick={goHome}
            className="royal-admin-btn"
            style={s.homeBtn}
          >
            ← Back to Shop
          </button>
        </div>

        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {stats && (
          <div className="royal-admin-stats" style={s.statsGrid}>
            <StatCard label="Total Sales" value={stats.total} color={GOLD} />
            <StatCard label="Success" value={stats.success} color="#4ade80" />
            <StatCard label="Pending" value={stats.pending} color="#fbbf24" />
            <StatCard label="Failed" value={stats.failed} color="#f87171" />
            <StatCard
              label="Collected"
              value={`₹${totalAmount}`}
              color="#60a5fa"
            />
          </div>
        )}

        <div className="royal-admin-filter-bar" style={s.filterBar}>
          <div style={s.filterBtns}>
            {['ALL', 'SUCCESS', 'PENDING', 'FAILED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={filter === f ? s.filterActive : s.filterBtn}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search name / phone / project"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="royal-admin-search"
            style={s.searchInput}
          />
        </div>

        <div className="royal-admin-table-card" style={s.tableCard}>
          {loading && orders.length === 0 ? (
            <p style={s.empty}>Loading orders…</p>
          ) : filtered.length === 0 ? (
            <p style={s.empty}>No orders found</p>
          ) : (
            <div style={s.tableWrap}>
              <table className="royal-admin-table" style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Order No</th>
                    <th style={s.th}>Customer</th>
                    <th style={s.th}>Project Bought</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>GitHub Link</th>
                    <th style={s.th}>Payment ID</th>
                    <th style={s.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => (
                    <tr key={o._id} style={s.tr}>
                      <td style={s.td}>{i + 1}</td>
                      <td style={{ ...s.td, ...s.mono }}>{o.orderNo}</td>
                      <td style={s.td}>
                        <div>{o.name}</div>
                        <div style={{ ...s.mono, fontSize: '11px' }}>{o.phone}</div>
                      </td>
                      <td style={s.td}>
                        <span style={s.projectTag}>{o.projectName || 'N/A'}</span>
                      </td>
                      <td
                        style={{
                          ...s.td,
                          fontWeight: 'bold',
                          color:
                            o.status === 'SUCCESS'
                              ? '#4ade80'
                              : o.status === 'PENDING'
                              ? '#fbbf24'
                              : '#f87171',
                        }}
                      >
                        {o.status}
                      </td>
                      <td style={s.td}>
                        {o.githubLink ? (
                          <a
                            href={o.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={s.githubLink}
                          >
                            Open Repo ↗
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ ...s.td, ...s.mono }}>
                        {o.paymentId || '—'}
                      </td>
                      <td style={s.td}>
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="royal-admin-footer" style={s.footerNote}>
          Showing {filtered.length} of {orders.length} orders · 📞{' '}
          {ORG.phone} · ✉️ {ORG.email}
        </p>

        <div style={s.bottomSpace} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="royal-admin-stat-card" style={s.statCard}>
      <span style={s.statLabel}>{label}</span>
      <span className="royal-admin-stat-value" style={{ ...s.statValue, color }}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// GLOBAL ROYAL CSS + RESPONSIVE
// ============================================================
function RoyalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; overflow-x: hidden; }

      /* ---- Inputs ---- */
      .royal-admin-search::placeholder {
        color: rgba(212, 175, 55, 0.42);
        font-family: 'Cormorant Garamond', Georgia, serif;
        letter-spacing: 0.5px;
      }
      .royal-admin-search:focus {
        border-color: rgba(212, 175, 55, 0.95) !important;
        background: rgba(255, 255, 255, 0.09) !important;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.16), 0 0 22px rgba(212, 175, 55, 0.18);
      }

      /* ---- Buttons ---- */
      .royal-admin-btn {
        transition: transform .16s ease, box-shadow .3s ease, filter .3s ease;
      }
      .royal-admin-btn:hover {
        transform: translateY(-2px);
        filter: brightness(1.07) saturate(1.08);
      }
      .royal-admin-btn:active {
        transform: translateY(1px);
      }

      /* ==================================================
         RESPONSIVE
      ================================================== */
      @media (max-width: 640px) {
        .royal-admin-content { padding: 20px 12px 0 !important; }
        .royal-admin-title {
          font-size: 22px !important;
          letter-spacing: 1.6px !important;
        }
        .royal-admin-subtitle {
          font-size: 12px !important;
          letter-spacing: 1.4px !important;
        }
        .royal-admin-topbar { gap: 8px !important; }
        .royal-admin-btn {
          padding: 9px 14px !important;
          font-size: 10px !important;
          letter-spacing: 1.2px !important;
        }
        .royal-admin-stats {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
        .royal-admin-stat-card { padding: 10px 12px !important; }
        .royal-admin-stat-value { font-size: 18px !important; }
        .royal-admin-filter-bar {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        .royal-admin-search {
          min-width: 100% !important;
          font-size: 15px !important;
        }
        .royal-admin-table-card { padding: 6px !important; }
        .royal-admin-footer { font-size: 12px !important; }
      }

      @media (max-width: 400px) {
        .royal-admin-title { font-size: 18px !important; }
        .royal-admin-subtitle { font-size: 11px !important; }
        .royal-admin-stats { grid-template-columns: 1fr !important; }
        .royal-admin-btn {
          font-size: 9px !important;
          padding: 8px 12px !important;
        }
      }

      @media (min-width: 1024px) {
        .royal-admin-content { max-width: 1200px !important; }
      }
    `}</style>
  );
}

// ============================================================
// STYLES — ROYAL EDITION
// ============================================================
const s = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    fontFamily: FONT_BODY,
    backgroundColor: ROYAL_GREEN_DARK,
    backgroundImage:
      'radial-gradient(circle at 50% 0%, #0e3b2c 0%, #06231a 42%, #010a07 100%)',
    overflowX: 'hidden',
  },
  bgWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 0,
  },
  bgImage: {
    width: '100%',
    height: 'auto',
    display: 'block',
    opacity: 0.9,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(180deg, rgba(1,10,7,0.15) 0%, rgba(1,10,7,0.30) 22%, rgba(4,35,26,0.80) 48%, rgba(1,10,7,0.95) 72%, #010a07 100%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    backgroundImage: GOLD_TEXT_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: GOLD,
    filter:
      'drop-shadow(0 3px 10px rgba(0,0,0,0.95)) drop-shadow(0 0 22px rgba(212,175,55,0.35))',
  },
  subtitle: {
    margin: '8px 0 0',
    fontFamily: FONT_BODY,
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '2.2px',
    textTransform: 'uppercase',
    color: '#d9c98d',
    textShadow: '0 2px 12px rgba(0,0,0,0.95)',
  },

  topBar: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  refreshBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.55)',
    background: GOLD_GRADIENT,
    color: '#08281c',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    fontSize: '12px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    boxShadow:
      '0 12px 34px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.55)',
  },
  csvBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.55)',
    background: 'rgba(11,61,46,0.85)',
    color: GOLD_LIGHT,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    fontSize: '12px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  homeBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.55)',
    background: 'transparent',
    color: GOLD,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    fontSize: '12px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  errorBox: {
    background: 'rgba(127,29,29,0.85)',
    color: '#fecaca',
    border: '1px solid #dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    textAlign: 'center',
    fontFamily: FONT_BODY,
    fontSize: '15px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '10px',
    marginBottom: '18px',
  },
  statCard: {
    background:
      'linear-gradient(160deg, rgba(12,66,48,0.96) 0%, rgba(5,32,23,0.98) 52%, rgba(2,16,11,0.99) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(212,175,55,0.55)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow:
      '0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(212,175,55,0.35)',
  },
  statLabel: {
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    color: '#c9b26a',
    textTransform: 'uppercase',
    letterSpacing: '1.8px',
    marginBottom: '4px',
  },
  statValue: {
    fontFamily: FONT_DISPLAY,
    fontSize: '22px',
    fontWeight: 'bold',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '14px',
  },
  filterBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: '1px solid rgba(212,175,55,0.4)',
    background: 'rgba(0,0,0,0.5)',
    color: '#c9b26a',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  },
  filterActive: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: '1px solid #FFD700',
    background: GOLD_GRADIENT,
    color: '#08281c',
    cursor: 'pointer',
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    boxShadow: '0 4px 14px rgba(230,81,0,0.5)',
  },
  searchInput: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.38)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f3e7c4',
    fontFamily: FONT_BODY,
    fontSize: '16px',
    minWidth: '260px',
    outline: 'none',
  },
  tableCard: {
    background:
      'linear-gradient(160deg, rgba(12,66,48,0.96) 0%, rgba(5,32,23,0.98) 52%, rgba(2,16,11,0.99) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(212,175,55,0.55)',
    borderRadius: '16px',
    padding: '8px',
    boxShadow:
      '0 30px 80px rgba(0,0,0,0.75), 0 0 46px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.35)',
  },
  tableWrap: { overflowX: 'auto', borderRadius: '12px' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    minWidth: '1050px', // Increased to fit new columns
  },
  th: {
    textAlign: 'left',
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.55)',
    color: GOLD,
    textTransform: 'uppercase',
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    letterSpacing: '1.2px',
    borderBottom: '1px solid rgba(212,175,55,0.35)',
    position: 'sticky',
    top: 0,
  },
  tr: { borderBottom: '1px solid rgba(212,175,55,0.15)' },
  td: {
    padding: '11px 14px',
    color: '#f3e7c4',
    verticalAlign: 'middle',
    fontFamily: FONT_BODY,
    fontSize: '15px',
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '12px',
    color: '#c9b26a',
  },
  projectTag: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    background: 'rgba(212,175,55,0.15)',
    border: '1px solid rgba(212,175,55,0.4)',
    color: GOLD_LIGHT,
    fontSize: '12px',
    fontWeight: 'bold',
  },
  githubLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#c9b26a',
    margin: 0,
    fontFamily: FONT_BODY,
    fontSize: '16px',
  },
  footerNote: {
    marginTop: '16px',
    fontFamily: FONT_BODY,
    fontSize: '14px',
    color: '#9fbeac',
    textAlign: 'center',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },
  bottomSpace: { height: '80px' },
};