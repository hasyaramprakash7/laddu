import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ganeshImg from '../assets/ganesh.jpeg'; // Background Image
import ladduImg from '../assets/laddu.png';     // Product Image

const API_BASE = 'https://ganesh-ikqb.onrender.com';

const ORG = {
  name: 'Sri Krishna Sweets',
  entityType: 'Food Retail / Sweets Shop',
  address: 'Gaddiannaram, Dilsukhnagar, Hyderabad, Telangana 500060, India',
  email: 'bluxury1000@gmail.com',
  phone: '+91 7893828468',
  productName: 'Special Motichoor Laddu',
  productPrice: 20,
  productDesc: 'Made with pure desi ghee and premium quality gram flour. Freshly prepared daily and packed hygienically. Perfect for all occasions.',
  venue: 'Sri Krishna Sweets Pickup Counter, Gaddiannaram, Dilsukhnagar, Hyderabad, Telangana 500060',
  counterTimings: '8:00 AM – 9:00 PM (All Days)',
};

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
        theme: { color: '#b71c1c' },
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
      {/* Background Image Wrapper */}
      <div style={styles.bgImageWrapper}>
        <img src={ganeshImg} alt="Background" style={styles.bgImage} />
        <div style={styles.bgOverlay} />
      </div>

      <div style={styles.content}>
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

        <div style={styles.bottomBlackSection} />
      </div>
    </div>
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
    <div style={styles.shopContainer}>
      <div style={styles.headerSection}>
        <h1 style={styles.eventName}>🛒 {ORG.name} 🛒</h1>
        <p style={styles.eventLocation}>📍 Gaddiannaram, Dilsukhnagar, Hyderabad</p>
      </div>

      {!isPaid ? (
        <>
          {/* PRODUCT DISPLAY SECTION (Laddu Image) */}
          <div style={styles.productCard}>
            <img src={ladduImg} alt={ORG.productName} style={styles.productImage} />
            <h2 style={styles.productTitle}>{ORG.productName}</h2>
            <p style={styles.productDesc}>{ORG.productDesc}</p>
            <p style={styles.productPrice}>Price: ₹{ORG.productPrice}</p>
            <div style={styles.productMeta}>
              <span>✅ Freshly Prepared</span>
              <span>✅ Pure Desi Ghee</span>
              <span>✅ Counter Pickup</span>
            </div>
          </div>

          {/* CHECKOUT FORM SECTION */}
          <div style={styles.glassCard}>
            <h3 style={styles.formTitle}>Enter Details to Place Order</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Phone Number</label>
                <input
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

              <button type="submit" disabled={loading} style={styles.payBtn}>
                {loading ? '⏳ Processing...' : `💰 Pay ₹${ORG.productPrice} & Place Order`}
              </button>

              <p style={styles.note}>🔒 Secure payment via Razorpay</p>
            </form>
          </div>
        </>
      ) : (
        /* SUCCESS RECEIPT SECTION */
        <div style={styles.glassCard}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Order Placed Successfully!</h2>

            <div style={styles.detailCard}>
              <DetailRow label="Customer" value={confirmedOrder?.name || ''} />
              <DetailRow label="Order ID" value={confirmedOrder?.orderNo || ''} highlight />
              <DetailRow label="Phone" value={confirmedOrder?.phone || ''} />
              <DetailRow label="Amount Paid" value={`₹${ORG.productPrice}`} />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.whatsappBtn}
            >
              📲 Send Receipt on WhatsApp
            </a>

            <p style={styles.blessing}>🙏 Thank you for your order 🙏</p>
          </div>
        </div>
      )}

      <Footer goTo={goTo} />
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailKey}>{label}</span>
      <span style={highlight ? styles.detailValHighlight : styles.detailVal}>{value}</span>
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
    <footer style={styles.footer}>
      <p style={styles.footerText}>🛒 {ORG.name} • Dilsukhnagar, Hyderabad 🛒</p>
      <p style={styles.footerLinks}>
        {links.map((l, i) => (
          <React.Fragment key={l.key}>
            <span style={styles.footerLink} onClick={() => goTo(l.key)}>
              {l.label}
            </span>
            {i < links.length - 1 && ' • '}
          </React.Fragment>
        ))}
      </p>
      <p style={styles.footerSub}>Laddu Shop</p>
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
    <div style={styles.policyContainer}>
      <span style={styles.backLink} onClick={() => goTo('shop')}>
        ← Back to Shop
      </span>

      <nav style={styles.policyNav}>
        {nav.map((n, i) => (
          <React.Fragment key={n.key}>
            <span
              style={{
                ...styles.policyNavLink,
                ...(page === n.key ? styles.policyNavActive : {}),
              }}
              onClick={() => goTo(n.key)}
            >
              {n.label}
            </span>
            {i < nav.length - 1 && ' | '}
          </React.Fragment>
        ))}
      </nav>

      {page === 'about' && <AboutContent />}
      {page === 'terms' && <TermsContent />}
      {page === 'refund' && <RefundContent />}
      {page === 'privacy' && <PrivacyContent />}
      {page === 'shipping' && <ShippingContent />}
      {page === 'contact' && <ContactContent />}

      <p style={styles.policyFooter}>
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
      <h1 style={styles.policyH1}>About Us</h1>
      <div style={styles.policyCard}>
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

      <h2 style={styles.policyH2}>Who We Are</h2>
      <p>
        {ORG.name} is a food retail shop selling fresh Indian sweets. Our signature product is{' '}
        <strong>{ORG.productName}</strong>, prepared fresh daily and sold at{' '}
        <strong>₹{ORG.productPrice} per unit</strong>.
      </p>

      <h2 style={styles.policyH2}>Our Product</h2>
      <ul>
        <li>
          <strong>{ORG.productName}</strong> – ₹{ORG.productPrice} per unit
        </li>
        <li>Freshly prepared in small batches</li>
        <li>Order online, pick up at our counter</li>
      </ul>

      <h2 style={styles.policyH2}>Pickup Details</h2>
      <div style={styles.policyCard}>
        <p>
          <strong>Pickup Address:</strong> {ORG.venue}
          <br />
          <strong>Counter Timings:</strong> {ORG.counterTimings}
          <br />
          <strong>Online Orders:</strong> Open through this website
        </p>
      </div>

      <h2 style={styles.policyH2}>Payments</h2>
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
      <h1 style={styles.policyH1}>Terms &amp; Conditions</h1>
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
      <h1 style={styles.policyH1}>Refund &amp; Cancellation Policy</h1>
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
      <h1 style={styles.policyH1}>Privacy Policy</h1>
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
      <h1 style={styles.policyH1}>Shipping &amp; Pickup Policy</h1>
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
      <h1 style={styles.policyH1}>Contact Us</h1>
      <div style={styles.policyCard}>
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
// STYLES
// ============================================================
const styles = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    backgroundColor: '#000',
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
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.4) 30%, rgba(74,14,14,0.85) 60%, rgba(0,0,0,0.95) 100%)',
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
  headerSection: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  eventName: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: '0.5px',
    textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 0 30px rgba(212,160,23,0.6)',
  },
  eventLocation: {
    margin: '10px 0 0',
    fontSize: '14px',
    color: '#ffe0b2',
    letterSpacing: '0.4px',
    textShadow: '0 2px 10px rgba(0,0,0,0.95)',
  },
  
  // Product Card Styles
  productCard: {
    width: '100%',
    maxWidth: '460px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    border: '2px solid #d4a017',
  },
  productImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  productTitle: {
    margin: '0 0 10px',
    fontSize: '22px',
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  productDesc: {
    margin: '0 0 12px',
    fontSize: '14px',
    color: '#5d4037',
    lineHeight: '1.5',
  },
  productPrice: {
    margin: '0 0 12px',
    fontSize: '24px',
    color: '#e65100',
    fontWeight: 'bold',
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '12px',
    color: '#2e7d32',
    fontWeight: '600',
    flexWrap: 'wrap',
  },

  // Form Card Styles
  glassCard: {
    width: '100%',
    maxWidth: '460px',
    background: 'rgba(139, 0, 0, 0.85)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1.5px solid rgba(255, 255, 255, 0.35)',
    borderRadius: '20px',
    padding: '26px 24px 28px',
    boxShadow: '0 25px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
    boxSizing: 'border-box',
    marginBottom: '20px',
  },
  formTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    color: '#fff8e1',
    textAlign: 'center',
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.85)',
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff3e0',
    letterSpacing: '0.3px',
    textShadow: '0 1px 5px rgba(0,0,0,0.8)',
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    fontSize: '15px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255, 255, 255, 0.45)',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#3e2723',
    outline: 'none',
    boxSizing: 'border-box',
  },
  payBtn: {
    width: '100%',
    padding: '15px',
    marginTop: '6px',
    background: 'linear-gradient(135deg, #e65100 0%, #b71c1c 100%)',
    color: '#fff8e1',
    border: '1.5px solid rgba(255, 215, 0, 0.55)',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 24px rgba(230, 81, 0, 0.6)',
  },
  note: {
    margin: '14px 0 0',
    fontSize: '11.5px',
    color: '#ffe0b2',
    textAlign: 'center',
    textShadow: '0 1px 5px rgba(0,0,0,0.8)',
  },

  // Success Styles
  successBox: { textAlign: 'center' },
  successIcon: { fontSize: '44px', marginBottom: '4px' },
  successTitle: {
    margin: '0 0 18px',
    fontSize: '21px',
    color: '#a5d6a7',
    fontWeight: 'bold',
    textShadow: '0 2px 10px rgba(0,0,0,0.85)',
  },
  detailCard: {
    background: 'rgba(255, 248, 240, 0.95)',
    border: '2px solid #d4a017',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 0',
    borderBottom: '1px dashed #e0c9a6',
    fontSize: '14px',
  },
  detailKey: { color: '#5d4037', fontWeight: '600' },
  detailVal: {
    color: '#3e2723',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  detailValHighlight: {
    color: '#b71c1c',
    fontWeight: 'bold',
    fontSize: '15px',
    letterSpacing: '0.5px',
  },
  whatsappBtn: {
    display: 'block',
    width: '100%',
    padding: '15px',
    background: '#25D366',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 8px 24px rgba(37, 211, 102, 0.6)',
    boxSizing: 'border-box',
  },
  blessing: {
    margin: '18px 0 0',
    fontSize: '13px',
    color: '#fff3e0',
    fontStyle: 'italic',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },

  // Footer Styles
  footer: {
    width: '100%',
    textAlign: 'center',
    padding: '20px 16px',
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    letterSpacing: '0.4px',
    color: '#ffe0b2',
    textShadow: '0 1px 6px rgba(0,0,0,0.85)',
  },
  footerLinks: {
    margin: '10px 0 0',
    fontSize: '12px',
    color: '#ffe0b2',
    letterSpacing: '0.3px',
  },
  footerLink: {
    color: '#FFD700',
    textDecoration: 'underline',
    cursor: 'pointer',
    textShadow: '0 1px 5px rgba(0,0,0,0.85)',
  },
  footerSub: {
    margin: '6px 0 0',
    fontSize: '11px',
    opacity: 0.75,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#ffe0b2',
  },

  // Policy Styles
  policyContainer: {
    width: '100%',
    maxWidth: '800px',
    margin: '40px auto',
    padding: '26px 24px 34px',
    background: '#fffaf3',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
    color: '#2b2b2b',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '18px',
    color: '#b71c1c',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'none',
  },
  policyNav: {
    marginBottom: '22px',
    paddingBottom: '14px',
    borderBottom: '2px solid #ffe0b2',
    fontSize: '14px',
  },
  policyNavLink: {
    color: '#b71c1c',
    cursor: 'pointer',
    margin: '0 2px',
    textDecoration: 'none',
  },
  policyNavActive: {
    fontWeight: 'bold',
    textDecoration: 'underline',
  },
  policyH1: {
    color: '#b71c1c',
    marginTop: 0,
    fontSize: '26px',
  },
  policyH2: {
    color: '#e65100',
    marginTop: '30px',
    borderBottom: '2px solid #ffe0b2',
    paddingBottom: '6px',
    fontSize: '20px',
  },
  policyCard: {
    background: '#fff',
    border: '1px solid #ffe0b2',
    borderRadius: '8px',
    padding: '14px 18px',
    margin: '16px 0',
  },
  policyFooter: {
    marginTop: '40px',
    fontSize: '13px',
    color: '#666',
  },
  bottomBlackSection: {
    width: '100%',
    height: '200px',
    marginTop: '20px',
  },
};