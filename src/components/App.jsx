import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ganeshImg from '../assets/ganesh.jpeg'; // Background Image
import ladduImg from '../assets/laddu.png';     // Product Image

const API_BASE = 'https://ganesh-ikqb.onrender.com';

const ORG = {
  name: 'Gaddiannaram Utsav Samithi ',
  entityType: 'Food Retail / Sweets Shop',
  address: 'Gaddiannaram, Dilsukhnagar, Hyderabad, Telangana 500060, India',
  email: 'tigullagirish@gmail.com',
  phone: '+91 9014212176',
  productName: 'Special Motichoor Laddu',
  productPrice: 21,
  productDesc: 'Made with pure desi ghee and premium quality gram flour. Freshly prepared daily and packed hygienically. Perfect for all occasions.',
  venue: 'Sri Krishna Sweets Pickup Counter, Gaddiannaram, Dilsukhnagar, Hyderabad, Telangana 500060',
  counterTimings: '8:00 AM – 9:00 PM (All Days)',
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

export default function App() {
  const [page, setPage] = useState('shop');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/`).catch(() => {});
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay SDK. Check your internet and try again.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE}/api/order/create`, {
        name,
        phone,
      });

      if (!data.success) throw new Error(data.error || 'Order creation failed');

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: ORG.name,
        description: `${ORG.productName} – Food Product Purchase`,
        order_id: data.order_id,
        prefill: { name, contact: phone },
        theme: { color: '#0b3d2e' },
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/api/order/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderNo: data.orderNo,
            });

            if (verifyRes.data.success) {
              setIsPaid(true);
              setWhatsappUrl(verifyRes.data.whatsappUrl);
              setConfirmedOrder(verifyRes.data.orderDetails);
            } else {
              alert('Payment verification failed: ' + (verifyRes.data.message || 'unknown'));
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification error. Please contact support with Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            alert('Payment window closed. You can try again when ready.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('PAYMENT ERROR:', err);
      alert('Payment error: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const goTo = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div style={styles.root}>
      <RoyalStyles />

      {/* Background Image Wrapper */}
      <div style={styles.bgImageWrapper}>
        <img src={ganeshImg} alt="Background" style={styles.bgImage} />
        <div style={styles.bgOverlay} />
      </div>

      <div className="royal-content" style={styles.content}>
        {page === 'shop' ? (
          <ShopPage
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            loading={loading}
            isPaid={isPaid}
            whatsappUrl={whatsappUrl}
            confirmedOrder={confirmedOrder}
            handleSubmit={handleSubmit}
            goTo={goTo}
          />
        ) : (
          <PolicyPage page={page} goTo={goTo} />
        )}

        <div className="royal-bottom-black-section" style={styles.bottomBlackSection} />
      </div>
    </div>
  );
}

// ============================================================
// GLOBAL ROYAL CSS (fonts, focus states, shimmer, RESPONSIVE)
// ============================================================
function RoyalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      html, body { margin: 0; padding: 0; overflow-x: hidden; }

      /* ---- Inputs ---- */
      .royal-input::placeholder {
        color: rgba(212, 175, 55, 0.42);
        font-family: 'Cormorant Garamond', Georgia, serif;
        letter-spacing: 0.5px;
      }
      .royal-input:focus {
        border-color: rgba(212, 175, 55, 0.95) !important;
        background: rgba(255, 255, 255, 0.09) !important;
        box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.16), 0 0 22px rgba(212, 175, 55, 0.18);
      }

      /* ---- Gold Button ---- */
      .royal-btn {
        background-size: 200% auto;
        transition: transform .16s ease, box-shadow .3s ease, filter .3s ease;
        animation: royalShine 6s ease-in-out infinite alternate;
      }
      .royal-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 14px 38px rgba(212, 175, 55, 0.42), inset 0 1px 0 rgba(255,255,255,0.7) !important;
        filter: brightness(1.07) saturate(1.08);
      }
      .royal-btn:active:not(:disabled) {
        transform: translateY(1px);
        box-shadow: 0 6px 18px rgba(212, 175, 55, 0.35) !important;
      }
      .royal-btn:disabled { opacity: .62; cursor: not-allowed; filter: grayscale(.15); }

      @keyframes royalShine {
        0%   { background-position:   0% 50%; }
        100% { background-position: 100% 50%; }
      }

      /* ---- Links ---- */
      .royal-link { transition: color .2s ease, text-shadow .2s ease; }
      .royal-link:hover {
        color: #f9f3b8 !important;
        text-shadow: 0 0 14px rgba(212, 175, 55, 0.75);
      }

      /* ---- WhatsApp button ---- */
      .royal-wa { transition: transform .16s ease, box-shadow .3s ease, filter .3s ease; }
      .royal-wa:hover {
        transform: translateY(-2px);
        filter: brightness(1.06);
        box-shadow: 0 14px 36px rgba(37, 211, 102, 0.55) !important;
      }

      /* ---- Card entrance ---- */
      @keyframes royalRise {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .royal-card { animation: royalRise .6s cubic-bezier(.22,.9,.3,1) both; }

      /* ---- Text overflow safety ---- */
      .royal-event-name,
      .royal-product-title,
      .royal-success-title,
      .royal-policy-h1,
      .royal-policy-h2 {
        word-break: break-word;
        overflow-wrap: anywhere;
      }

      /* ==================================================
         RESPONSIVE — TABLET / LARGE PHONE (≤ 640px)
      ================================================== */
      @media (max-width: 640px) {
        .royal-content { padding-top: 10vh !important; }

        .royal-shop-container { padding: 0 14px !important; max-width: 100% !important; }
        .royal-header-section { margin-bottom: 18px !important; }

        .royal-event-name {
          font-size: 22px !important;
          margin-top: 26px !important;
          letter-spacing: 1.6px !important;
          line-height: 1.3 !important;
        }
        .royal-event-location {
          font-size: 12px !important;
          letter-spacing: 1.4px !important;
        }

        .royal-glass-card {
          padding: 24px 20px !important;
          border-radius: 16px !important;
          max-width: 100% !important;
          margin-bottom: 18px !important;
        }
        .royal-card-crest { font-size: 17px !important; margin-bottom: 8px !important; }
        .royal-form-title {
          font-size: 12.5px !important;
          letter-spacing: 1.5px !important;
          margin-bottom: 18px !important;
        }
        .royal-label {
          font-size: 9.5px !important;
          letter-spacing: 1.5px !important;
        }
        .royal-input {
          font-size: 16px !important;
          padding: 13px 14px !important;
        }
        .royal-pay-btn {
          font-size: 12px !important;
          padding: 15px 12px !important;
          letter-spacing: 1.4px !important;
        }
        .royal-note { font-size: 12px !important; margin-top: 14px !important; }

        .royal-product-card {
          padding: 18px !important;
          max-width: 100% !important;
          margin-bottom: 18px !important;
        }
        .royal-product-image-frame { padding: 5px !important; margin-bottom: 15px !important; }
        .royal-product-image { max-height: 180px !important; }
        .royal-product-title {
          font-size: 17px !important;
          letter-spacing: 1.1px !important;
        }
        .royal-product-desc { font-size: 15px !important; }
        .royal-product-price { font-size: 24px !important; }
        .royal-product-meta {
          font-size: 9px !important;
          letter-spacing: 1.1px !important;
          gap: 7px !important;
        }

        .royal-success-title {
          font-size: 14.5px !important;
          letter-spacing: 1.3px !important;
        }
        .royal-success-icon { font-size: 26px !important; }
        .royal-detail-card { padding: 12px 14px !important; margin-bottom: 18px !important; }
        .royal-detail-row { font-size: 15px !important; padding: 9px 0 !important; }
        .royal-detail-key { font-size: 9.5px !important; letter-spacing: 1.2px !important; }
        .royal-detail-val-highlight { font-size: 13px !important; letter-spacing: 1px !important; }

        .royal-whatsapp-btn {
          font-size: 11.5px !important;
          padding: 15px 12px !important;
          letter-spacing: 1.5px !important;
        }
        .royal-blessing { font-size: 14px !important; margin-top: 18px !important; }

        .royal-footer { padding: 20px 12px !important; }
        .royal-footer-text { font-size: 10px !important; letter-spacing: 1.4px !important; }
        .royal-footer-links {
          font-size: 13px !important;
          line-height: 2 !important;
        }
        .royal-footer-sep { margin: 0 5px !important; }
        .royal-footer-sub { font-size: 9px !important; letter-spacing: 3px !important; }

        .royal-policy-container {
          margin: 20px 12px !important;
          padding: 22px 18px 28px !important;
          font-size: 16px !important;
          border-radius: 14px !important;
        }
        .royal-back-link { font-size: 10px !important; letter-spacing: 1.5px !important; margin-bottom: 16px !important; }
        .royal-policy-nav {
          font-size: 9.5px !important;
          letter-spacing: 1px !important;
          line-height: 2.2 !important;
          margin-bottom: 20px !important;
          padding-bottom: 14px !important;
        }
        .royal-policy-h1 {
          font-size: 19px !important;
          letter-spacing: 1.2px !important;
        }
        .royal-policy-h2 {
          font-size: 13.5px !important;
          letter-spacing: 1.1px !important;
        }
        .royal-policy-card { padding: 14px 16px !important; }
        .royal-policy-footer {
          font-size: 9.5px !important;
          letter-spacing: 1.2px !important;
        }

        .royal-bottom-black-section { height: 90px !important; margin-top: 10px !important; }
      }

      /* ==================================================
         RESPONSIVE — SMALL PHONE (≤ 400px)
      ================================================== */
      @media (max-width: 400px) {
        .royal-content { padding-top: 8vh !important; }
        .royal-event-name {
          font-size: 19px !important;
          letter-spacing: 1.3px !important;
          margin-top: 20px !important;
        }
        .royal-event-location { font-size: 11px !important; letter-spacing: 1.1px !important; }
        .royal-glass-card { padding: 22px 16px !important; border-radius: 14px !important; }
        .royal-product-card { padding: 16px !important; }
        .royal-product-title { font-size: 15px !important; }
        .royal-product-price { font-size: 21px !important; }
        .royal-product-desc { font-size: 14.5px !important; }
        .royal-pay-btn {
          font-size: 11px !important;
          letter-spacing: 1.1px !important;
          padding: 14px 10px !important;
        }
        .royal-policy-h1 { font-size: 17px !important; letter-spacing: 1px !important; }
        .royal-policy-h2 { font-size: 12.5px !important; letter-spacing: 1px !important; }
        .royal-policy-container {
          margin: 16px 10px !important;
          padding: 20px 14px 24px !important;
        }
        .royal-whatsapp-btn {
          font-size: 10.5px !important;
          letter-spacing: 1.2px !important;
          padding: 14px 10px !important;
        }
        .royal-detail-val-highlight { font-size: 12px !important; }
        .royal-footer-links { font-size: 12px !important; }
      }

      /* ==================================================
         RESPONSIVE — VERY SMALL PHONE (≤ 340px)
      ================================================== */
      @media (max-width: 340px) {
        .royal-event-name { font-size: 17px !important; letter-spacing: 1px !important; }
        .royal-product-title { font-size: 14px !important; }
        .royal-product-price { font-size: 19px !important; }
        .royal-form-title { font-size: 11.5px !important; }
        .royal-input { font-size: 15px !important; }
        .royal-pay-btn { font-size: 10px !important; }
        .royal-policy-h1 { font-size: 15px !important; }
      }

      /* ==================================================
         RESPONSIVE — LANDSCAPE / SHORT HEIGHT
      ================================================== */
      @media (max-height: 520px) and (orientation: landscape) {
        .royal-content { padding-top: 4vh !important; }
        .royal-event-name { margin-top: 10px !important; }
      }

      /* ==================================================
         RESPONSIVE — LARGE SCREEN (≥ 1024px)
      ================================================== */
      @media (min-width: 1024px) {
        .royal-content { padding-top: 16vh !important; }
        .royal-event-name { font-size: 34px !important; letter-spacing: 3px !important; }
        .royal-event-location { font-size: 17px !important; letter-spacing: 2.6px !important; }
        .royal-shop-container { max-width: 540px !important; }
        .royal-glass-card, .royal-product-card { max-width: 500px !important; }
        .royal-policy-container { max-width: 860px !important; }
      }

      /* ==================================================
         RESPONSIVE — EXTRA LARGE SCREEN (≥ 1440px)
      ================================================== */
      @media (min-width: 1440px) {
        .royal-content { padding-top: 18vh !important; }
        .royal-event-name { font-size: 38px !important; }
      }
    `}</style>
  );
}

// ============================================================
// SHOP PAGE
// ============================================================
function ShopPage({
  name,
  setName,
  phone,
  setPhone,
  loading,
  isPaid,
  whatsappUrl,
  confirmedOrder,
  handleSubmit,
  goTo,
}) {
  return (
    <div className="royal-shop-container" style={styles.shopContainer}>
      <div className="royal-header-section" style={styles.headerSection}>
        <h1 className="royal-event-name" style={styles.eventName}> {ORG.name} </h1>

        <div style={styles.ornament}>
          <span style={styles.ornamentLine} />
          <span style={styles.ornamentGem}>◆</span>
          <span style={styles.ornamentLine} />
        </div>

        <p className="royal-event-location" style={styles.eventLocation}>
          Gaddiannaram · Dilsukhnagar · Hyderabad
        </p>
      </div>

      {!isPaid ? (
        <>
          {/* CHECKOUT FORM SECTION — ON TOP */}
          <div className="royal-card royal-glass-card" style={styles.glassCard}>
            <div className="royal-card-crest" style={styles.cardCrest}>♛</div>
            <h3 className="royal-form-title" style={styles.formTitle}>
              Enter Details to Place Order
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label className="royal-label" style={styles.label}>Full Name</label>
                <input
                  className="royal-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label className="royal-label" style={styles.label}>Phone Number</label>
                <input
                  className="royal-input"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  style={styles.input}
                />
              </div>

              <button type="submit" disabled={loading} className="royal-btn royal-pay-btn" style={styles.payBtn}>
                {loading
                  ? 'PROCESSING…'
                  : `PAY ₹${ORG.productPrice}  ·  PLACE ORDER`}
              </button>

              <p className="royal-note" style={styles.note}>🔒 Secure payment via Razorpay</p>
            </form>
          </div>

          {/* PRODUCT DISPLAY SECTION — BELOW */}
          <div className="royal-card royal-product-card" style={styles.productCard}>
            <div className="royal-product-image-frame" style={styles.productImageFrame}>
              <img
                src={ladduImg}
                alt={ORG.productName}
                className="royal-product-image"
                style={styles.productImage}
              />
            </div>

            <h2 className="royal-product-title" style={styles.productTitle}>{ORG.productName}</h2>

            <div style={styles.ornamentSmall}>
              <span style={styles.ornamentLineSmall} />
              <span style={styles.ornamentGemSmall}>◆</span>
              <span style={styles.ornamentLineSmall} />
            </div>

            <p className="royal-product-desc" style={styles.productDesc}>{ORG.productDesc}</p>
            <p className="royal-product-price" style={styles.productPrice}>₹{ORG.productPrice}</p>

            <div className="royal-product-meta" style={styles.productMeta}>
              <span>Freshly Prepared</span>
              <span style={styles.dot}>•</span>
              <span>Pure Desi Ghee</span>
              <span style={styles.dot}>•</span>
              <span>Counter Pickup</span>
            </div>
          </div>
        </>
      ) : (
        /* SUCCESS RECEIPT SECTION */
        <div className="royal-card royal-glass-card" style={styles.glassCard}>
          <div style={styles.successBox}>
            <div className="royal-success-icon" style={styles.successIcon}>♛</div>
            <h2 className="royal-success-title" style={styles.successTitle}>
              Order Placed Successfully
            </h2>

            <div style={styles.ornamentSmall}>
              <span style={styles.ornamentLineSmall} />
              <span style={styles.ornamentGemSmall}>◆</span>
              <span style={styles.ornamentLineSmall} />
            </div>

            <div className="royal-detail-card" style={styles.detailCard}>
              <DetailRow label="Customer" value={confirmedOrder?.name || ''} />
              <DetailRow label="Order ID" value={confirmedOrder?.orderNo || ''} highlight />
              <DetailRow label="Phone" value={confirmedOrder?.phone || ''} />
              <DetailRow label="Amount Paid" value={`₹${ORG.productPrice}`} last />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-wa royal-whatsapp-btn"
              style={styles.whatsappBtn}
            >
              Send Receipt on WhatsApp
            </a>

            <p className="royal-blessing" style={styles.blessing}>
              🙏 Thank you for your order 🙏
            </p>
          </div>
        </div>
      )}

      <Footer goTo={goTo} />
    </div>
  );
}

function DetailRow({ label, value, highlight, last }) {
  return (
    <div
      className="royal-detail-row"
      style={{ ...styles.detailRow, ...(last ? { borderBottom: 'none' } : {}) }}
    >
      <span className="royal-detail-key" style={styles.detailKey}>{label}</span>
      <span
        className={highlight ? 'royal-detail-val-highlight' : ''}
        style={highlight ? styles.detailValHighlight : styles.detailVal}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ goTo }) {
  const links = [
    { key: 'about', label: 'About Us' },
    { key: 'terms', label: 'Terms & Conditions' },
    { key: 'refund', label: 'Refund Policy' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'shipping', label: 'Shipping & Pickup Policy' },
    { key: 'contact', label: 'Contact Us' },
  ];

  return (
    <footer className="royal-footer" style={styles.footer}>
      <div style={styles.ornamentSmall}>
        <span style={styles.ornamentLineSmall} />
        <span style={styles.ornamentGemSmall}>◆</span>
        <span style={styles.ornamentLineSmall} />
      </div>

      <p className="royal-footer-text" style={styles.footerText}>
        {ORG.name} · Dilsukhnagar, Hyderabad
      </p>

      <p className="royal-footer-links" style={styles.footerLinks}>
        {links.map((l, i) => (
          <React.Fragment key={l.key}>
            <span
              className="royal-link"
              style={styles.footerLink}
              onClick={() => goTo(l.key)}
            >
              {l.label}
            </span>
            {i < links.length - 1 && (
              <span className="royal-footer-sep" style={styles.footerSep}>·</span>
            )}
          </React.Fragment>
        ))}
      </p>

      <p className="royal-footer-sub" style={styles.footerSub}>Laddu Shop</p>
    </footer>
  );
}

// ============================================================
// POLICY PAGE WRAPPER
// ============================================================
function PolicyPage({ page, goTo }) {
  const nav = [
    { key: 'about', label: 'About Us' },
    { key: 'terms', label: 'Terms & Conditions' },
    { key: 'refund', label: 'Refund Policy' },
    { key: 'privacy', label: 'Privacy Policy' },
    { key: 'shipping', label: 'Shipping & Pickup Policy' },
    { key: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="royal-policy-container" style={styles.policyContainer}>
      <span
        className="royal-link royal-back-link"
        style={styles.backLink}
        onClick={() => goTo('shop')}
      >
        ← Back to Shop
      </span>

      <nav className="royal-policy-nav" style={styles.policyNav}>
        {nav.map((n, i) => (
          <React.Fragment key={n.key}>
            <span
              className="royal-link"
              style={{
                ...styles.policyNavLink,
                ...(page === n.key ? styles.policyNavActive : {}),
              }}
              onClick={() => goTo(n.key)}
            >
              {n.label}
            </span>
            {i < nav.length - 1 && <span style={styles.policyNavSep}>|</span>}
          </React.Fragment>
        ))}
      </nav>

      {page === 'about' && <AboutContent />}
      {page === 'terms' && <TermsContent />}
      {page === 'refund' && <RefundContent />}
      {page === 'privacy' && <PrivacyContent />}
      {page === 'shipping' && <ShippingContent />}
      {page === 'contact' && <ContactContent />}

      <p className="royal-policy-footer" style={styles.policyFooter}>
        © {ORG.name} · {ORG.address}
      </p>
    </div>
  );
}

// ============================================================
// POLICY CONTENT
// ============================================================
function AboutContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>About Us</h1>
      <div className="royal-policy-card" style={styles.policyCard}>
        <p>
          <strong>Business Name:</strong> {ORG.name}
          <br />
          <strong>Entity Type:</strong> {ORG.entityType}
          <br />
          <strong>Address:</strong> {ORG.address}
          <br />
          <strong>Email:</strong> {ORG.email}
          <br />
          <strong>Phone:</strong> {ORG.phone}
        </p>
      </div>

      <h2 className="royal-policy-h2" style={styles.policyH2}>Who We Are</h2>
      <p>
        {ORG.name} is a food retail shop selling fresh Indian sweets. Our signature product is{' '}
        <strong>{ORG.productName}</strong>, prepared fresh daily and sold at{' '}
        <strong>₹{ORG.productPrice} per unit</strong>.
      </p>

      <h2 className="royal-policy-h2" style={styles.policyH2}>Our Product</h2>
      <ul>
        <li>
          <strong>{ORG.productName}</strong> – ₹{ORG.productPrice} per unit
        </li>
        <li>Freshly prepared in small batches</li>
        <li>Order online, pick up at our counter</li>
      </ul>

      <h2 className="royal-policy-h2" style={styles.policyH2}>Pickup Details</h2>
      <div className="royal-policy-card" style={styles.policyCard}>
        <p>
          <strong>Pickup Address:</strong> {ORG.venue}
          <br />
          <strong>Counter Timings:</strong> {ORG.counterTimings}
          <br />
          <strong>Online Orders:</strong> Open through this website
        </p>
      </div>

      <h2 className="royal-policy-h2" style={styles.policyH2}>Payments</h2>
      <p>
        All online payments on this website are processed securely through our
        payment gateway partner <strong>Razorpay</strong>. We do not store your
        card, UPI or bank account details on our servers.
      </p>
    </div>
  );
}

function TermsContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>Terms &amp; Conditions</h1>
      <p>By purchasing from this website, you agree to the following terms:</p>
      <ul>
        <li>The price is ₹{ORG.productPrice} per {ORG.productName}.</li>
        <li>
          Each successful payment guarantees one {ORG.productName} to be
          collected at our pickup counter.
        </li>
        <li>
          The order confirmation (Order ID) will be sent to your WhatsApp
          number after payment verification.
        </li>
        <li>
          The order is non-transferable. Duplicate or tampered confirmations
          will be rejected.
        </li>
        <li>
          The {ORG.productName} must be collected in person. No shipping is
          provided.
        </li>
        <li>The shop owner's decision regarding distribution is final.</li>
        <li>
          Any misuse, fraudulent payment, or attempt to manipulate the system
          will result in cancellation without refund.
        </li>
      </ul>
    </div>
  );
}

function RefundContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>Refund &amp; Cancellation Policy</h1>
      <ul>
        <li>
          The ₹{ORG.productPrice} purchase amount is <strong>non-refundable</strong> once
          payment is successful.
        </li>
        <li>
          If a payment is deducted but the order is not generated due to a
          technical failure on our side, contact us within 24 hours with your
          Razorpay Payment ID and we will process a full refund.
        </li>
        <li>
          Refunds, when applicable, are processed within 5–7 business days to
          the original payment method.
        </li>
        <li>For refund requests, email {ORG.email} or call {ORG.phone}.</li>
      </ul>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>Privacy Policy</h1>
      <p>
        We collect only the information you provide:{' '}
        <strong>your name and mobile number</strong>.
      </p>
      <ul>
        <li>
          This information is used solely to generate your order and send
          confirmation via WhatsApp.
        </li>
        <li>We do not sell, share, or rent your personal data to any third party.</li>
        <li>
          Payment information is processed securely by Razorpay. We do not
          store your card, UPI, or bank details.
        </li>
        <li>Data is stored securely and retained only as needed.</li>
        <li>To request deletion of your data, email us at {ORG.email}.</li>
      </ul>
    </div>
  );
}

function ShippingContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>Shipping &amp; Pickup Policy</h1>
      <p>
        This website sells a <strong>physical food product ({ORG.productName})</strong>. We offer{' '}
        <strong>local counter pickup</strong> for all physical orders. We do
        not ship products to customer addresses.
      </p>
      <ul>
        <li>
          Upon successful payment, an <strong>Order Receipt with an Order ID</strong> is
          generated instantly and delivered to the customer via WhatsApp.
        </li>
        <li>
          Customers can present their Order Receipt at our physical counter
          address to collect their product:
          <br />
          <strong>{ORG.venue}</strong>
        </li>
        <li>
          <strong>Pickup Counter Timings:</strong> {ORG.counterTimings}
        </li>
        <li>
          No shipping or home delivery is provided. All orders must be
          collected in person at the counter.
        </li>
        <li>
          If you do not receive the WhatsApp Order Receipt within 30 minutes of
          payment, contact us at {ORG.email} or {ORG.phone}.
        </li>
      </ul>
    </div>
  );
}

function ContactContent() {
  return (
    <div>
      <h1 className="royal-policy-h1" style={styles.policyH1}>Contact Us</h1>
      <div className="royal-policy-card" style={styles.policyCard}>
        <p>
          <strong>{ORG.name}</strong>
          <br />
          Gaddiannaram, Dilsukhnagar,
          <br />
          Hyderabad, Telangana 500060, India
          <br />
          📧 {ORG.email}
          <br />
          📞 {ORG.phone}
        </p>
      </div>
      <p>
        For any queries regarding your order, refunds, or pickup, please
        contact us using the details above. We aim to respond within 24 hours.
      </p>
    </div>
  );
}

// ============================================================
// STYLES — ROYAL EDITION (base styles; responsive via media queries)
// ============================================================
const styles = {
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
  bgImageWrapper: {
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '15vh',
  },
  shopContainer: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 16px',
  },

  // ---------- HEADER ----------
  headerSection: {
    textAlign: 'center',
    marginBottom: '22px',
    width: '100%',
  },
  eventName: {
    margin: '50px 0 0',
    paddingTop: '100px',
    fontFamily: FONT_DISPLAY,
    fontSize: '30px',
    fontWeight: 700,
    lineHeight: 1.25,
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
  eventLocation: {
    margin: '12px 0 0',
    fontFamily: FONT_BODY,
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '2.2px',
    textTransform: 'uppercase',
    color: '#d9c98d',
    textShadow: '0 2px 12px rgba(0,0,0,0.95)',
  },

  // ---------- ORNAMENTS ----------
  ornament: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '14px auto 0',
    maxWidth: '240px',
  },
  ornamentLine: {
    flex: 1,
    height: '1px',
    background: `linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.85) 100%)`,
  },
  ornamentGem: {
    color: GOLD,
    fontSize: '11px',
    lineHeight: 1,
    textShadow: '0 0 12px rgba(212,175,55,0.9)',
  },
  ornamentSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    margin: '12px auto 16px',
    maxWidth: '180px',
  },
  ornamentLineSmall: {
    flex: 1,
    height: '1px',
    background:
      'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.7) 100%)',
  },
  ornamentGemSmall: {
    color: GOLD,
    fontSize: '8px',
    lineHeight: 1,
    textShadow: '0 0 10px rgba(212,175,55,0.85)',
  },

  // ---------- FORM CARD (ROYAL) ----------
  glassCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '460px',
    background:
      'linear-gradient(160deg, rgba(12,66,48,0.96) 0%, rgba(5,32,23,0.98) 52%, rgba(2,16,11,0.99) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(212, 175, 55, 0.55)',
    borderRadius: '18px',
    padding: '30px 26px 30px',
    boxShadow:
      '0 30px 80px rgba(0,0,0,0.75), 0 0 46px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.35), inset 0 -1px 0 rgba(212,175,55,0.10)',
    boxSizing: 'border-box',
    marginBottom: '22px',
  },
  cardCrest: {
    textAlign: 'center',
    fontSize: '20px',
    lineHeight: 1,
    color: GOLD,
    marginBottom: '10px',
    textShadow: '0 0 18px rgba(212,175,55,0.85)',
  },
  formTitle: {
    margin: '0 0 22px',
    fontFamily: FONT_DISPLAY,
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: GOLD_LIGHT,
    textShadow: '0 2px 12px rgba(0,0,0,0.85)',
  },
  field: { marginBottom: '18px' },
  label: {
    display: 'block',
    marginBottom: '7px',
    fontFamily: FONT_DISPLAY,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color: '#c9b26a',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },
  input: {
    width: '100%',
    padding: '14px 15px',
    fontFamily: FONT_BODY,
    fontSize: '17px',
    fontWeight: 500,
    letterSpacing: '0.4px',
    borderRadius: '10px',
    border: '1px solid rgba(212, 175, 55, 0.38)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#f3e7c4',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
  },
  payBtn: {
    width: '100%',
    padding: '16px',
    marginTop: '8px',
    fontFamily: FONT_DISPLAY,
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    background: GOLD_GRADIENT,
    color: '#08281c',
    border: '1px solid rgba(255, 245, 200, 0.65)',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow:
      '0 12px 34px rgba(212, 175, 55, 0.35), inset 0 1px 0 rgba(255,255,255,0.55)',
  },
  note: {
    margin: '16px 0 0',
    fontFamily: FONT_BODY,
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '1px',
    color: '#9fbeac',
    textAlign: 'center',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },

  // ---------- PRODUCT CARD (ROYAL) ----------
  productCard: {
    width: '100%',
    maxWidth: '460px',
    background:
      'linear-gradient(165deg, rgba(13,70,51,0.94) 0%, rgba(4,27,19,0.98) 60%, rgba(2,16,11,0.99) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.55)',
    borderRadius: '18px',
    padding: '22px',
    marginBottom: '22px',
    textAlign: 'center',
    boxShadow:
      '0 26px 70px rgba(0,0,0,0.72), 0 0 40px rgba(212,175,55,0.10), inset 0 1px 0 rgba(212,175,55,0.32)',
    boxSizing: 'border-box',
  },
  productImageFrame: {
    padding: '6px',
    borderRadius: '12px',
    background: GOLD_GRADIENT,
    boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
    marginBottom: '18px',
  },
  productImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    display: 'block',
  },
  productTitle: {
    margin: '0 0 4px',
    fontFamily: FONT_DISPLAY,
    fontSize: '21px',
    fontWeight: 700,
    letterSpacing: '1.6px',
    textTransform: 'uppercase',
    color: GOLD_LIGHT,
    textShadow: '0 2px 12px rgba(0,0,0,0.85)',
  },
  productDesc: {
    margin: '0 0 14px',
    fontFamily: FONT_BODY,
    fontSize: '16.5px',
    lineHeight: 1.55,
    color: '#cfe0d6',
  },
  productPrice: {
    margin: '0 0 14px',
    fontFamily: FONT_DISPLAY,
    fontSize: '30px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    backgroundImage: GOLD_TEXT_GRADIENT,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: GOLD,
    filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8))',
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '9px',
    flexWrap: 'wrap',
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    color: '#c9b26a',
  },
  dot: { color: 'rgba(212,175,55,0.6)' },

  // ---------- SUCCESS ----------
  successBox: { textAlign: 'center' },
  successIcon: {
    fontSize: '30px',
    lineHeight: 1,
    marginBottom: '12px',
    color: GOLD,
    textShadow: '0 0 26px rgba(212,175,55,0.9)',
  },
  successTitle: {
    margin: '0',
    fontFamily: FONT_DISPLAY,
    fontSize: '17px',
    fontWeight: 700,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color: GOLD_LIGHT,
    textShadow: '0 2px 14px rgba(0,0,0,0.9)',
  },

  // Parchment receipt
  detailCard: {
    background: 'linear-gradient(180deg, #fdf8ea 0%, #f4ead1 100%)',
    border: '1px solid rgba(212, 175, 55, 0.9)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '22px',
    textAlign: 'left',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.75), 0 10px 26px rgba(0,0,0,0.4)',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px dashed rgba(138, 109, 31, 0.4)',
    fontSize: '16px',
  },
  detailKey: {
    fontFamily: FONT_DISPLAY,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    color: '#6b5a2a',
  },
  detailVal: {
    fontFamily: FONT_BODY,
    color: '#2f2a1f',
    fontWeight: 600,
    maxWidth: '60%',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  detailValHighlight: {
    fontFamily: FONT_DISPLAY,
    color: ROYAL_GREEN,
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '1.2px',
  },
  whatsappBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    fontFamily: FONT_DISPLAY,
    fontSize: '12.5px',
    fontWeight: 700,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #1faa53 0%, #25D366 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    border: '1px solid rgba(212, 175, 55, 0.6)',
    borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(37, 211, 102, 0.45)',
    boxSizing: 'border-box',
  },
  blessing: {
    margin: '20px 0 0',
    fontFamily: FONT_BODY,
    fontSize: '15px',
    fontStyle: 'italic',
    letterSpacing: '0.8px',
    color: '#c9b26a',
    textShadow: '0 1px 8px rgba(0,0,0,0.85)',
  },

  // ---------- FOOTER ----------
  footer: {
    width: '100%',
    textAlign: 'center',
    padding: '24px 16px',
  },
  footerText: {
    margin: 0,
    fontFamily: FONT_DISPLAY,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color: '#d9c98d',
    textShadow: '0 1px 8px rgba(0,0,0,0.9)',
  },
  footerLinks: {
    margin: '12px 0 0',
    fontFamily: FONT_BODY,
    fontSize: '14.5px',
    fontWeight: 600,
    letterSpacing: '0.4px',
    color: '#9fbeac',
    lineHeight: 1.9,
  },
  footerLink: {
    color: GOLD,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },
  footerSep: {
    color: 'rgba(212,175,55,0.5)',
    margin: '0 7px',
  },
  footerSub: {
    margin: '12px 0 0',
    fontFamily: FONT_DISPLAY,
    fontSize: '9.5px',
    fontWeight: 600,
    letterSpacing: '4px',
    textTransform: 'uppercase',
    color: 'rgba(212,175,55,0.55)',
  },

  // ---------- POLICY (PARCHMENT / ROYAL) ----------
  policyContainer: {
    width: '100%',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px 28px 38px',
    background: 'linear-gradient(180deg, #fdfaf1 0%, #f7f1e0 100%)',
    border: '1px solid rgba(212, 175, 55, 0.75)',
    borderRadius: '16px',
    boxShadow:
      '0 30px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.7), inset 0 1px 0 rgba(212,175,55,0.4)',
    color: '#2f2a1f',
    fontFamily: FONT_BODY,
    fontSize: '17px',
    lineHeight: 1.65,
    boxSizing: 'border-box',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '20px',
    fontFamily: FONT_DISPLAY,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color: ROYAL_GREEN,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  policyNav: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.55)',
    fontFamily: FONT_DISPLAY,
    fontSize: '10.5px',
    fontWeight: 600,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    lineHeight: 2,
  },
  policyNavLink: {
    color: GOLD_DEEP,
    cursor: 'pointer',
    margin: '0 2px',
    textDecoration: 'none',
  },
  policyNavActive: {
    color: ROYAL_GREEN,
    fontWeight: 700,
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
  },
  policyNavSep: {
    color: 'rgba(212,175,55,0.6)',
    margin: '0 6px',
  },
  policyH1: {
    margin: '0 0 18px',
    paddingBottom: '12px',
    fontFamily: FONT_DISPLAY,
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '1.8px',
    textTransform: 'uppercase',
    color: ROYAL_GREEN,
    borderBottom: '2px solid rgba(212, 175, 55, 0.75)',
  },
  policyH2: {
    marginTop: '30px',
    marginBottom: '10px',
    paddingBottom: '6px',
    fontFamily: FONT_DISPLAY,
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    color: GOLD_DEEP,
    borderBottom: '1px solid rgba(212, 175, 55, 0.45)',
  },
  policyCard: {
    background: '#fffdf7',
    border: '1px solid rgba(212, 175, 55, 0.6)',
    borderRadius: '10px',
    padding: '16px 20px',
    margin: '16px 0',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
  },
  policyFooter: {
    marginTop: '40px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(212, 175, 55, 0.45)',
    fontFamily: FONT_DISPLAY,
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '1.4px',
    textTransform: 'uppercase',
    color: '#8a7b52',
    wordBreak: 'break-word',
  },
  bottomBlackSection: {
    width: '100%',
    height: '160px',
    marginTop: '20px',
  },
};