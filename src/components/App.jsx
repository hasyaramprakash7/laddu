import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Code, Database, Sparkles, Coffee, Bot, 
  Sun, Moon, X, Loader2, CheckCircle2, 
  GitBranch, ShieldCheck, ArrowRight 
} from 'lucide-react';

const API_BASE = 'https://ganesh-ikqb.onrender.com';

const PROJECTS = [
  { id: 'ai-chat', title: 'Full Stack AI Chatbot', desc: 'React + FastAPI + Groq streaming.', icon: Code, tag: 'Popular' },
  { id: 'data-viz', title: 'Data Science Dashboard', desc: 'Pandas + Streamlit analytics.', icon: Database, tag: 'Data' },
  { id: 'gen-ai', title: 'Generative AI Image App', desc: 'Diffusion models + Next.js.', icon: Sparkles, tag: 'Creative' },
  { id: 'java-spring', title: 'Java Spring Boot AI API', desc: 'Enterprise backend + LLM APIs.', icon: Coffee, tag: 'Backend' },
  { id: 'auto-agent', title: 'Autonomous AI Agent', desc: 'LangChain + multi-step reasoning.', icon: Bot, tag: 'Advanced' },
];

/* --- 3D SPACE BACKGROUND --- */
function SpaceBackground({ theme }) {
  const canvasRef = useRef(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const STAR_COUNT = w < 640 ? 260 : 520;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random() * 0.95 + 0.05,
      s: Math.random() * 0.8 + 0.4,
    }));

    const GLOBE_COUNT = 360;
    const globe = Array.from({ length: GLOBE_COUNT }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / GLOBE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.cos(phi),
        z: Math.sin(theta) * Math.sin(phi),
      };
    });

    let globeAlpha = 0;
    let angle = 0;

    const onMove = (e) => {
      mouse.tx = (e.clientX / w - 0.5) * 2;
      mouse.ty = (e.clientY / h - 0.5) * 2;
    };

    const frame = () => {
      const isDark = themeRef.current === 'dark';
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const cx = w / 2;
      const cy = h / 2;
      const focal = Math.max(w, h) * 0.9;
      const starColor = isDark ? '#ffffff' : '#000000';

      for (const st of stars) {
        if (!reduce) st.z -= 0.0007;
        if (st.z <= 0.05) {
          st.z = 1;
          st.x = (Math.random() - 0.5) * 2;
          st.y = (Math.random() - 0.5) * 2;
        }
        const px = cx + (st.x / st.z) * focal * 0.35 - mouse.x * 40 * (1 - st.z);
        const py = cy + (st.y / st.z) * focal * 0.35 - mouse.y * 40 * (1 - st.z);
        if (px < -5 || px > w + 5 || py < -5 || py > h + 5) continue;
        const depth = 1 - st.z;
        const r = st.s * (0.5 + depth * 1.4);
        ctx.globalAlpha = Math.min(1, 0.25 + depth * 0.9);
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      globeAlpha += (1 - globeAlpha) * 0.06;
      if (globeAlpha > 0.01) {
        if (!reduce) angle += 0.004;
        const radius = Math.min(w, h) * (w < 640 ? 0.4 : 0.3);
        const gcx = cx + mouse.x * 14;
        const gcy = cy - h * 0.1 + mouse.y * 14;
        const tilt = 0.35 + mouse.y * 0.15;
        const rot = angle + mouse.x * 0.4;
        const cosY = Math.cos(rot), sinY = Math.sin(rot);
        const cosX = Math.cos(tilt), sinX = Math.sin(tilt);
        const globeColor = isDark ? '#ffffff' : '#000000';

        for (const p of globe) {
          const x1 = p.x * cosY + p.z * sinY;
          const z1 = -p.x * sinY + p.z * cosY;
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;
          const persp = 1 / (1.8 - z2 * 0.5);
          const sx = gcx + x1 * radius * persp * 1.8;
          const sy = gcy + y2 * radius * persp * 1.8;
          const front = (z2 + 1) / 2;
          ctx.globalAlpha = globeAlpha * (0.12 + front * 0.8);
          ctx.fillStyle = globeColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.6 + front * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
        transition: 'background-color 0.5s ease',
      }}
    />
  );
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const isDark = theme === 'dark';

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!name || phone.length !== 10) {
      alert('Please enter a valid name and 10-digit phone number.');
      return;
    }

    setLoading(true);
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert('Failed to load Razorpay. Check your internet.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(`${API_BASE}/api/order/create`, {
        name,
        phone,
        projectId: selectedProject.id
      });

      if (!data.success) throw new Error(data.error);

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'ProNexa Projects',
        description: `Purchase: ${selectedProject.title}`,
        order_id: data.order_id,
        prefill: { name, contact: phone },
        theme: { color: isDark ? '#ffffff' : '#000000' },
        
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_BASE}/api/order/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderNo: data.orderNo,
            });

            if (verifyRes.data.success) {
              setSuccessData({
                projectName: verifyRes.data.projectName,
                githubLink: verifyRes.data.githubLink,
              });
            }
          } catch (err) {
            alert('Payment succeeded but verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Payment failed to initialize.');
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
    setName('');
    setPhone('');
    setSuccessData(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      position: 'relative', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: isDark ? '#ffffff' : '#000000',
      transition: 'color 0.5s ease'
    }}>
      <SpaceBackground theme={theme} />

      {/* Header */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.05em' }}>
          ProNexa Projects
        </div>
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex',
            height: '36px',
            width: '36px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}`,
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* Main Content */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: '120px 16px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
            Buy AI Projects
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.7 }}>
            Get full source code for production-ready AI applications. Just ₹1 each.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {PROJECTS.map((proj) => (
            <div 
              key={proj.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '24px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transition: 'background-color 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                  }}>
                    {proj.tag}
                  </span>
                  <proj.icon size={24} color={isDark ? '#34d399' : '#059669'} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{proj.title}</h3>
                <p style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.6 }}>
                  {proj.desc}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: 'auto', 
                paddingTop: '16px', 
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` 
              }}>
                <div>
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', opacity: 0.5, marginRight: '8px' }}>₹499</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹1</span>
                </div>
                <button 
                  onClick={() => setSelectedProject(proj)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#ffffff' : '#000000',
                    color: isDark ? '#000000' : '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Checkout / Success Modal */}
      {selectedProject && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            overflow: 'hidden',
            borderRadius: '24px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                display: 'flex',
                height: '32px',
                width: '32px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                color: 'inherit',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {!successData ? (
              <div style={{ padding: '32px' }}>
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Secure Checkout</h2>
                  <p style={{ fontSize: '14px', opacity: 0.6 }}>
                    You are purchasing <b>{selectedProject.title}</b> for ₹1.
                  </p>
                </div>

                <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.7 }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                        padding: '12px 16px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: 'inherit',
                        boxSizing: 'border-box',
                      }}
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.7 }}>
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      required
                      maxLength="10"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '100%',
                        borderRadius: '12px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                        padding: '12px 16px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: 'inherit',
                        boxSizing: 'border-box',
                      }}
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '12px',
                      padding: '14px',
                      fontWeight: 'bold',
                      marginTop: '8px',
                      backgroundColor: isDark ? '#ffffff' : '#000000',
                      color: isDark ? '#000000' : '#ffffff',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={18} />}
                    {loading ? 'Processing...' : 'Pay ₹1 via Razorpay'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                  margin: '0 auto 24px',
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Payment Successful!</h2>
                <p style={{ fontSize: '14px', marginBottom: '32px', opacity: 0.6 }}>
                  Thank you for purchasing <b>{successData.projectName}</b>.
                </p>

                <div style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  marginBottom: '24px',
                }}>
                  <GitBranch size={32} style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Your GitHub Repository</h3>
                  <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Click below to access the source code.</p>
                  <a 
                    href={successData.githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      backgroundColor: isDark ? '#ffffff' : '#000000',
                      color: isDark ? '#000000' : '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    Open GitHub <ArrowRight size={16} />
                  </a>
                </div>

                <button 
                  onClick={closeModal}
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    opacity: 0.7,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Keyframe for loader animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}