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
  ReferenceLine,
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '14px',
  border: '0.5px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  fontSize: '14px',
  padding: '12px 16px',
};

// Tipado fuerte
interface DashboardKpis {
  totalEgresados: number;
  totalEmpresas: number;
  ofertasActivas: number;
  tasaEmpleabilidad: number;
}

interface DashboardGraficas {
  ofertasPorMes: Array<{ mes: string; ofertas: number; postulaciones: number }>;
  egresadosPorCarrera: Array<{ name: string; value: number }>;
  topHabilidades: Array<{ name: string; value: number }>;
  contratacionesPorCohorte: Array<{ anio: string; total: number; contratados: number }>;
  distribucionEstados: Array<{ name: string; value: number }>;
}

interface DashboardData {
  kpis: DashboardKpis;
  graficas: DashboardGraficas;
}

// Componentes
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
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl transition-transform group-hover:scale-125" style={{ background: color }} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-3xl px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
            <ArrowUpRight className="h-3.5 w-3.5" /> {trend}
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
    <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <div className="rounded-2xl bg-[var(--color-bg-subtle)] p-2">
          <BarChart3 className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
      </div>
      {loading ? (
        <div className="flex h-80 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
          <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

const formatMonthLabel = (raw: string): string => {
  if (!raw) return 'N/A';
  if (/^\d{4}-\d{2}/.test(raw)) {
    return new Date(raw).toLocaleString('es-PE', { month: 'short' });
  }
  return raw.split(' ')[0];
};

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
      setError('No se pudieron cargar los datos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle} className="min-w-[220px]">
        <p className="mb-2 text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Mes: {label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="space-y-6 animate-fadeIn">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
              <Activity className="h-4 w-4 text-[#10B981]" /> PANEL INSTITUCIONAL
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter">Dashboard Administrativo</h1>
            <p className="mt-3 max-w-md text-[15px] text-[var(--color-text-secondary)]">
              Vista ejecutiva en tiempo real del ecosistema de egresados y empleabilidad.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-xs text-[var(--color-text-muted)]">
                Actualizado: <span className="font-medium text-[var(--color-text-primary)]">{lastUpdated.toLocaleTimeString('es-PE')}</span>
              </div>
            )}

            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-3 text-sm font-semibold hover:bg-white disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1e40a8]">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total egresados" subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados} icon={Users} color="#3B82F6" trend="+12%" />
        <KpiCard title="Empresas registradas" subtitle="Aliados empleadores" value={data?.kpis?.totalEmpresas} icon={Building2} color="#8B5CF6" trend="+8%" />
        <KpiCard title="Ofertas activas" subtitle="Vacantes disponibles" value={data?.kpis?.ofertasActivas} icon={Briefcase} color="#EF4444" trend="+5%" />
        <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global" value={data ? `${data.kpis.tasaEmpleabilidad}%` : null} icon={TrendingUp} color="#10B981" trend="+3%" />
      </section>

      {/* GRÁFICOS ROW 1 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* EVOLUCIÓN MENSUAL - CORREGIDO */}
        <div className="lg:col-span-2">
          <ChartCard title="Evolución mensual" subtitle="Ofertas publicadas vs postulaciones recibidas" loading={loading}>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart
                data={(data?.graficas?.ofertasPorMes || []).map((item) => ({
                  ...item,
                  _label: formatMonthLabel(item.mes),
                }))}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="_label" tick={{ fontSize: 13, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 13, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} dx={-8} />
                <Tooltip content={<CustomAreaTooltip />} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />

                <Area
                  type="natural"
                  dataKey="ofertas"
                  stroke="#3B82F6"
                  strokeWidth={3.5}
                  fill="url(#colorOfertas)"
                  name="Ofertas publicadas"
                  dot={{ r: 5, fill: '#fff', stroke: '#3B82F6', strokeWidth: 3 }}
                  activeDot={{ r: 7 }}
                />
                <Area
                  type="natural"
                  dataKey="postulaciones"
                  stroke="#EF4444"
                  strokeWidth={3.5}
                  fill="url(#colorPostulaciones)"
                  name="Postulaciones recibidas"
                  dot={{ r: 5, fill: '#fff', stroke: '#EF4444', strokeWidth: 3 }}
                  activeDot={{ r: 7 }}
                />
                <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="2 2" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* PIE CHART - CORREGIDO */}
        <ChartCard title="Distribución por carrera" subtitle="Egresados por especialidad" loading={loading}>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={data?.graficas?.egresadosPorCarrera || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="48%"
                innerRadius={78}
                outerRadius={115}
                paddingAngle={5}
                cornerRadius={8}
              >
                {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              {/* Total en centro */}
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="text-5xl font-semibold tracking-tighter fill-[var(--color-text-primary)]">
                {data?.kpis?.totalEgresados || 0}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-[var(--color-text-muted)]">
                TOTAL EGRESADOS
              </text>

              <Tooltip
                contentStyle={{ ...tooltipStyle, minWidth: '260px' }}
                formatter={(value: number, name: string) => [`${value} egresados`, name]}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  paddingTop: '25px',
                  lineHeight: '1.8',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Resto de gráficos (mantengo los anteriores mejorados) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top 10 habilidades demandadas" subtitle="En ofertas activas" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left: 20, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={28} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contratación por cohorte" subtitle="Total vs contratados" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="total" fill="#E0E7FF" name="Total egresados" radius={[6, 6, 0, 0]} />
              <Bar dataKey="contratados" fill="#3B82F6" name="Contratados" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Estados de postulaciones */}
      {data?.graficas?.distribucionEstados && (
        <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10">
              <CalendarDays className="h-6 w-6 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Estado actual de postulaciones</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Distribución en tiempo real</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {data.graficas.distribucionEstados.map((d, i) => {
              const colors: Record<string, any> = {
                POSTULADO: { bg: 'rgba(59,130,246,0.08)', text: '#3B82F6' },
                EN_REVISION: { bg: 'rgba(245,158,11,0.08)', text: '#D97706' },
                ENTREVISTA: { bg: 'rgba(236,72,153,0.08)', text: '#DB2777' },
                CONTRATADO: { bg: 'rgba(16,185,129,0.08)', text: '#10B981' },
                RECHAZADO: { bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
              };
              const c = colors[d.name] || { bg: '#f1f5f9', text: '#64748b' };
              return (
                <div key={i} className="rounded-2xl p-6 text-center" style={{ background: c.bg }}>
                  <p className="text-5xl font-semibold" style={{ color: c.text }}>{d.value}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-widest" style={{ color: c.text }}>
                    {d.name.replace('_', ' ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          {error} <button onClick={load} className="underline">Reintentar</button>
        </div>
      )}
    </main>
  );
}
