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
  LineChart,
  Line,
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

/* ─── Design tokens ─────────────────────────────────────────────────────────
   Paleta centralizada. NO modifica ninguna lógica del sistema.              */
const T = {
  bg:      '#07070f',
  surface: '#0e0e1e',
  card:    '#12122a',
  border:  'rgba(255,255,255,0.06)',
  borderH: 'rgba(255,255,255,0.13)',
  text:    '#eeeeff',
  sub:     'rgba(255,255,255,0.5)',
  muted:   'rgba(255,255,255,0.28)',
  cyan:    '#00f5d4',
  violet:  '#9b5de5',
  rose:    '#f72585',
  amber:   '#f9c74f',
  lime:    '#90be6d',
  blue:    '#4361ee',
} as const;

const COLORS = [T.cyan, T.violet, T.rose, T.amber, T.lime, T.blue];

const tooltipStyle: CSSProperties = {
  borderRadius: '14px',
  border: `1px solid ${T.borderH}`,
  backgroundColor: T.card,
  color: T.text,
  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
  fontSize: 12,
  fontFamily: 'inherit',
};

/* ─── Global CSS (tipografía + keyframes + clases utilitarias) ────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

.dr  { font-family:'DM Sans',system-ui,sans-serif; }
.dr h1,.dr h2,.dr h3 { font-family:'Syne',system-ui,sans-serif; }

@keyframes fu  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes sh  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes pr  { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
@keyframes sp  { to{transform:rotate(360deg)} }

.kc {
  position:relative; overflow:hidden; border-radius:24px;
  border:1px solid ${T.border}; background:${T.card}; padding:26px;
  transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;
  animation:fu .5s ease both;
}
.kc:hover { transform:translateY(-4px); border-color:${T.borderH}; box-shadow:0 20px 60px rgba(0,0,0,.5); }

.cc {
  border-radius:24px; border:1px solid ${T.border};
  background:${T.card}; padding:28px;
  transition:border-color .25s;
}
.cc:hover { border-color:${T.borderH}; }

.sk {
  border-radius:14px;
  background:linear-gradient(90deg,rgba(255,255,255,.03) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.03) 75%);
  background-size:200% 100%;
  animation:sh 1.8s ease infinite;
}

.sp-pill {
  border-radius:18px; padding:18px 14px; text-align:center;
  border-width:1px; border-style:solid;
  transition:transform .2s ease,box-shadow .2s ease;
}
.sp-pill:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(0,0,0,.35); }

.rf-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:11px 22px; border-radius:14px;
  background:rgba(155,93,229,.14); border:1px solid rgba(155,93,229,.35);
  color:${T.violet}; font-size:13px; font-weight:700; cursor:pointer;
  letter-spacing:.02em; transition:background .2s,transform .2s;
  font-family:'DM Sans',system-ui,sans-serif;
}
.rf-btn:hover  { background:rgba(155,93,229,.26); transform:translateY(-1px); }
.rf-btn:active { transform:translateY(0); }
.rf-btn:disabled { opacity:.6; cursor:not-allowed; }
`;

/* ─── KpiCard ─────────────────────────────────────────────────────────────── */
function KpiCard({
  title, value, icon: Icon, color, trend, subtitle,
}: {
  title: string; value: ReactNode; icon: any;
  color: string; trend?: string; subtitle?: string;
}) {
  return (
    <article className="kc">
      {/* glow blob */}
      <div style={{
        position:'absolute', top:-36, right:-36, width:110, height:110,
        borderRadius:'50%', background:color, opacity:.13, filter:'blur(32px)',
        pointerEvents:'none', animation:'pr 4s ease infinite',
      }} />

      <div style={{ position:'relative', display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22 }}>
        <div style={{
          width:48, height:48, borderRadius:14,
          background:`${color}18`, border:`1px solid ${color}30`,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Icon style={{ width:22, height:22, color }} />
        </div>
        {trend && (
          <span style={{
            display:'inline-flex', alignItems:'center', gap:4,
            borderRadius:99, background:`${T.lime}16`,
            padding:'5px 10px', fontSize:11, fontWeight:800,
            color:T.lime, border:`1px solid ${T.lime}28`, letterSpacing:'.03em',
          }}>
            <ArrowUpRight style={{ width:12, height:12 }} />
            {trend}
          </span>
        )}
      </div>

      <div style={{ position:'relative' }}>
        <div style={{
          fontSize:34, fontWeight:900, color:T.text,
          letterSpacing:'-0.04em', lineHeight:1,
          fontFamily:'Syne,system-ui,sans-serif',
        }}>
          {value ?? (
            <div style={{
              height:34, width:90, borderRadius:10,
              backgroundImage:'linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.09) 50%,rgba(255,255,255,.04) 75%)',
              backgroundSize:'200% 100%', animation:'sh 1.6s ease infinite',
            }} />
          )}
        </div>
        <p style={{ marginTop:8, fontSize:13, fontWeight:600, color:T.sub }}>{title}</p>
        {subtitle && <p style={{ marginTop:3, fontSize:11, color:T.muted, letterSpacing:'.03em' }}>{subtitle}</p>}
      </div>
    </article>
  );
}

/* ─── ChartCard ───────────────────────────────────────────────────────────── */
function ChartCard({
  title, subtitle, children, loading,
}: {
  title: string; subtitle?: string; children: ReactNode; loading?: boolean;
}) {
  return (
    <section className="cc">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24 }}>
        <div>
          <h3 style={{ fontSize:17, fontWeight:800, color:T.text, margin:0, letterSpacing:'-0.03em' }}>{title}</h3>
          {subtitle && <p style={{ fontSize:11, color:T.muted, marginTop:5, textTransform:'uppercase', letterSpacing:'.07em', fontWeight:500 }}>{subtitle}</p>}
        </div>
        <div style={{
          width:40, height:40, borderRadius:12,
          background:'rgba(255,255,255,0.05)', border:`1px solid ${T.border}`,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}>
          <BarChart3 style={{ width:18, height:18, color:T.muted }} />
        </div>
      </div>
      {loading
        ? <div className="sk" style={{ height:280 }} />
        : children}
    </section>
  );
}

/* ─── AdminDashboard ──────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* lógica idéntica al original */
  const load = () => {
    setLoading(true);
    estadisticasApi
      .admin()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statusCfg: Record<string, { bg:string; text:string; border:string }> = {
    POSTULADO:   { bg:`${T.blue}14`,   text:T.blue,   border:`${T.blue}28`   },
    EN_REVISION: { bg:`${T.amber}12`,  text:T.amber,  border:`${T.amber}28`  },
    ENTREVISTA:  { bg:`${T.violet}12`, text:T.violet, border:`${T.violet}28` },
    CONTRATADO:  { bg:`${T.lime}10`,   text:T.lime,   border:`${T.lime}28`   },
    RECHAZADO:   { bg:`${T.rose}10`,   text:T.rose,   border:`${T.rose}28`   },
  };

  const ax = { fontSize:11, fill:T.muted };
  const gr = { stroke:'rgba(255,255,255,0.05)', strokeDasharray:'3 3' as const };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: G }} />
      <main
        className="dr"
        style={{
          minHeight:'100vh',
          background:`
            radial-gradient(ellipse 70% 40% at 10% -5%,  rgba(0,245,212,.07)  0%, transparent 55%),
            radial-gradient(ellipse 55% 35% at 90% 100%, rgba(155,93,229,.09) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 50%,  rgba(247,37,133,.04) 0%, transparent 60%),
            ${T.bg}
          `,
          padding:'32px 28px', color:T.text, boxSizing:'border-box',
        }}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <section style={{
          position:'relative', overflow:'hidden', borderRadius:28,
          border:`1px solid ${T.borderH}`,
          background:'linear-gradient(135deg,rgba(14,14,30,.9) 0%,rgba(18,18,42,.95) 100%)',
          padding:'36px 40px', marginBottom:28,
          animation:'fu .5s ease both',
        }}>
          <div style={{
            position:'absolute', inset:0, borderRadius:28, pointerEvents:'none',
            background:`radial-gradient(ellipse 60% 80% at 80% 50%, rgba(155,93,229,.12) 0%, transparent 70%)`,
          }} />
          <div style={{
            position:'absolute', top:0, left:40, right:40, height:1,
            background:`linear-gradient(90deg,transparent,${T.violet}60,transparent)`,
          }} />

          <div style={{ position:'relative', display:'flex', flexWrap:'wrap', gap:20, alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                borderRadius:99, border:'1px solid rgba(0,245,212,.25)',
                background:'rgba(0,245,212,.07)', padding:'6px 14px', marginBottom:14,
              }}>
                <Activity style={{ width:13, height:13, color:T.cyan }} />
                <span style={{ fontSize:10, fontWeight:800, color:T.cyan, textTransform:'uppercase', letterSpacing:'.12em' }}>
                  Panel institucional
                </span>
              </div>
              <h1 style={{
                fontSize:36, fontWeight:900, margin:0, letterSpacing:'-0.04em', lineHeight:1.05,
                background:`linear-gradient(130deg,${T.text} 0%,rgba(155,93,229,.9) 100%)`,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>
                Dashboard Administrativo
              </h1>
              <p style={{ marginTop:10, fontSize:13, color:T.sub, maxWidth:520, lineHeight:1.6 }}>
                Vista ejecutiva del sistema de egresados, empresas, ofertas laborales y postulaciones.
              </p>
            </div>

            <button onClick={load} disabled={loading} className="rf-btn">
              <RefreshCw style={{ width:14, height:14, animation: loading ? 'sp .8s linear infinite' : 'none' }} />
              Actualizar
            </button>
          </div>
        </section>

        {/* ── KPIs ──────────────────────────────────────────────────────── */}
        <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:14, marginBottom:18 }}>
          {([
            { title:'Total Egresados',       subtitle:'Registrados en plataforma', value:data?.kpis?.totalEgresados,                            icon:Users,      color:T.cyan,   trend:'+12%' },
            { title:'Empresas Registradas',  subtitle:'Aliados empleadores',       value:data?.kpis?.totalEmpresas,                             icon:Building2,  color:T.violet, trend:'+8%'  },
            { title:'Ofertas Activas',       subtitle:'Vacantes disponibles',      value:data?.kpis?.ofertasActivas,                            icon:Briefcase,  color:T.rose,   trend:'+5%'  },
            { title:'Tasa de Empleabilidad', subtitle:'Indicador global',          value:data ? `${data?.kpis?.tasaEmpleabilidad ?? 0}%` : null, icon:TrendingUp, color:T.lime,   trend:'+3%'  },
          ] as const).map((k, i) => (
            <div key={i} style={{ animationDelay:`${i * .07}s` }}>
              <KpiCard {...k} />
            </div>
          ))}
        </section>

        {/* ── Row 1 ─────────────────────────────────────────────────────── */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:14, marginBottom:14, animation:'fu .55s .25s ease both' }}>
          <ChartCard title="Evolución Mensual" subtitle="Ofertas publicadas vs postulaciones recibidas" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.graficas?.ofertasPorMes || []}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.cyan} stopOpacity={.28} />
                    <stop offset="95%" stopColor={T.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={T.rose} stopOpacity={.28} />
                    <stop offset="95%" stopColor={T.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gr} />
                <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={7} formatter={(v:string) => <span style={{ color:T.sub, fontSize:11 }}>{v}</span>} />
                <Area type="monotone" dataKey="ofertas"       stroke={T.cyan} strokeWidth={2.5} dot={false} fillOpacity={1} fill="url(#gC)" name="Ofertas" />
                <Area type="monotone" dataKey="postulaciones" stroke={T.rose} strokeWidth={2.5} dot={false} fillOpacity={1} fill="url(#gR)" name="Postulaciones" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Por Carrera" subtitle="Distribución de egresados" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data?.graficas?.egresadosPorCarrera || []} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={62} outerRadius={95} paddingAngle={4}>
                  {(data?.graficas?.egresadosPorCarrera || []).map((_:any, i:number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke={T.card} strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={7} formatter={(v:string) => <span style={{ color:T.sub, fontSize:11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Row 2 ─────────────────────────────────────────────────────── */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14, animation:'fu .55s .35s ease both' }}>
          <ChartCard title="Top Habilidades Demandadas" subtitle="Las 10 más solicitadas en ofertas activas" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left:20, right:8 }}>
                <defs>
                  <linearGradient id="gBH" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={T.violet} />
                    <stop offset="100%" stopColor={T.cyan} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gr} horizontal={false} />
                <XAxis type="number"  tick={ax} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:T.sub }} width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="url(#gBH)" radius={[0,8,8,0]} name="Ofertas" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Contratación por Cohorte" subtitle="Total egresados vs contratados por año" loading={loading}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
                <CartesianGrid {...gr} />
                <XAxis dataKey="anio" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={7} formatter={(v:string) => <span style={{ color:T.sub, fontSize:11 }}>{v}</span>} />
                <Bar dataKey="total"       fill={`${T.violet}20`} radius={[8,8,0,0]} name="Total" />
                <Bar dataKey="contratados" fill={T.violet}        radius={[8,8,0,0]} name="Contratados" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Estado de Postulaciones ───────────────────────────────────── */}
        {data?.graficas?.distribucionEstados && (
          <section style={{
            borderRadius:24, border:`1px solid ${T.border}`, background:T.card,
            padding:'28px', animation:'fu .55s .45s ease both',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:22 }}>
              <div style={{
                width:44, height:44, borderRadius:13,
                background:`${T.blue}14`, border:`1px solid ${T.blue}28`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <CalendarDays style={{ width:20, height:20, color:T.blue }} />
              </div>
              <div>
                <h3 style={{ fontSize:17, fontWeight:800, color:T.text, margin:0, letterSpacing:'-0.02em' }}>
                  Estado de Postulaciones
                </h3>
                <p style={{ fontSize:11, color:T.muted, marginTop:3, textTransform:'uppercase', letterSpacing:'.07em', fontWeight:500 }}>
                  Distribución actual del proceso
                </p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12 }}>
              {data.graficas.distribucionEstados.map((d:any, i:number) => {
                const cfg = statusCfg[d.name] ?? { bg:'rgba(255,255,255,.05)', text:T.sub, border:T.border };
                return (
                  <div key={i} className="sp-pill" style={{ background:cfg.bg, borderColor:cfg.border }}>
                    <p style={{ fontSize:30, fontWeight:900, color:cfg.text, letterSpacing:'-0.04em', fontFamily:'Syne,system-ui,sans-serif', margin:0 }}>
                      {d.value}
                    </p>
                    <p style={{ fontSize:9, fontWeight:800, color:cfg.text, opacity:.7, textTransform:'uppercase', letterSpacing:'.09em', marginTop:6 }}>
                      {d.name.replace('_', ' ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p style={{ textAlign:'center', marginTop:32, fontSize:10, color:T.muted, textTransform:'uppercase', letterSpacing:'.1em' }}>
          Sistema de Gestión de Egresados · {new Date().getFullYear()}
        </p>
      </main>
    </>
  );
}
