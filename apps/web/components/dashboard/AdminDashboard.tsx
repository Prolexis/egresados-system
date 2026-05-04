'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  RefreshCw,
  Activity,
  CalendarDays,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────────────────
   PALETA DE ACENTOS — igual en ambos modos (vibrantes sobre cualquier fondo)
   Los tokens de fondo/texto/borde cambian por CSS variables (ver globalCSS).
───────────────────────────────────────────────────────────────────────────── */
const A = {
  cyan:   '#00c9a7',
  violet: '#7c3aed',
  rose:   '#e11d48',
  amber:  '#d97706',
  lime:   '#16a34a',
  blue:   '#2563eb',
} as const;

const CHART_COLORS = [A.cyan, A.violet, A.rose, A.amber, A.lime, A.blue];

/* ─────────────────────────────────────────────────────────────────────────────
   CSS GLOBAL — variables que cambian con el tema + keyframes + clases helper
   Se usan var(--dr-*) en todos los estilos inline del componente.
───────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

/* ── Variables LIGHT (default) ── */
:root {
  --dr-bg:        #f4f5fb;
  --dr-surface:   #ffffff;
  --dr-card:      #ffffff;
  --dr-card2:     #f9faff;
  --dr-border:    rgba(0,0,0,0.07);
  --dr-borderH:   rgba(0,0,0,0.14);
  --dr-text:      #0f0f1a;
  --dr-sub:       rgba(15,15,26,0.55);
  --dr-muted:     rgba(15,15,26,0.38);
  --dr-shadow:    0 4px 24px rgba(0,0,0,0.07);
  --dr-shadowH:   0 12px 40px rgba(0,0,0,0.13);
  --dr-grid:      rgba(0,0,0,0.06);
  --dr-sk1:       rgba(0,0,0,0.04);
  --dr-sk2:       rgba(0,0,0,0.09);
  --dr-header-bg: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
  --dr-header-line: rgba(124,58,237,0.25);
  --dr-badge-bg:  rgba(0,201,167,0.10);
  --dr-badge-border: rgba(0,201,167,0.30);
  --dr-badge-text: #047857;
}

/* ── Variables DARK ── */
.dark,
[data-theme="dark"] {
  --dr-bg:        #07070f;
  --dr-surface:   #0e0e1e;
  --dr-card:      #12122a;
  --dr-card2:     #14142e;
  --dr-border:    rgba(255,255,255,0.06);
  --dr-borderH:   rgba(255,255,255,0.13);
  --dr-text:      #eeeeff;
  --dr-sub:       rgba(255,255,255,0.50);
  --dr-muted:     rgba(255,255,255,0.30);
  --dr-shadow:    0 4px 24px rgba(0,0,0,0.40);
  --dr-shadowH:   0 16px 48px rgba(0,0,0,0.65);
  --dr-grid:      rgba(255,255,255,0.05);
  --dr-sk1:       rgba(255,255,255,0.03);
  --dr-sk2:       rgba(255,255,255,0.08);
  --dr-header-bg: linear-gradient(135deg, rgba(14,14,30,0.95) 0%, rgba(18,18,42,0.98) 100%);
  --dr-header-line: rgba(124,58,237,0.50);
  --dr-badge-bg:  rgba(0,201,167,0.08);
  --dr-badge-border: rgba(0,201,167,0.22);
  --dr-badge-text: #00c9a7;
}

/* También responde a prefers-color-scheme cuando no hay clase .dark */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not([data-theme="light"]) {
    --dr-bg:        #07070f;
    --dr-surface:   #0e0e1e;
    --dr-card:      #12122a;
    --dr-card2:     #14142e;
    --dr-border:    rgba(255,255,255,0.06);
    --dr-borderH:   rgba(255,255,255,0.13);
    --dr-text:      #eeeeff;
    --dr-sub:       rgba(255,255,255,0.50);
    --dr-muted:     rgba(255,255,255,0.30);
    --dr-shadow:    0 4px 24px rgba(0,0,0,0.40);
    --dr-shadowH:   0 16px 48px rgba(0,0,0,0.65);
    --dr-grid:      rgba(255,255,255,0.05);
    --dr-sk1:       rgba(255,255,255,0.03);
    --dr-sk2:       rgba(255,255,255,0.08);
    --dr-header-bg: linear-gradient(135deg, rgba(14,14,30,0.95) 0%, rgba(18,18,42,0.98) 100%);
    --dr-header-line: rgba(124,58,237,0.50);
    --dr-badge-bg:  rgba(0,201,167,0.08);
    --dr-badge-border: rgba(0,201,167,0.22);
    --dr-badge-text: #00c9a7;
  }
}

/* ── Fuentes ── */
.dr-root { font-family: 'DM Sans', system-ui, sans-serif; }
.dr-root h1, .dr-root h2, .dr-root h3 { font-family: 'Syne', system-ui, sans-serif; }

/* ── Keyframes ── */
@keyframes dr-fu  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes dr-sh  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes dr-pr  { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }
@keyframes dr-sp  { to{transform:rotate(360deg)} }

/* ── Cards ── */
.dr-kpi {
  position: relative; overflow: hidden; border-radius: 22px;
  border: 1px solid var(--dr-border);
  background: var(--dr-card);
  padding: 24px;
  box-shadow: var(--dr-shadow);
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  animation: dr-fu .5s ease both;
}
.dr-kpi:hover {
  transform: translateY(-4px);
  border-color: var(--dr-borderH);
  box-shadow: var(--dr-shadowH);
}

.dr-chart {
  border-radius: 22px;
  border: 1px solid var(--dr-border);
  background: var(--dr-card);
  padding: 26px;
  box-shadow: var(--dr-shadow);
  transition: border-color .25s ease;
}
.dr-chart:hover { border-color: var(--dr-borderH); }

/* ── Skeleton ── */
.dr-sk {
  border-radius: 12px;
  background: linear-gradient(90deg, var(--dr-sk1) 25%, var(--dr-sk2) 50%, var(--dr-sk1) 75%);
  background-size: 200% 100%;
  animation: dr-sh 1.8s ease infinite;
}

/* ── Status pills ── */
.dr-pill {
  border-radius: 16px; padding: 18px 14px; text-align: center;
  border-width: 1px; border-style: solid;
  transition: transform .2s ease, box-shadow .2s ease;
  cursor: default;
}
.dr-pill:hover { transform: translateY(-3px); box-shadow: var(--dr-shadowH); }

/* ── Botón ── */
.dr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 12px;
  background: rgba(124,58,237,0.10);
  border: 1px solid rgba(124,58,237,0.28);
  color: ${A.violet}; font-size: 13px; font-weight: 700;
  cursor: pointer; letter-spacing: .02em;
  transition: background .2s, transform .2s, box-shadow .2s;
  font-family: 'DM Sans', system-ui, sans-serif;
}
.dr-btn:hover  { background: rgba(124,58,237,0.20); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.20); }
.dr-btn:active { transform: translateY(0); }
.dr-btn:disabled { opacity: .6; cursor: not-allowed; }

/* ── Icon box helper ── */
.dr-icon-box {
  display: flex; align-items: center; justify-content: center;
  border-radius: 13px; flex-shrink: 0;
}
`;

/* ─────────────────────────────────────────────────────────────────────────────
   TOOLTIP personalizado de Recharts — usa CSS vars para tema automático
───────────────────────────────────────────────────────────────────────────── */
function DrTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--dr-card)',
      border: '1px solid var(--dr-borderH)',
      borderRadius: 14,
      padding: '10px 16px',
      boxShadow: 'var(--dr-shadowH)',
      fontSize: 12,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: 'var(--dr-text)',
    }}>
      <p style={{ color: 'var(--dr-muted)', fontSize: 10, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: '3px 0', fontWeight: 600 }}>
          <span style={{ color: p.color }}>{p.name}:</span>{' '}
          <span style={{ color: 'var(--dr-text)' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   KpiCard
───────────────────────────────────────────────────────────────────────────── */
function KpiCard({
  title, value, icon: Icon, color, trend, subtitle,
}: {
  title: string; value: ReactNode; icon: any;
  color: string; trend?: string; subtitle?: string;
}) {
  return (
    <article className="dr-kpi">
      {/* glow blob — sutil en light, más visible en dark */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: color, filter: 'blur(36px)',
        opacity: 0, /* controlado por CSS var trick vía el card */
        animation: 'dr-pr 5s ease infinite',
        pointerEvents: 'none',
        /* truco: usamos box-shadow sobre el pseudo-elemento vía class */
      }} className="dr-kpi-blob" />

      <style>{`
        .dr-kpi-blob { opacity: .08; }
        .dark .dr-kpi-blob,
        [data-theme="dark"] .dr-kpi-blob { opacity: .14; }
        @media (prefers-color-scheme: dark) {
          :root:not(.light) .dr-kpi-blob { opacity: .14; }
        }
      `}</style>

      {/* header de card */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="dr-icon-box" style={{
          width: 48, height: 48,
          background: `${color}15`,
          border: `1px solid ${color}30`,
        }}>
          <Icon style={{ width: 22, height: 22, color }} />
        </div>

        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            borderRadius: 99, padding: '5px 10px',
            background: `${A.lime}14`,
            border: `1px solid ${A.lime}30`,
            fontSize: 11, fontWeight: 800, color: A.lime,
            letterSpacing: '.03em',
          }}>
            <ArrowUpRight style={{ width: 12, height: 12 }} />
            {trend}
          </span>
        )}
      </div>

      {/* valor */}
      <div style={{ position: 'relative' }}>
        <div style={{
          fontSize: 34, fontWeight: 900,
          color: 'var(--dr-text)',
          letterSpacing: '-0.04em', lineHeight: 1,
          fontFamily: 'Syne, system-ui, sans-serif',
        }}>
          {value ?? (
            <div className="dr-sk" style={{ height: 34, width: 90 }} />
          )}
        </div>
        <p style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--dr-sub)' }}>{title}</p>
        {subtitle && (
          <p style={{ marginTop: 3, fontSize: 11, color: 'var(--dr-muted)', letterSpacing: '.02em' }}>{subtitle}</p>
        )}
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ChartCard
───────────────────────────────────────────────────────────────────────────── */
function ChartCard({
  title, subtitle, children, loading,
}: {
  title: string; subtitle?: string; children: ReactNode; loading?: boolean;
}) {
  return (
    <section className="dr-chart">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--dr-text)', margin: 0, letterSpacing: '-0.03em' }}>{title}</h3>
          {subtitle && (
            <p style={{ fontSize: 11, color: 'var(--dr-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 500 }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="dr-icon-box" style={{
          width: 38, height: 38, flexShrink: 0,
          background: 'var(--dr-card2)',
          border: '1px solid var(--dr-border)',
        }}>
          <BarChart3 style={{ width: 17, height: 17, color: 'var(--dr-muted)' }} />
        </div>
      </div>

      {loading
        ? <div className="dr-sk" style={{ height: 280 }} />
        : children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AdminDashboard — lógica 100% idéntica al original
───────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    estadisticasApi
      .admin()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* colores de estado — mismos valores que el original */
  const statusCfg: Record<string, { bg: string; text: string; border: string }> = {
    POSTULADO:   { bg: `${A.blue}12`,   text: A.blue,   border: `${A.blue}30`   },
    EN_REVISION: { bg: `${A.amber}12`,  text: A.amber,  border: `${A.amber}30`  },
    ENTREVISTA:  { bg: `${A.violet}12`, text: A.violet, border: `${A.violet}30` },
    CONTRATADO:  { bg: `${A.lime}12`,   text: A.lime,   border: `${A.lime}30`   },
    RECHAZADO:   { bg: `${A.rose}12`,   text: A.rose,   border: `${A.rose}30`   },
  };

  /* props reutilizables para Recharts */
  const ax  = { fontSize: 11, fill: 'var(--dr-muted)' } as const;
  const gr  = { stroke: 'var(--dr-grid)', strokeDasharray: '3 3' as const };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <main
        className="dr-root"
        style={{
          minHeight: '100vh',
          background: 'var(--dr-bg)',
          padding: '30px 26px',
          color: 'var(--dr-text)',
          boxSizing: 'border-box',
          /* Mesh sutil encima del fondo — casi invisible en light, visible en dark */
          backgroundImage: `
            radial-gradient(ellipse 65% 40% at 8%  -5%, rgba(0,201,167,0.06)  0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 92% 100%,rgba(124,58,237,0.07) 0%, transparent 55%)
          `,
        }}
      >

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <section style={{
          position: 'relative', overflow: 'hidden', borderRadius: 26,
          border: '1px solid var(--dr-borderH)',
          background: 'var(--dr-header-bg)',
          padding: '34px 38px',
          marginBottom: 26,
          boxShadow: 'var(--dr-shadow)',
          animation: 'dr-fu .5s ease both',
        }}>
          {/* línea de acento superior */}
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: 1,
            background: `linear-gradient(90deg, transparent, var(--dr-header-line), transparent)`,
          }} />
          {/* halo violeta fondo */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 26, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 55% 80% at 82% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)',
          }} />

          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              {/* badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                borderRadius: 99,
                background: 'var(--dr-badge-bg)',
                border: '1px solid var(--dr-badge-border)',
                padding: '5px 13px', marginBottom: 14,
              }}>
                <Activity style={{ width: 13, height: 13, color: 'var(--dr-badge-text)' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--dr-badge-text)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  Panel institucional
                </span>
              </div>

              <h1 style={{
                fontSize: 34, fontWeight: 900, margin: 0,
                letterSpacing: '-0.04em', lineHeight: 1.05,
                color: 'var(--dr-text)',
                /* acento gradient solo en el texto del título */
                background: `linear-gradient(128deg, var(--dr-text) 0%, ${A.violet} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Dashboard Administrativo
              </h1>

              <p style={{ marginTop: 10, fontSize: 13, color: 'var(--dr-sub)', maxWidth: 520, lineHeight: 1.65 }}>
                Vista ejecutiva del sistema de egresados, empresas, ofertas laborales y postulaciones.
              </p>
            </div>

            <button onClick={load} disabled={loading} className="dr-btn">
              <RefreshCw style={{
                width: 14, height: 14,
                animation: loading ? 'dr-sp .8s linear infinite' : 'none',
              }} />
              Actualizar
            </button>
          </div>
        </section>

        {/* ── KPIs ────────────────────────────────────────────────────────── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14, marginBottom: 18,
        }}>
          {([
            { title: 'Total Egresados',       subtitle: 'Registrados en plataforma', value: data?.kpis?.totalEgresados,                            icon: Users,      color: A.cyan,   trend: '+12%' },
            { title: 'Empresas Registradas',  subtitle: 'Aliados empleadores',       value: data?.kpis?.totalEmpresas,                             icon: Building2,  color: A.violet, trend: '+8%'  },
            { title: 'Ofertas Activas',       subtitle: 'Vacantes disponibles',      value: data?.kpis?.ofertasActivas,                            icon: Briefcase,  color: A.rose,   trend: '+5%'  },
            { title: 'Tasa de Empleabilidad', subtitle: 'Indicador global',          value: data ? `${data?.kpis?.tasaEmpleabilidad ?? 0}%` : null, icon: TrendingUp, color: A.lime,   trend: '+3%'  },
          ] as const).map((k, i) => (
            <div key={i} style={{ animationDelay: `${i * .07}s` }}>
              <KpiCard {...k} />
            </div>
          ))}
        </section>

        {/* ── ROW 1 — AreaChart + Donut ───────────────────────────────────── */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1fr 310px', gap: 14,
          marginBottom: 14, animation: 'dr-fu .55s .25s ease both',
        }}>
          <ChartCard title="Evolución Mensual" subtitle="Ofertas publicadas vs postulaciones recibidas" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.graficas?.ofertasPorMes || []}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={A.cyan} stopOpacity={.30} />
                    <stop offset="95%" stopColor={A.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={A.rose} stopOpacity={.28} />
                    <stop offset="95%" stopColor={A.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gr} />
                <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip content={<DrTooltip />} />
                <Legend iconType="circle" iconSize={7}
                  formatter={(v: string) => <span style={{ color: 'var(--dr-sub)', fontSize: 11 }}>{v}</span>} />
                <Area type="monotone" dataKey="ofertas"       stroke={A.cyan} strokeWidth={2.5} dot={false} fillOpacity={1} fill="url(#gC)" name="Ofertas" />
                <Area type="monotone" dataKey="postulaciones" stroke={A.rose} strokeWidth={2.5} dot={false} fillOpacity={1} fill="url(#gR)" name="Postulaciones" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Por Carrera" subtitle="Distribución de egresados" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.graficas?.egresadosPorCarrera || []}
                  dataKey="value" nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={62} outerRadius={95} paddingAngle={4}
                >
                  {(data?.graficas?.egresadosPorCarrera || []).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--dr-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DrTooltip />} />
                <Legend iconType="circle" iconSize={7}
                  formatter={(v: string) => <span style={{ color: 'var(--dr-sub)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ROW 2 — Habilidades + Cohorte ───────────────────────────────── */}
        <section style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
          marginBottom: 14, animation: 'dr-fu .55s .35s ease both',
        }}>
          <ChartCard title="Top Habilidades Demandadas" subtitle="Las 10 más solicitadas en ofertas activas" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left: 20, right: 8 }}>
                <defs>
                  <linearGradient id="gBH" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={A.violet} />
                    <stop offset="100%" stopColor={A.cyan} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gr} horizontal={false} />
                <XAxis type="number"  tick={ax} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--dr-sub)' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip content={<DrTooltip />} />
                <Bar dataKey="value" fill="url(#gBH)" radius={[0, 8, 8, 0]} name="Ofertas" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Contratación por Cohorte" subtitle="Total egresados vs contratados por año" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
                <CartesianGrid {...gr} />
                <XAxis dataKey="anio" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip content={<DrTooltip />} />
                <Legend iconType="circle" iconSize={7}
                  formatter={(v: string) => <span style={{ color: 'var(--dr-sub)', fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="total"       fill={`${A.violet}22`} radius={[8, 8, 0, 0]} name="Total" />
                <Bar dataKey="contratados" fill={A.violet}        radius={[8, 8, 0, 0]} name="Contratados" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ESTADO DE POSTULACIONES ──────────────────────────────────────── */}
        {data?.graficas?.distribucionEstados && (
          <section style={{
            borderRadius: 22, border: '1px solid var(--dr-border)',
            background: 'var(--dr-card)', padding: '26px',
            boxShadow: 'var(--dr-shadow)',
            animation: 'dr-fu .55s .45s ease both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div className="dr-icon-box" style={{
                width: 44, height: 44,
                background: `${A.blue}14`,
                border: `1px solid ${A.blue}28`,
              }}>
                <CalendarDays style={{ width: 20, height: 20, color: A.blue }} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--dr-text)', margin: 0, letterSpacing: '-0.02em' }}>
                  Estado de Postulaciones
                </h3>
                <p style={{ fontSize: 10, color: 'var(--dr-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600 }}>
                  Distribución actual del proceso
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
              {data.graficas.distribucionEstados.map((d: any, i: number) => {
                const cfg = statusCfg[d.name] ?? {
                  bg: 'var(--dr-card2)', text: 'var(--dr-sub)', border: 'var(--dr-border)',
                };
                return (
                  <div key={i} className="dr-pill" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <p style={{
                      fontSize: 30, fontWeight: 900, color: cfg.text,
                      letterSpacing: '-0.04em', margin: 0,
                      fontFamily: 'Syne, system-ui, sans-serif',
                    }}>
                      {d.value}
                    </p>
                    <p style={{
                      fontSize: 9, fontWeight: 800, color: cfg.text, opacity: .75,
                      textTransform: 'uppercase', letterSpacing: '.09em', marginTop: 6,
                    }}>
                      {d.name.replace('_', ' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <p style={{
          textAlign: 'center', marginTop: 30,
          fontSize: 10, color: 'var(--dr-muted)',
          textTransform: 'uppercase', letterSpacing: '.1em',
        }}>
          Sistema de Gestión de Egresados · {new Date().getFullYear()}
        </p>
      </main>
    </>
  );
}
