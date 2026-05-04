
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

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_CREDS = {
  admin: {
    label: 'Admin',
    email: 'admin@demo.edu.pe',
    password: 'password',
  },
  empresa: {
    label: 'Empresa',
    email: 'empresa@demo.pe',
    password: 'password',
  },
  egresado: {
    label: 'Egresado',
    email: 'egresado@demo.pe',
    password: 'password',
  },
} as const;

const STATS = [
  { Icon: GraduationCap, label: 'Egresados', target: 1200 },
  { Icon: Building2, label: 'Empresas', target: 85 },
  { Icon: ShieldCheck, label: 'Empleados', target: 340 },
];

function useCountUp(target: number, duration = 1400) {
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

    const timeout = setTimeout(() => requestAnimationFrame(step), 250);

    return () => clearTimeout(timeout);
  }, [target, duration]);

  return value;
}

function StatCard({
  Icon,
  label,
  target,
}: {
  Icon: typeof GraduationCap;
  label: string;
  target: number;
}) {
  const value = useCountUp(target);

  return (
    <div className="stat-card">
      <Icon className="stat-icon" />
      <span className="stat-num">{value.toLocaleString()}+</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

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

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      o: Math.random() * 0.32 + 0.05,
    }));

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.o})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

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

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [isDark, setIsDark] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const fillDemo = (role: keyof typeof DEMO_CREDS) => {
    setError('');

    const creds = DEMO_CREDS[role];

    setValue('email', creds.email, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue('password', creds.password, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .theme-dark {
          --bg-page: #090B10;
          --bg-right: #0E1018;
          --bg-input: #141720;
          --bg-input-focus: #1A1F2E;
          --bg-stat: rgba(255,255,255,0.04);
          --bg-demo: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --border-focus: #C9A84C;
          --accent: #C9A84C;
          --accent-light: #E8CC7A;
          --accent-dim: rgba(201,168,76,0.14);
          --text-primary: #F0ECE4;
          --text-muted: #8B8D99;
          --danger: #FF6B6B;
          --left-grad: linear-gradient(145deg,#0A0D16 0%,#121830 50%,#0D1020 100%);
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
          --bg-page: #EEF2F8;
          --bg-right: #FFFFFF;
          --bg-input: #F4F6FA;
          --bg-input-focus: #FFFFFF;
          --bg-stat: rgba(255,255,255,0.14);
          --bg-demo: rgba(37,99,235,0.04);
          --border: rgba(15,23,42,0.10);
          --border-focus: #2563EB;
          --accent: #2563EB;
          --accent-light: #60A5FA;
          --accent-dim: rgba(37,99,235,0.10);
          --text-primary: #1A1F2E;
          --text-muted: #6B7280;
          --danger: #DC2626;
          --left-grad: linear-gradient(145deg,#1E3A5F 0%,#2563EB 55%,#1D4ED8 100%);
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

        .login-page {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-page);
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          transition: background 0.4s;
        }

        .login-card {
          width: 100%;
          max-width: 1040px;
          height: min(630px, calc(100dvh - 28px));
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 28px 70px var(--shadow-panel);
          border: 1px solid var(--border);
        }

        .left-panel {
          background: var(--left-grad);
          padding: 34px 38px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .particle-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .left-glow1 {
          position: absolute;
          top: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--glow1) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-glow2 {
          position: absolute;
          bottom: -70px;
          right: -70px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--glow2) 0%, transparent 70%);
          pointer-events: none;
        }

        .left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .left-logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }

        .left-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: #FFFFFF;
          flex: 1;
        }

        .theme-toggle {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s;
          color: rgba(255,255,255,0.80);
        }

        .theme-toggle:hover {
          background: rgba(255,255,255,0.20);
          transform: scale(1.05);
        }

        .left-hero {
          position: relative;
          z-index: 1;
          margin: 26px 0;
        }

        .left-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--accent-light);
          margin-bottom: 16px;
        }

        .left-eyebrow::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--accent-light);
        }

        .left-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(32px, 3.4vw, 46px);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -1.5px;
          color: #FFFFFF;
          margin-bottom: 14px;
        }

        .left-title span {
          color: var(--accent-light);
        }

        .left-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.62);
          line-height: 1.65;
          max-width: 330px;
          font-weight: 300;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          color: #4ADE80;
          font-weight: 500;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          animation: pulse-ring 2s infinite;
        }

        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 9px;
          position: relative;
          z-index: 1;
        }

        .stat-card {
          background: var(--bg-stat);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 15px;
          padding: 12px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(6px);
        }

        .stat-icon {
          width: 17px;
          height: 17px;
          color: rgba(255,255,255,0.45);
        }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--stat-num-color);
        }

        .stat-label {
          font-size: 9px;
          color: rgba(255,255,255,0.48);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .right-panel {
          background: var(--bg-right);
          padding: 32px 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: background 0.4s;
        }

        .mobile-logo {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .mobile-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: var(--accent-dim);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-logo-name {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 17px;
          color: var(--accent);
          flex: 1;
        }

        .mobile-theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.7px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .form-sub {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-bottom: 17px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--divider);
        }

        .divider-text {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .field {
          margin-bottom: 13px;
        }

        .field-label {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          background: var(--bg-input);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 12px 46px;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          -webkit-appearance: none;
        }

        .field-input::placeholder {
          color: rgba(128,128,128,0.5);
        }

        .field-input:focus {
          border-color: var(--border-focus);
          background: var(--bg-input-focus);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }

        .field-input.has-error {
          border-color: var(--danger) !important;
        }

        .input-icon-left {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          width: 17px;
          height: 17px;
        }

        .input-wrap:focus-within .input-icon-left {
          color: var(--accent);
        }

        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 2px;
        }

        .pass-toggle:hover {
          color: var(--text-primary);
        }

        .error-msg {
          margin-top: 4px;
          font-size: 11.5px;
          color: var(--danger);
          font-weight: 500;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(220,38,38,0.07);
          border: 1px solid rgba(220,38,38,0.2);
          color: var(--danger);
          font-size: 12.5px;
          margin-bottom: 12px;
        }

        .submit-btn {
          width: 100%;
          padding: 13px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.4px;
          color: #FFFFFF;
          background: var(--btn-grad);
          background-size: 200% auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
          box-shadow: 0 4px 20px var(--shadow-btn);
          position: relative;
          overflow: hidden;
          transition: background-position 0.4s, transform 0.2s, box-shadow 0.3s;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.16) 50%,transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }

        .submit-btn:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 28px var(--shadow-btn);
        }

        .submit-btn:hover::before {
          transform: translateX(100%);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
        }

        .spinner {
          width: 19px;
          height: 19px;
          border: 2.4px solid rgba(255,255,255,0.25);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-footer {
          margin-top: 13px;
          text-align: center;
          font-size: 12.5px;
          color: var(--text-muted);
        }

        .form-footer a {
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
        }

        .form-footer a:hover {
          text-decoration: underline;
        }

        .compact-demo-box {
          margin-top: 13px;
          padding: 10px;
          border-radius: 14px;
          background: var(--bg-demo);
          border: 1px solid var(--border);
        }

        .compact-demo-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .compact-demo-title {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .compact-demo-password {
          font-size: 10.5px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .compact-demo-password strong {
          color: var(--accent);
        }

        .compact-demo-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }

        .compact-demo-item {
          width: 100%;
          min-width: 0;
          border: 1px solid var(--border);
          background: var(--bg-input);
          border-radius: 11px;
          padding: 8px 7px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .compact-demo-item:hover {
          border-color: var(--demo-hover-border);
          background: var(--demo-hover-bg);
          transform: translateY(-1px);
        }

        .compact-demo-role {
          font-size: 11.5px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .compact-demo-email {
          width: 100%;
          font-size: 9.7px;
          color: var(--text-muted);
          font-family: monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 860px) {
          .login-page {
            padding: 10px;
          }

          .login-card {
            max-width: 460px;
            height: auto;
            min-height: calc(100dvh - 20px);
            grid-template-columns: 1fr;
          }

          .left-panel {
            display: none;
          }

          .right-panel {
            padding: 26px 24px;
          }

          .mobile-logo {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            border-radius: 22px;
          }

          .right-panel {
            padding: 22px 18px;
          }

          .form-title {
            font-size: 23px;
          }

          .form-sub {
            margin-bottom: 14px;
          }

          .compact-demo-list {
            grid-template-columns: 1fr;
          }

          .compact-demo-title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 3px;
          }

          .compact-demo-email {
            font-size: 10.5px;
          }
        }

        @media (max-height: 720px) and (min-width: 861px) {
          .login-card {
            height: calc(100dvh - 20px);
          }

          .left-panel {
            padding: 26px 34px;
          }

          .right-panel {
            padding: 24px 34px;
          }

          .left-title {
            font-size: 36px;
          }

          .left-sub {
            font-size: 13px;
            line-height: 1.5;
          }

          .stat-card {
            padding: 9px 6px;
          }

          .stat-num {
            font-size: 17px;
          }

          .form-title {
            font-size: 23px;
          }

          .form-sub {
            margin-bottom: 12px;
          }

          .field {
            margin-bottom: 10px;
          }

          .field-input {
            padding-top: 10.5px;
            padding-bottom: 10.5px;
          }

          .compact-demo-box {
            margin-top: 10px;
          }
        }
      `}</style>

      <div className={`login-page theme-${theme}`}>
        <div className="login-card">
          <div className="left-panel">
            <ParticleCanvas isDark={isDark} />
            <div className="left-glow1" />
            <div className="left-glow2" />

            <div className="left-logo">
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

            <div className="left-hero">
              <div className="left-eyebrow">Plataforma Universitaria</div>

              <h1 className="left-title">
                Conecta tu
                <br />
                <span>talento</span>
                <br />
                al futuro.
              </h1>

              <p className="left-sub">
                La red profesional que une egresados con las mejores oportunidades del país. Tu
                carrera comienza aquí.
              </p>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="live-badge">
                <span className="pulse-dot" />
                Sistema en línea ahora
              </div>

              <div className="stats-grid">
                {STATS.map((s) => (
                  <StatCard key={s.label} Icon={s.Icon} label={s.label} target={s.target} />
                ))}
              </div>
            </div>
          </div>

          <div className="right-panel">
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

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">ingresa manualmente</span>
              <div className="divider-line" />
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <Wifi size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="field">
                <label htmlFor="email" className="field-label">
                  Correo electrónico
                </label>

                <div className="input-wrap">
                  <Mail className="input-icon-left" size={17} />

                  <input
                    id="email"
                    type="email"
                    placeholder="usuario@demo.pe"
                    autoComplete="off"
                    className={`field-input${errors.email ? ' has-error' : ''}`}
                    {...register('email')}
                  />
                </div>

                {errors.email && <p className="error-msg">{errors.email.message}</p>}
              </div>

              <div className="field">
                <label htmlFor="password" className="field-label">
                  Contraseña
                </label>

                <div className="input-wrap">
                  <Lock className="input-icon-left" size={17} />

                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="password"
                    autoComplete="new-password"
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

              <button type="submit" disabled={loading} className="submit-btn">
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
              ¿No tienes cuenta? <a href="/auth/register">Regístrate aquí</a>
            </p>

            <div className="compact-demo-box">
              <div className="compact-demo-title-row">
                <p className="compact-demo-title">Credenciales demo</p>
                <p className="compact-demo-password">
                  Clave: <strong>password</strong>
                </p>
              </div>

              <div className="compact-demo-list">
                {Object.entries(DEMO_CREDS).map(([role, creds]) => (
                  <button
                    key={role}
                    type="button"
                    className="compact-demo-item"
                    onClick={() => fillDemo(role as keyof typeof DEMO_CREDS)}
                    title={`${creds.email} / ${creds.password}`}
                  >
                    <span className="compact-demo-role">{creds.label}</span>
                    <span className="compact-demo-email">{creds.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
