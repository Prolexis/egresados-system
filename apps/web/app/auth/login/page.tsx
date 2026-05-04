'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  ShieldCheck,
  Sun,
  Moon,
  Wifi,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   TYPES & SCHEMA
───────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_CREDS = {
  admin:    { email: 'admin@demo.edu.pe',  password: 'Admin123*'    },
  empresa:  { email: 'empresa@demo.pe',    password: 'Empresa123*'  },
  egresado: { email: 'egresado@demo.pe',   password: 'Egresado123*' },
} as const;

const STATS = [
  { Icon: GraduationCap, label: 'Egresados',  target: 1200 },
  { Icon: Building2,     label: 'Empresas',   target: 85   },
  { Icon: ShieldCheck,   label: 'Empleados',  target: 340  },
];

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timeout = setTimeout(() => requestAnimationFrame(step), 400);
    return () => clearTimeout(timeout);
  }, [target, duration]);
  return value;
}

function StatCard({ Icon, label, target }: { Icon: typeof GraduationCap; label: string; target: number }) {
  const value = useCountUp(target);
  return (
    <div className="stat-card">
      <Icon className="stat-icon" />
      <span className="stat-num">{value.toLocaleString()}+</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────────── */
function ParticleCanvas({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const color = isDark ? '201,168,76' : '37,99,235';

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.35 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [isDark, setIsDark] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  /* typewriter fill */
  const typeIn = (el: HTMLInputElement, text: string, cb?: () => void) => {
    let i = 0;
    el.value = '';
    const iv = setInterval(() => {
      el.value += text[i++];
      // trigger react-hook-form onChange
      el.dispatchEvent(new Event('input', { bubbles: true }));
      if (i >= text.length) {
        clearInterval(iv);
        if (cb) setTimeout(cb, 80);
      }
    }, 28);
  };

  const fillDemo = (role: keyof typeof DEMO_CREDS) => {
    const c = DEMO_CREDS[role];
    const eEl = document.getElementById('email') as HTMLInputElement;
    const pEl = document.getElementById('password') as HTMLInputElement;
    typeIn(eEl, c.email, () => typeIn(pEl, c.password));
    setValue('email', c.email);
    setValue('password', c.password);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const theme = isDark ? 'dark' : 'light';

  return (
    <>
      {/* ── GLOBAL STYLES ───────────────────────────── */}
      <style>{`
        /* RESET */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* FONTS */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        /* THEME TOKENS */
        .theme-dark {
          --bg-page:     #090B10;
          --bg-left:     #0B0F1A;
          --bg-right:    #0E1018;
          --bg-input:    #141720;
          --bg-input-focus: #1A1F2E;
          --bg-stat:     rgba(255,255,255,0.04);
          --bg-demo:     rgba(255,255,255,0.04);
          --border:      rgba(255,255,255,0.08);
          --border-focus: #C9A84C;
          --accent:      #C9A84C;
          --accent-light: #E8CC7A;
          --accent-dim:  rgba(201,168,76,0.14);
          --text-primary: #F0ECE4;
          --text-muted:  #8B8D99;
          --text-invert: #090B10;
          --danger:      #FF6B6B;
          --success:     #22C55E;
          --left-grad:   linear-gradient(145deg,#0A0D16 0%,#121830 50%,#0D1020 100%);
          --glow1: rgba(201,168,76,0.10);
          --glow2: rgba(99,102,241,0.10);
          --btn-grad: linear-gradient(135deg,#C9A84C 0%,#E8CC7A 50%,#C9A84C 100%);
          --demo-hover-text: #C9A84C;
          --demo-hover-bg: rgba(201,168,76,0.12);
          --demo-hover-border: rgba(201,168,76,0.35);
          --stat-num-color: #C9A84C;
          --divider: rgba(255,255,255,0.07);
          --shadow-btn: rgba(201,168,76,0.28);
          --shadow-panel: rgba(0,0,0,0.55);
        }

        .theme-light {
          --bg-page:     #EEF2F8;
          --bg-left:     #1E3A5F;
          --bg-right:    #FFFFFF;
          --bg-input:    #F4F6FA;
          --bg-input-focus: #FFFFFF;
          --bg-stat:     rgba(255,255,255,0.14);
          --bg-demo:     rgba(255,255,255,0.12);
          --border:      rgba(255,255,255,0.18);
          --border-focus: #2563EB;
          --accent:      #2563EB;
          --accent-light: #60A5FA;
          --accent-dim:  rgba(37,99,235,0.10);
          --text-primary: #1A1F2E;
          --text-muted:  #6B7280;
          --text-invert: #FFFFFF;
          --danger:      #DC2626;
          --success:     #16A34A;
          --left-grad:   linear-gradient(145deg,#1E3A5F 0%,#2563EB 55%,#1D4ED8 100%);
          --glow1: rgba(37,99,235,0.15);
          --glow2: rgba(124,58,237,0.12);
          --btn-grad: linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);
          --demo-hover-text: #2563EB;
          --demo-hover-bg: rgba(37,99,235,0.08);
          --demo-hover-border: rgba(37,99,235,0.35);
          --stat-num-color: #FFFFFF;
          --divider: rgba(0,0,0,0.08);
          --shadow-btn: rgba(37,99,235,0.30);
          --shadow-panel: rgba(0,0,0,0.12);
        }

        /* PAGE LAYOUT */
        .login-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-page);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem;
          transition: background 0.4s;
        }

        /* CARD WRAPPER */
        .login-card {
          width: 100%;
          max-width: 1080px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 32px 80px var(--shadow-panel);
          border: 1px solid var(--border);
          transition: box-shadow 0.4s, border-color 0.4s;
        }

        /* ── LEFT PANEL ─────────────────────────────── */
        .left-panel {
          background: var(--left-grad);
          padding: 52px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 600px;
        }

        .particle-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .left-glow1 {
          position: absolute; top: -80px; left: -80px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, var(--glow1) 0%, transparent 70%);
          pointer-events: none;
        }
        .left-glow2 {
          position: absolute; bottom: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, var(--glow2) 0%, transparent 70%);
          pointer-events: none;
        }

        /* logo row */
        .left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative; z-index: 1;
        }
        .left-logo-icon {
          width: 46px; height: 46px;
          border-radius: 13px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .left-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: -0.4px;
          color: #FFFFFF;
          flex: 1;
        }
        /* theme toggle */
        .theme-toggle {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s;
          color: rgba(255,255,255,0.80);
          flex-shrink: 0;
        }
        .theme-toggle:hover {
          background: rgba(255,255,255,0.20);
          transform: scale(1.05);
        }

        /* hero text */
        .left-hero {
          position: relative; z-index: 1;
        }
        .left-eyebrow {
          display: flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          color: var(--accent-light);
          margin-bottom: 20px;
        }
        .left-eyebrow::before {
          content: '';
          display: block; width: 24px; height: 1px;
          background: var(--accent-light);
          opacity: 0.7;
        }
        .left-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(34px, 3.5vw, 50px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: #FFFFFF;
          margin-bottom: 18px;
        }
        .left-title span { color: var(--accent-light); }
        .left-sub {
          font-size: 14.5px;
          color: rgba(255,255,255,0.62);
          line-height: 1.75;
          max-width: 320px;
          font-weight: 300;
        }

        /* live badge */
        .live-badge {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; color: #4ADE80;
          font-weight: 500;
          margin-bottom: 14px;
          position: relative; z-index: 1;
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22C55E;
          animation: pulse-ring 2s infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(34,197,94,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(34,197,94,0);   }
          100% { box-shadow: 0 0 0 0   rgba(34,197,94,0);   }
        }

        /* stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          position: relative; z-index: 1;
        }
        .stat-card {
          background: var(--bg-stat);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          padding: 16px 10px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          transition: border-color 0.3s, transform 0.3s;
          cursor: default;
          backdrop-filter: blur(6px);
        }
        .stat-card:hover {
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-3px);
        }
        .stat-icon { width: 18px; height: 18px; color: rgba(255,255,255,0.45); }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          color: var(--stat-num-color);
        }
        .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ── RIGHT PANEL ─────────────────────────────── */
        .right-panel {
          background: var(--bg-right);
          padding: 52px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: background 0.4s;
        }

        /* Mobile logo (hidden on desktop) */
        .mobile-logo {
          display: none;
          align-items: center; gap: 10px;
          margin-bottom: 32px;
        }
        .mobile-logo-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: var(--accent-dim);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
        }
        .mobile-logo-name {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 17px; color: var(--accent); flex: 1;
        }
        .mobile-theme-toggle {
          width: 36px; height: 36px; border-radius: 9px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.25s;
          color: var(--text-muted);
        }
        .mobile-theme-toggle:hover { background: var(--accent-dim); color: var(--accent); }

        /* form header */
        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800; letter-spacing: -0.7px;
          color: var(--text-primary);
          margin-bottom: 5px;
          transition: color 0.3s;
        }
        .form-sub {
          font-size: 14px; color: var(--text-muted);
          margin-bottom: 28px;
          transition: color 0.3s;
        }

        /* demo section */
        .demo-label {
          font-size: 10px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 2px;
          color: var(--text-muted); margin-bottom: 10px;
          transition: color 0.3s;
        }
        .demo-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 8px; margin-bottom: 24px;
        }
        .demo-btn {
          padding: 10px 6px; border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          border: 1px solid var(--border);
          background: var(--bg-demo);
          color: var(--text-muted);
          transition: all 0.25s;
        }
        .demo-btn:hover {
          border-color: var(--demo-hover-border);
          color: var(--demo-hover-text);
          background: var(--demo-hover-bg);
          transform: translateY(-2px);
        }
        .demo-btn:active { transform: scale(0.97); }

        /* divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 22px;
        }
        .divider-line { flex: 1; height: 1px; background: var(--divider); transition: background 0.3s; }
        .divider-text {
          font-size: 10px; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 1.5px;
          transition: color 0.3s;
        }

        /* fields */
        .field { margin-bottom: 16px; }
        .field-label {
          display: block; font-size: 11px; font-weight: 500;
          color: var(--text-muted); margin-bottom: 7px;
          text-transform: uppercase; letter-spacing: 1px;
          transition: color 0.3s;
        }
        .input-wrap { position: relative; }
        .field-input {
          width: 100%;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 13px 46px;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s, color 0.3s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: rgba(128,128,128,0.5); }
        .field-input:focus {
          border-color: var(--border-focus);
          background: var(--bg-input-focus);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .field-input.has-error { border-color: var(--danger) !important; }
        .field-input.has-error:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.10); }

        .input-icon-left {
          position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); pointer-events: none;
          transition: color 0.2s; width: 17px; height: 17px;
        }
        .input-wrap:focus-within .input-icon-left { color: var(--accent); }

        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); display: flex; align-items: center;
          transition: color 0.2s; padding: 2px;
        }
        .pass-toggle:hover { color: var(--text-primary); }

        .error-msg {
          margin-top: 5px; font-size: 12px;
          color: var(--danger); font-weight: 500;
        }

        /* error banner */
        .error-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px;
          background: rgba(220,38,38,0.07);
          border: 1px solid rgba(220,38,38,0.2);
          color: var(--danger); font-size: 13px;
          margin-bottom: 14px;
        }

        /* submit button */
        .submit-btn {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.4px;
          color: #FFFFFF;
          background: var(--btn-grad);
          background-size: 200% auto;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 6px;
          box-shadow: 0 4px 20px var(--shadow-btn);
          position: relative; overflow: hidden;
          transition: background-position 0.4s, transform 0.2s, box-shadow 0.3s;
        }
        .submit-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.16) 50%,transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .submit-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px var(--shadow-btn);
        }
        .submit-btn:hover::before { transform: translateX(100%); }
        .submit-btn:active { transform: scale(0.98) translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none !important; }

        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.25);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* footer link */
        .form-footer {
          margin-top: 22px; text-align: center;
          font-size: 13px; color: var(--text-muted);
          transition: color 0.3s;
        }
        .form-footer a {
          color: var(--accent); font-weight: 600; text-decoration: none;
          transition: color 0.2s, text-decoration 0.2s;
        }
        .form-footer a:hover { text-decoration: underline; }

        /* ── RESPONSIVE ─────────────────────────────── */
        @media (max-width: 860px) {
          .login-card {
            grid-template-columns: 1fr;
            max-width: 480px;
          }
          .left-panel {
            padding: 36px 28px 32px;
            min-height: auto;
          }
          .right-panel { padding: 36px 28px 40px; }
          .mobile-logo { display: flex; }
          .left-logo .theme-toggle { display: none; }
        }

        @media (max-width: 480px) {
          .login-page { padding: 1rem 0.5rem; }
          .login-card { border-radius: 20px; }
          .left-panel { padding: 28px 22px 26px; }
          .right-panel { padding: 28px 22px 32px; }
          .stats-grid { gap: 8px; }
          .stat-card { padding: 12px 6px; }
          .stat-num { font-size: 18px; }
          .left-title { font-size: 30px; }
        }
      `}</style>

      <div className={`login-page theme-${theme}`}>
        <div className="login-card">

          {/* ══ LEFT PANEL ══════════════════════════════ */}
          <div className="left-panel">
            <ParticleCanvas isDark={isDark} />
            <div className="left-glow1" />
            <div className="left-glow2" />

            {/* Logo */}
            <div className="left-logo" style={{ position: 'relative', zIndex: 1 }}>
              <div className="left-logo-icon">
                <GraduationCap size={22} color="#FFFFFF" />
              </div>
              <span className="left-logo-name">EgresadosNet</span>
              <button
                className="theme-toggle"
                onClick={() => setIsDark(!isDark)}
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            {/* Hero */}
            <div className="left-hero" style={{ position: 'relative', zIndex: 1, margin: '32px 0' }}>
              <div className="left-eyebrow">Plataforma Universitaria</div>
              <h1 className="left-title">
                Conecta tu<br />
                <span>talento</span><br />
                al futuro.
              </h1>
              <p className="left-sub">
                La red profesional que une egresados con las mejores oportunidades del país. Tu carrera comienza aquí.
              </p>
            </div>

            {/* Stats */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="live-badge">
                <span className="pulse-dot" />
                Sistema en línea ahora
              </div>
              <div className="stats-grid">
                {STATS.map(s => (
                  <StatCard key={s.label} Icon={s.Icon} label={s.label} target={s.target} />
                ))}
              </div>
            </div>
          </div>

          {/* ══ RIGHT PANEL ═════════════════════════════ */}
          <div className="right-panel">

            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="mobile-logo-icon">
                <GraduationCap size={20} color="var(--accent)" />
              </div>
              <span className="mobile-logo-name">EgresadosNet</span>
              <button
                className="mobile-theme-toggle"
                onClick={() => setIsDark(!isDark)}
                aria-label="Cambiar tema"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            <h2 className="form-title">Bienvenido de vuelta</h2>
            <p className="form-sub">Ingresa tus credenciales para continuar</p>

            {/* Demo buttons */}
            <p className="demo-label">Acceso rápido demo</p>
            <div className="demo-grid">
              {([
                { role: 'admin',    label: 'Admin',    Icon: ShieldCheck },
                { role: 'empresa',  label: 'Empresa',  Icon: Building2   },
                { role: 'egresado', label: 'Egresado', Icon: GraduationCap },
              ] as const).map(({ role, label, Icon }) => (
                <button
                  key={role}
                  type="button"
                  className="demo-btn"
                  onClick={() => fillDemo(role)}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">o ingresa manualmente</span>
              <div className="divider-line" />
            </div>

            {/* Error banner */}
            {error && (
              <div className="error-banner" role="alert">
                <Wifi size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div className="field">
                <label htmlFor="email" className="field-label">Correo electrónico</label>
                <div className="input-wrap">
                  <Mail className="input-icon-left" size={17} />
                  <input
                    id="email"
                    type="email"
                    placeholder="usuario@demo.pe"
                    autoComplete="email"
                    className={`field-input${errors.email ? ' has-error' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="error-msg">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="field">
                <label htmlFor="password" className="field-label">Contraseña</label>
                <div className="input-wrap">
                  <Lock className="input-icon-left" size={17} />
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`field-input${errors.password ? ' has-error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="error-msg">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="form-footer">
              ¿No tienes cuenta?{' '}
              <a href="/auth/register">Regístrate aquí</a>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
