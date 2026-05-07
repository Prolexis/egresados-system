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
  Download,
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
  Brush,
  ReferenceLine,
} from 'recharts';

const COLORS = ['#2563EB', '#EF4444', '#7C3AED', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '14px',
  border: '0.5px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
  fontSize: '13px',
  padding: '12px 16px',
};

// ─────────────────────────────────────────────────────────────
// TIPADO FUERTE (TypeScript)
interface DashboardKpis {
  totalEgresados: number;
  totalEmpresas: number;
  ofertasActivas: number;
  tasaEmpleabilidad: number;
}

interface DashboardGraficas {
  ofertasPorMes: Array<{
    mes: string;
    ofertas: number;
    postulaciones: number;
  }>;
  egresadosPorCarrera: Array<{
    name: string;
    value: number;
  }>;
  topHabilidades: Array<{
    name: string;
    value: number;
  }>;
  contratacionesPorCohorte: Array<{
    anio: string;
    total: number;
    contratados: number;
  }>;
  distribucionEstados: Array<{
    name: string;
    value: number;
  }>;
}

interface DashboardData {
  kpis: DashboardKpis;
  graficas: DashboardGraficas;
}

// ─────────────────────────────────────────────────────────────
// COMPONENTES MEJORADOS
function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
}: {
  title: string;
  value: ReactNode;
  icon: any;
  color: string;
  trend?: string;
  subtitle?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-[var(--color-border)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Glow premium */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl transition-transform duration-700 group-hover:scale-125"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner"
          style={{ background: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {trend && (
          <span
            className="inline-flex items-center gap-1 rounded-3xl px-3 py-1 text-xs font-semibold"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>

      <div className="relative mt-6">
        <div className="text-4xl font-semibold tracking-tighter text-[var(--color-text-primary)]">
          {value ?? <div className="h-10 w-28 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />}
        </div>
        <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
    </article>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  loading,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-[var(--color-bg-subtle)] p-2">
          <BarChart3 className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {loading ? (
        // Skeleton más realista y premium
        <div className="flex h-72 flex-col justify-center rounded-2xl bg-[var(--color-bg-subtle)] p-6">
          <div className="space-y-6">
            <div className="flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 w-8 animate-pulse rounded-3xl bg-white/30" />
              ))}
            </div>
            <div className="h-3 w-full animate-pulse rounded-full bg-white/30" />
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PARA FORMATEAR FECHAS (mucha más robusta)
const formatMonthLabel = (raw: string): string => {
  if (!raw) return 'N/A';
  // Formato ISO 2026-05-01
  if (/^\d{4}-\d{2}/.test(raw)) {
    return new Date(raw + 'T00:00:00').toLocaleString('es-PE', { month: 'short' });
  }
  // Formato con año
  if (/\d{4}/.test(raw)) {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('es-PE', { month: 'short' });
    }
  }
  return raw.split(' ')[0];
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD PRINCIPAL
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await estadisticasApi.admin();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Custom Tooltip para el AreaChart (más impactante)
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle} className="min-w-[220px]">
        <p className="mb-2 text-xs font-medium text-[var(--color-text-muted)]">Mes: {label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex justify-between text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // ── Custom Tooltip para Top Habilidades
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle}>
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-lg font-semibold text-[#2563EB]">{payload[0].value} ofertas</p>
      </div>
    );
  };

  return (
    <main className="space-y-6 animate-fadeIn">
      {/* HERO + ÚLTIMA ACTUALIZACIÓN + EXPORT */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/10" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-52 w-52 rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-400/10" />

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
              <Activity className="h-4 w-4 text-[#10B981]" />
              PANEL INSTITUCIONAL
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-[var(--color-text-primary)]">
              Dashboard Administrativo
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              Vista ejecutiva en tiempo real del ecosistema de egresados, empresas y empleabilidad.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-xs text-[var(--color-text-muted)]">
                Última actualización:
                <span className="ml-1 font-medium text-[var(--color-text-primary)]">
                  {lastUpdated.toLocaleTimeString('es-PE')}
                </span>
              </div>
            )}

            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-3 text-sm font-semibold transition-all hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar datos
            </button>

            <button
              onClick={() => alert('Exportando dashboard a PDF... (funcionalidad lista para implementar)')}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e40a8] hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total egresados"
          subtitle="Registrados en plataforma"
          value={data?.kpis?.totalEgresados}
          icon={Users}
          color="#2563EB"
          trend="+12%"
        />
        <KpiCard
          title="Empresas registradas"
          subtitle="Aliados empleadores"
          value={data?.kpis?.totalEmpresas}
          icon={Building2}
          color="#7C3AED"
          trend="+8%"
        />
        <KpiCard
          title="Ofertas activas"
          subtitle="Vacantes disponibles"
          value={data?.kpis?.ofertasActivas}
          icon={Briefcase}
          color="#EF4444"
          trend="+5%"
        />
        <KpiCard
          title="Tasa de empleabilidad"
          subtitle="Indicador global"
          value={data ? `${data?.kpis?.tasaEmpleabilidad ?? 0}%` : null}
          icon={TrendingUp}
          color="#10B981"
          trend="+3%"
        />
      </section>

      {/* CHARTS ROW 1 – MÁS AVANZADOS */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Evolución mensual – IMPACTANTE */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Evolución mensual"
            subtitle="Ofertas publicadas vs postulaciones recibidas"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={(data?.graficas?.ofertasPorMes || []).map((item) => ({
                  ...item,
                  _label: formatMonthLabel(item.mes),
                }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.35} vertical={false} />
                <XAxis
                  dataKey="_label"
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '13px', paddingTop: '15px' }} />
                <Area
                  type="monotone"
                  dataKey="ofertas"
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="url(#colorOfertas)"
                  name="Ofertas"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
                <Area
                  type="monotone"
                  dataKey="postulaciones"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fill="url(#colorPostulaciones)"
                  name="Postulaciones"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                />
                {/* Brush para zoom interactivo */}
                <Brush dataKey="_label" height={30} stroke="#2563EB" fill="#f8fafc" />
                <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="2 2" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Por carrera – Donut premium con total en centro */}
        <ChartCard title="Distribución por carrera" subtitle="Egresados por especialidad" loading={loading}>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data?.graficas?.egresadosPorCarrera || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={110}
                paddingAngle={4}
                cornerRadius={6}
              >
                {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              {/* Valor total en el centro */}
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--color-text-primary)] text-4xl font-semibold tracking-tighter"
              >
                {data?.kpis?.totalEgresados || 0}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--color-text-muted)] text-sm font-medium"
              >
                TOTAL
              </text>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* CHARTS ROW 2 – Más impactantes */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top habilidades – Barras con gradiente */}
        <ChartCard title="Top 10 habilidades demandadas" subtitle="En ofertas activas" loading={loading}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={data?.graficas?.topHabilidades || []}
              layout="vertical"
              margin={{ left: 20, right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="value"
                radius={[0, 12, 12, 0]}
                barSize={28}
                isAnimationActive
                fill="#2563EB"
                background={{ fill: '#f8fafc', opacity: 0.3 }}
              >
                {/* Gradiente en cada barra */}
                {(data?.graficas?.topHabilidades || []).map((_, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contratación por cohorte – Barras agrupadas más modernas */}
        <ChartCard title="Contratación por cohorte" subtitle="Total vs contratados" loading={loading}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
              <Bar
                dataKey="total"
                fill="#E0E7FF"
                name="Total egresados"
                radius={[6, 6, 0, 0]}
                barSize={22}
              />
              <Bar
                dataKey="contratados"
                fill="#2563EB"
                name="Contratados"
                radius={[6, 6, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ESTADOS DE POSTULACIONES – más visual */}
      {data?.graficas?.distribucionEstados && (
        <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10">
              <CalendarDays className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">Estado actual de postulaciones</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Distribución en tiempo real</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {data.graficas.distribucionEstados.map((d, i) => {
              const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                POSTULADO: { bg: 'rgba(37,99,235,0.08)', text: '#2563EB', border: 'rgba(37,99,235,0.25)' },
                EN_REVISION: { bg: 'rgba(245,158,11,0.08)', text: '#D97706', border: 'rgba(245,158,11,0.25)' },
                ENTREVISTA: { bg: 'rgba(236,72,153,0.08)', text: '#DB2777', border: 'rgba(236,72,153,0.25)' },
                CONTRATADO: { bg: 'rgba(16,185,129,0.08)', text: '#059669', border: 'rgba(16,185,129,0.25)' },
                RECHAZADO: { bg: 'rgba(239,68,68,0.08)', text: '#DC2626', border: 'rgba(239,68,68,0.25)' },
              };
              const c = colorMap[d.name] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };

              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 text-center transition-all hover:scale-105"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <p className="text-5xl font-semibold tracking-tighter" style={{ color: c.text }}>
                    {d.value}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-widest" style={{ color: c.text }}>
                    {d.name.replace('_', ' ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950">
          {error}
          <button onClick={load} className="ml-4 text-sm font-semibold underline">
            Reintentar
          </button>
        </div>
      )}
    </main>
  );
}
