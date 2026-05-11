'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Users, Building2, Briefcase, TrendingUp, RefreshCw, Activity,
  CalendarDays, ArrowUpRight, BarChart3, Download, Target,
  GraduationCap, Award, Clock, UserCheck,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, AreaChart,
  Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  FunnelChart, Funnel, LabelList, Treemap,
} from 'recharts';

/* ─── Palette ──────────────────────────────────────────────────── */
const COLORS   = ['#2563EB', '#F43F5E', '#7C3AED', '#10B981', '#F59E0B', '#EC4899'];
const AREA_CLR = '#2563EB';

const TT: CSSProperties = {
  borderRadius: '10px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
  fontSize: '12px',
  padding: '9px 14px',
};

/* ─── Types ────────────────────────────────────────────────────── */
interface DashboardData {
  kpis: {
    totalEgresados: number;
    totalEmpresas: number;
    ofertasActivas: number;
    tasaEmpleabilidad: number;
  };
  graficas: {
    ofertasPorMes: Array<{ mes: string; ofertas: number; postulaciones: number }>;
    egresadosPorCarrera: Array<{ name: string; value: number }>;
    topHabilidades: Array<{ name: string; value: number }>;
    contratacionesPorCohorte: Array<{ anio: string; total: number; contratados: number }>;
    distribucionEstados: Array<{ name: string; value: number }>;
  };
}

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmtMes = (raw: string) => {
  if (!raw) return '';
  if (/^\d{4}-\d{2}/.test(raw)) return new Date(raw).toLocaleString('es-PE', { month: 'short' });
  return raw.split(' ')[0];
};

const ax  = 'var(--color-text-muted)';
const gr  = 'var(--color-border)';
const sur = 'var(--color-bg-surface)';
const sub = 'var(--color-bg-subtle)';

/* ─── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ title, value, icon: Icon, color, trend, subtitle }: any) {
  return (
    <article className="kpi-card" style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 14, border: '1px solid var(--color-border)',
      background: sur, padding: '20px 22px',
      transition: 'box-shadow .2s, transform .2s',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        borderRadius: '14px 0 0 14px', background: color, opacity: .75,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        {trend && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,.1)', color: '#10B981', fontSize: 11, fontWeight: 600 }}>
            <ArrowUpRight size={11} />{trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-1px', color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 5 }}>
        {value ?? <div style={{ height: 30, width: 90, background: sub, borderRadius: 6, opacity: .5 }} />}
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 1 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: ax }}>{subtitle}</p>}
    </article>
  );
}

/* ─── Chart Card ───────────────────────────────────────────────── */
function ChartCard({ title, subtitle, children, loading, action }: any) {
  return (
    <section style={{ borderRadius: 14, border: '1px solid var(--color-border)', background: sur, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-.2px', marginBottom: 2 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 11, color: ax }}>{subtitle}</p>}
        </div>
        {action ?? <BarChart3 size={14} color={ax} />}
      </div>
      {loading
        ? <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={20} color={ax} style={{ animation: 'spin 1s linear infinite' }} /></div>
        : children}
    </section>
  );
}

/* ─── Stat Row item ────────────────────────────────────────────── */
function StatItem({ label, value, pct, color }: any) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: sub, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width .6s ease' }} />
      </div>
    </div>
  );
}

/* ─── Custom Treemap content ───────────────────────────────────── */
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, value, index } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={COLORS[index % COLORS.length]} opacity={0.85} />
      {width > 60 && (
        <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>{name}</text>
      )}
      {width > 60 && (
        <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize={10}>{value}</text>
      )}
    </g>
  );
};

/* ─── Dashboard ────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await estadisticasApi.admin();
      setData(res);
      setLastUpdated(new Date());
    } catch (e) { setError('Error al cargar datos'); console.error(e); }
    finally { setLoading(false); }
  };

  const handleExport = () => {
    if (!data) return alert('No hay datos para exportar');
    const blob = new Blob([JSON.stringify({ ...data, exportadoEn: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `dashboard-egresados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    alert('✅ Reporte exportado correctamente');
  };

  useEffect(() => { load(); }, []);

  /* ── Derived datasets ─────────────────────────────────────────── */

  // Tasa de conversión por mes (postulaciones → ofertas)
  const conversionData = (data?.graficas?.ofertasPorMes || []).map(d => ({
    _label : fmtMes(d.mes),
    tasa   : d.ofertas > 0 ? Math.round((d.postulaciones / d.ofertas) * 10) / 10 : 0,
    ofertas: d.ofertas,
    post   : d.postulaciones,
  }));

  // Tasa de empleabilidad por cohorte
  const empleabilidadPct = (data?.graficas?.contratacionesPorCohorte || []).map(d => ({
    anio : d.anio,
    tasa : d.total > 0 ? Math.round((d.contratados / d.total) * 100) : 0,
    total: d.total,
  }));

  // Funnel de postulaciones
  const funnelData = (() => {
    const estados = data?.graficas?.distribucionEstados || [];
    const get = (name: string) => estados.find(e => e.name === name)?.value ?? 0;
    return [
      { name: 'Postulados',   value: get('POSTULADO'),   fill: '#2563EB' },
      { name: 'En revisión',  value: get('EN_REVISION'), fill: '#7C3AED' },
      { name: 'Entrevista',   value: get('ENTREVISTA'),  fill: '#F59E0B' },
      { name: 'Contratados',  value: get('CONTRATADO'),  fill: '#10B981' },
    ].filter(d => d.value > 0);
  })();

  // Radar de habilidades (top 6)
  const radarData = (data?.graficas?.topHabilidades || []).slice(0, 6).map(h => ({
    subject: h.name.length > 12 ? h.name.slice(0, 11) + '…' : h.name,
    value: h.value,
    fullMark: Math.max(...(data?.graficas?.topHabilidades || []).map(x => x.value), 1),
  }));

  // Treemap de carreras
  const treemapData = (data?.graficas?.egresadosPorCarrera || []).map(d => ({
    name: d.name, size: d.value, value: d.value,
  }));

  // Resumen de carrera con barras de progreso
  const carreraMax = Math.max(...(data?.graficas?.egresadosPorCarrera || []).map(d => d.value), 1);

  /* Estado config */
  const STATE: Record<string, { color: string; label: string }> = {
    POSTULADO  : { color: '#2563EB', label: 'Postulado'   },
    EN_REVISION: { color: '#D97706', label: 'En revisión' },
    ENTREVISTA : { color: '#DB2777', label: 'Entrevista'  },
    CONTRATADO : { color: '#059669', label: 'Contratado'  },
    RECHAZADO  : { color: '#DC2626', label: 'Rechazado'   },
  };

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .kpi-card:hover    { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
        .dr  { animation: fadeUp .35s ease both; }
        .dr:nth-child(2)  { animation-delay:.06s }
        .dr:nth-child(3)  { animation-delay:.12s }
        .dr:nth-child(4)  { animation-delay:.18s }
        .dr:nth-child(5)  { animation-delay:.24s }
        .dr:nth-child(6)  { animation-delay:.30s }
        .dr:nth-child(7)  { animation-delay:.36s }
        .dr:nth-child(8)  { animation-delay:.42s }
        .dr:nth-child(9)  { animation-delay:.48s }
      `}</style>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="dr" style={{ borderRadius: 14, border: '1px solid var(--color-border)', background: sur, padding: '22px 26px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, border: '1px solid var(--color-border)', background: sub, marginBottom: 10 }}>
                <Activity size={10} color="#10B981" />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: ax }}>Panel Institucional</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px', color: 'var(--color-text-primary)', marginBottom: 4, lineHeight: 1.1 }}>
                Dashboard Administrativo
              </h1>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Vista ejecutiva del sistema de egresados y empleabilidad</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {lastUpdated && <p style={{ fontSize: 11, color: ax }}>{lastUpdated.toLocaleTimeString('es-PE')}</p>}
              <button onClick={load} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: sub, color: 'var(--color-text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                <RefreshCw size={12} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Actualizar
              </button>
              <button onClick={handleExport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #1d4ed8', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <Download size={12} /> Exportar Reporte
              </button>
            </div>
          </div>
        </section>

        {/* ── KPIs ──────────────────────────────────────────────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          <KpiCard title="Total egresados"       subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados}                      icon={Users}      color="#2563EB" trend="+12%" />
          <KpiCard title="Empresas registradas"  subtitle="Aliados empleadores"        value={data?.kpis?.totalEmpresas}                       icon={Building2}  color="#7C3AED" trend="+8%"  />
          <KpiCard title="Ofertas activas"       subtitle="Vacantes disponibles"       value={data?.kpis?.ofertasActivas}                      icon={Briefcase}  color="#F43F5E" trend="+5%"  />
          <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global"           value={data ? `${data.kpis.tasaEmpleabilidad}%` : null} icon={TrendingUp} color="#10B981" trend="+3%"  />
        </section>

        {/* ── ROW 1: Area acumulada + Pie carrera ──────────────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>

          <ChartCard title="Evolución mensual" subtitle="Ofertas vs Postulaciones acumuladas">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={(data?.graficas?.ofertasPorMes || []).map(d => ({ ...d, _label: fmtMes(d.mes) }))}>
                <defs>
                  <linearGradient id="gOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={.18} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gPost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F43F5E" stopOpacity={.14} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gr} vertical={false} />
                <XAxis dataKey="_label" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} cursor={{ stroke: gr }} />
                <Legend wrapperStyle={{ fontSize: 11, color: ax, paddingTop: 10 }} iconType="circle" />
                <Area type="monotone" dataKey="ofertas"       stroke="#2563EB" strokeWidth={2} fill="url(#gOfertas)" name="Ofertas"       />
                <Area type="monotone" dataKey="postulaciones" stroke="#F43F5E" strokeWidth={2} fill="url(#gPost)"    name="Postulaciones" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Por carrera" subtitle="Distribución de egresados">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data?.graficas?.egresadosPorCarrera || []} cx="50%" cy="42%" innerRadius={70} outerRadius={105} paddingAngle={4} cornerRadius={5} dataKey="value" nameKey="name">
                  {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <text x="50%" y="38%" textAnchor="middle" dominantBaseline="middle" fill="var(--color-text-primary)" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-1px' }}>
                  {data?.kpis?.totalEgresados || 0}
                </text>
                <text x="50%" y="51%" textAnchor="middle" dominantBaseline="middle" fill={ax} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.08em' }}>
                  TOTAL
                </text>
                <Tooltip contentStyle={TT} formatter={(v: number, n: string) => [`${v} egresados`, n]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: ax, paddingTop: 14, lineHeight: 1.9 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ROW 2: Cohorte + Tasa de conversión ──────────────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartCard title="Empleabilidad por cohorte" subtitle="Egresados totales vs contratados por año">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={data?.graficas?.contratacionesPorCohorte || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gr} vertical={false} />
                <XAxis dataKey="anio" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} cursor={{ fill: sub }} />
                <Legend wrapperStyle={{ fontSize: 11, color: ax, paddingTop: 10 }} iconType="circle" />
                <Bar dataKey="total"       fill={sub}      name="Total"      radius={[4,4,0,0]} stroke={gr} strokeWidth={1} />
                <Bar dataKey="contratados" fill="#10B981"  name="Contratados" radius={[4,4,0,0]} opacity={.9} />
                <Line type="natural" dataKey="contratados" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', stroke: sur, strokeWidth: 2 }} legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Tasa de empleabilidad por cohorte" subtitle="Porcentaje contratados / total egresados">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={empleabilidadPct}>
                <CartesianGrid strokeDasharray="3 3" stroke={gr} vertical={false} />
                <XAxis dataKey="anio" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={TT} cursor={{ fill: sub }} formatter={(v: number) => [`${v}%`, 'Empleabilidad']} />
                <Bar dataKey="tasa" fill="#7C3AED" radius={[5,5,0,0]} barSize={36} opacity={.88} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ROW 3: Tasa de conversión + Radar habilidades ────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartCard title="Postulaciones por oferta" subtitle="Promedio de postulaciones recibidas por oferta publicada">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gr} vertical={false} />
                <XAxis dataKey="_label" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} cursor={{ fill: sub }} />
                <Legend wrapperStyle={{ fontSize: 11, color: ax, paddingTop: 10 }} iconType="circle" />
                <Bar     yAxisId="left"  dataKey="ofertas" fill="#2563EB" radius={[4,4,0,0]} barSize={28} opacity={.8} name="Ofertas" />
                <Line   yAxisId="right" type="monotone" dataKey="tasa" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B', stroke: sur, strokeWidth: 2 }} name="Post/Oferta" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Radar de habilidades" subtitle="Top 6 habilidades más demandadas">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke={gr} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: ax, fontSize: 11 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="Demanda" dataKey="value" stroke="#2563EB" fill="#2563EB" fillOpacity={0.18} strokeWidth={2} />
                <Tooltip contentStyle={TT} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ROW 4: Top habilidades + Treemap carreras ────────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartCard title="Top habilidades demandadas" subtitle="Más solicitadas en ofertas activas">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data?.graficas?.topHabilidades?.slice(0, 8) || []} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke={gr} horizontal={false} />
                <XAxis type="number" tick={{ fill: ax, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} width={148} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} cursor={{ fill: sub }} />
                <Bar dataKey="value" fill="#2563EB" radius={[0,6,6,0]} barSize={20} opacity={.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Peso por carrera" subtitle="Proporción de egresados por especialidad">
            <ResponsiveContainer width="100%" height={260}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                content={<TreemapContent />}
              />
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ROW 5: Funnel + Carrera barra progreso ───────────── */}
        <section className="dr" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartCard title="Embudo de selección" subtitle="Flujo de candidatos a lo largo del proceso">
            <ResponsiveContainer width="100%" height={260}>
              <FunnelChart>
                <Tooltip contentStyle={TT} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="center" fill="#fff" fontSize={12} fontWeight={600}
                    formatter={(v: any, entry: any) => `${entry?.name ?? ''} · ${v}`} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Egresados por carrera" subtitle="Comparativo de volumen por especialidad">
            <div style={{ paddingTop: 6 }}>
              {(data?.graficas?.egresadosPorCarrera || []).map((d, i) => (
                <StatItem
                  key={i}
                  label={d.name}
                  value={d.value}
                  pct={Math.round((d.value / carreraMax) * 100)}
                  color={COLORS[i % COLORS.length]}
                />
              ))}
            </div>
          </ChartCard>
        </section>

        {/* ── ROW 6: Estado de postulaciones ───────────────────── */}
        {data?.graficas?.distribucionEstados && (
          <section className="dr" style={{ borderRadius: 14, border: '1px solid var(--color-border)', background: sur, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(37,99,235,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={15} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>Estado de postulaciones</h3>
                <p style={{ fontSize: 11, color: ax }}>Distribución actual del proceso</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {data.graficas.distribucionEstados.map((d: any, i: number) => {
                const s = STATE[d.name] || { color: 'var(--color-text-secondary)', label: d.name.replace('_', ' ') };
                return (
                  <div key={i} style={{ borderRadius: 10, border: '1px solid var(--color-border)', background: sub, padding: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, color: s.color, letterSpacing: '-1px', marginBottom: 6 }}>{d.value}</p>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: `${s.color}12`, fontSize: 10, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p style={{ textAlign: 'center', padding: 18, borderRadius: 10, color: '#DC2626', background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.14)', fontSize: 13 }}>
            {error}
          </p>
        )}
      </main>
    </>
  );
}
