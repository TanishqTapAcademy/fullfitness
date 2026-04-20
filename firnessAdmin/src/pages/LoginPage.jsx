import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const particlesRef = useRef(null);

  // spawn particles
  useEffect(() => {
    const el = particlesRef.current;
    if (!el) return;
    for (let i = 0; i < 16; i++) {
      const d = document.createElement('i');
      const dur = 10 + Math.random() * 14;
      const delay = -Math.random() * dur;
      const x = Math.random() * 100;
      const dx = (Math.random() - 0.5) * 100;
      const size = 1.5 + Math.random() * 2.5;
      Object.assign(d.style, {
        position: 'absolute',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: '#E8FF6B',
        bottom: '-20px',
        left: x + '%',
        animationDuration: dur + 's',
        animationDelay: delay + 's',
        opacity: 0.25 + Math.random() * 0.45,
        boxShadow: '0 0 8px rgba(232,255,107,0.35)',
        animationName: 'rise',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      });
      d.style.setProperty('--dx', dx + 'px');
      el.appendChild(d);
    }
    return () => { el.innerHTML = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --accent: #E8FF6B;
          --accent-glow: rgba(232,255,107,0.35);
          --bg: #0e0e12;
          --card: #1a1a24;
          --line: #2a2a34;
          --ink: #ffffff;
          --ink-dim: #8e8e9e;
          --ink-mute: #5a5a68;
        }

        .lp-stage {
          position: fixed; inset: 0; overflow: hidden;
          background:
            radial-gradient(700px 500px at 80% 20%, rgba(232,255,107,0.06), transparent 60%),
            radial-gradient(600px 500px at 15% 85%, rgba(232,255,107,0.04), transparent 60%),
            var(--bg);
          z-index: 0;
        }

        .lp-grid {
          position: absolute; inset: -10%;
          background-image:
            linear-gradient(#20202c 1px, transparent 1px),
            linear-gradient(90deg, #20202c 1px, transparent 1px);
          background-size: 48px 48px;
          transform: perspective(800px) rotateX(64deg) translateY(6%) scale(1.35);
          transform-origin: 50% 80%;
          mask-image: linear-gradient(180deg, transparent 25%, #000 55%, transparent 95%);
          -webkit-mask-image: linear-gradient(180deg, transparent 25%, #000 55%, transparent 95%);
          animation: lp-gridFlow 16s linear infinite;
          opacity: .55;
        }
        @keyframes lp-gridFlow {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 0 48px, 48px 0; }
        }

        .lp-rings {
          position: absolute;
          right: -180px; top: 50%;
          width: 720px; height: 720px;
          transform: translateY(-50%);
          pointer-events: none;
          opacity: .9;
        }
        .lp-rings.left {
          left: -220px; right: auto;
          width: 680px; height: 680px;
          opacity: .55;
        }
        .lp-ring {
          position: absolute; inset: 0;
          border: 1px dashed #242430;
          border-radius: 50%;
          animation: lp-spin 50s linear infinite;
        }
        .lp-ring.r2 { inset: 10%; border-style: solid; border-color: #1f1f2a; animation-duration: 70s; animation-direction: reverse; }
        .lp-ring.r3 { inset: 22%; border-style: dashed; animation-duration: 90s; }
        .lp-ring.r4 { inset: 34%; border: 1px solid var(--accent); opacity: .18; animation-duration: 60s; }
        .lp-ring.r5 { inset: 46%; border-style: dotted; border-color: #2a2a35; animation-duration: 40s; animation-direction: reverse; }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        .lp-pulse-dot {
          position: absolute; inset: 34%;
          animation: lp-spin 16s linear infinite;
        }
        .lp-pulse-dot::before {
          content: "";
          position: absolute; left: 50%; top: -5px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 18px 4px var(--accent-glow), 0 0 50px 10px var(--accent-glow);
          transform: translateX(-50%);
        }

        .lp-scan {
          position: absolute; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--accent) 50%, transparent);
          opacity: .4;
          filter: blur(.5px);
          animation: lp-scanMove 7s linear infinite;
        }
        .lp-scan.s2 { animation-delay: -2.5s; opacity: .22; }
        .lp-scan.s3 { animation-delay: -5s; opacity: .15; }
        @keyframes lp-scanMove {
          0% { top: -5%; opacity: 0; }
          10% { opacity: .5; }
          90% { opacity: .5; }
          100% { top: 105%; opacity: 0; }
        }

        .lp-ecg {
          position: absolute; left: 0; right: 0; bottom: 10%;
          height: 100px;
          pointer-events: none;
          opacity: .7;
        }
        .lp-ecg svg { width: 100%; height: 100%; display: block; }
        .lp-ecg path {
          stroke: var(--accent);
          stroke-width: 1.3;
          fill: none;
          filter: drop-shadow(0 0 4px var(--accent-glow));
          stroke-dasharray: 2400;
          stroke-dashoffset: 2400;
          animation: lp-ecgDraw 6s linear infinite;
        }
        @keyframes lp-ecgDraw { to { stroke-dashoffset: 0; } }

        .lp-particles { position: absolute; inset: 0; pointer-events: none; }
        @keyframes rise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: .55; }
          90% { opacity: .25; }
          100% { transform: translateY(-110vh) translateX(var(--dx, 0)); opacity: 0; }
        }

        .lp-frame { position: fixed; inset: 16px; pointer-events: none; z-index: 5; }
        .lp-corner { position: absolute; width: 18px; height: 18px; border: 1px solid #23232e; }
        .lp-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; }
        .lp-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; }
        .lp-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; }
        .lp-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; }

        .lp-card {
          position: relative;
          width: 360px;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 40px;
          display: flex; flex-direction: column; gap: 20px;
          box-shadow:
            0 30px 80px -24px rgba(0,0,0,0.7),
            0 0 0 1px rgba(255,255,255,0.02) inset;
          opacity: 0;
          transform: translateY(20px) scale(.985);
          animation: lp-cardIn .9s cubic-bezier(.2,.8,.2,1) .15s forwards;
        }
        @keyframes lp-cardIn { to { opacity: 1; transform: translateY(0) scale(1); } }

        .lp-card::before {
          content: ""; position: absolute; left: 28px; right: 28px; top: -1px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: .7;
        }

        .lp-brand-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 0 var(--accent-glow);
          animation: lp-markPulse 2.6s ease-in-out infinite;
        }
        @keyframes lp-markPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(232,255,107,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(232,255,107,0.0); }
        }

        .lp-input-shell {
          position: relative;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 8px;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .lp-input-shell:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(232,255,107,0.10);
        }
        .lp-input-shell input {
          width: 100%;
          background: transparent;
          border: 0; outline: 0;
          color: #fff;
          font: 500 14px/1 'DM Sans', system-ui, sans-serif;
          padding: 10px 12px 10px 38px;
        }
        .lp-input-shell input::placeholder { color: var(--ink-mute); font-weight: 400; }

        .lp-input-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          width: 16px; height: 16px;
          color: var(--ink-dim);
          display: flex; align-items: center; justify-content: center;
          transition: color .2s;
        }
        .lp-input-shell:focus-within .lp-input-icon { color: var(--accent); }

        .lp-eye {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 28px; height: 28px; border: 0; background: transparent;
          color: var(--ink-mute); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          border-radius: 6px;
          transition: color .15s, background .15s;
        }
        .lp-eye:hover { color: #fff; background: #0e0e12; }

        .lp-submit {
          position: relative; overflow: hidden;
          background: var(--accent);
          color: var(--bg);
          border: none; border-radius: 8px;
          padding: 11px 0;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: transform .12s ease, box-shadow .2s ease, opacity .15s ease;
          box-shadow: 0 8px 24px -10px var(--accent-glow);
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .lp-submit:hover { transform: translateY(-1px); box-shadow: 0 14px 30px -10px var(--accent-glow); }
        .lp-submit:active { transform: translateY(0); }
        .lp-submit:disabled { opacity: .6; cursor: not-allowed; }
        .lp-submit::after {
          content: ""; position: absolute; top: 0; left: -60%;
          width: 45%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
          transform: skewX(-20deg);
          transition: left .6s ease;
        }
        .lp-submit:hover::after { left: 120%; }

        .lp-stagger > * { opacity: 0; transform: translateY(8px); animation: lp-up .55s ease forwards; }
        .lp-stagger > *:nth-child(1) { animation-delay: .35s; }
        .lp-stagger > *:nth-child(2) { animation-delay: .45s; }
        .lp-stagger > *:nth-child(3) { animation-delay: .55s; }
        .lp-stagger > *:nth-child(4) { animation-delay: .65s; }
        .lp-stagger > *:nth-child(5) { animation-delay: .75s; }
        .lp-stagger > *:nth-child(6) { animation-delay: .85s; }
        @keyframes lp-up { to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ANIMATED BACKGROUND */}
      <div className="lp-stage" aria-hidden="true">
        <div className="lp-grid" />

        <div className="lp-rings left">
          <div className="lp-ring" />
          <div className="lp-ring r2" />
          <div className="lp-ring r3" />
          <div className="lp-ring r5" />
        </div>

        <div className="lp-rings">
          <div className="lp-ring" />
          <div className="lp-ring r2" />
          <div className="lp-ring r3" />
          <div className="lp-ring r4" />
          <div className="lp-ring r5" />
          <div className="lp-pulse-dot" />
        </div>

        <div className="lp-scan" />
        <div className="lp-scan s2" />
        <div className="lp-scan s3" />

        <div className="lp-particles" ref={particlesRef} />

        <div className="lp-ecg">
          <svg viewBox="0 0 2400 100" preserveAspectRatio="none">
            <path d="M0,50 L300,50 L320,50 L340,28 L360,72 L380,12 L400,88 L420,50 L700,50 L720,50 L740,36 L760,64 L780,50 L1100,50 L1120,50 L1140,20 L1160,80 L1180,6 L1200,94 L1220,50 L1500,50 L1520,50 L1540,38 L1560,62 L1580,50 L1900,50 L1920,50 L1940,28 L1960,72 L1980,14 L2000,86 L2020,50 L2400,50" />
          </svg>
        </div>
      </div>

      {/* CORNER FRAME */}
      <div className="lp-frame" aria-hidden="true">
        <span className="lp-corner tl" />
        <span className="lp-corner tr" />
        <span className="lp-corner bl" />
        <span className="lp-corner br" />
      </div>

      {/* WRAP + CARD */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', width: '100%', padding: 24,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        <form className="lp-card lp-stagger" onSubmit={handleSubmit} autoComplete="on" noValidate>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
            <div className="lp-brand-mark" aria-hidden="true">
              <LayoutGrid size={18} color="#0e0e12" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>Fitness Admin</span>
          </div>

          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, textAlign: 'center', margin: 0 }}>
            Sign in
          </h2>

          {error && (
            <div style={{
              background: 'rgba(255,77,79,0.12)',
              border: '1px solid rgba(255,77,79,0.25)',
              borderRadius: 8, padding: '8px 12px',
              color: '#ff6b6b', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#8e8e9e', fontSize: 12, fontWeight: 600 }}>Email</label>
            <div className="lp-input-shell">
              <span className="lp-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@fitness.app"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#8e8e9e', fontSize: 12, fontWeight: 600 }}>Password</label>
            <div className="lp-input-shell">
              <span className="lp-input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button type="button" className="lp-eye" aria-label="Show password" onClick={() => setShowPw(v => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {showPw ? (
                    <>
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.77 19.77 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.57 19.57 0 0 1-2.16 3.19" />
                      <path d="M1 1l22 22" />
                      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" className="lp-submit" disabled={loading}>
            {loading ? '...' : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
}
