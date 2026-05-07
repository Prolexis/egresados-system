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
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  ReferenceLine,
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '16px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  fontSize: '14px',
  padding: '12px 18px',
};

// Tipado
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
function KpiCard({ title, value, icon: Icon, color, trend, subtitle }: any) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl" style={{ background: color }} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" />{trend}
          </span>
        )}
      </div>
      <div className="mt-6">
        <div className="text-4xl font-semibold tracking-tighter text-white">
          {value ?? <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />}
        </div>
        <p className="mt-1 text-sm text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </article>
  );
}

function ChartCard({ title, subtitle, children, loading }: any) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        <BarChart3 className="h-5 w-5 text-gray-500" />
      </div>
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

const formatMonthLabel = (raw: string) => {
  if (!raw) return '';
  if (/^\d{4}-\d{2}/.test(raw)) return new Date(raw).toLocaleString('es-PE', { month: 'short' });
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
      const res = await estadisticasApi.admin();
      setData(res);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Error al cargar datos');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="space-y-6 p-2">
      {/* Hero */}
      <section className="relative rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-3xl text-xs uppercase tracking-widest mb-4">
              <Activity className="h-4 w-4 text-emerald-400" /> PANEL INSTITUCIONAL
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">Dashboard Administrativo</h1>
            <p className="mt-3 text-gray-400 max-w-md">Vista ejecutiva del sistema de egresados y empleabilidad</p>
          </div>

          <div className="flex gap-3">
            {lastUpdated && <p className="text-sm text-gray-400 self-end">Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}</p>}
            <button onClick={load} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-medium">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-medium text-white">
              <Download className="h-4 w-4" /> Exportar
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard title="Total egresados" subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados} icon={Users} color="#3B82F6" trend="+12%" />
        <KpiCard title="Empresas registradas" subtitle="Aliados empleadores" value={data?.kpis?.totalEmpresas} icon={Building2} color="#8B5CF6" trend="+8%" />
        <KpiCard title="Ofertas activas" subtitle="Vacantes disponibles" value={data?.kpis?.ofertasActivas} icon={Briefcase} color="#EF4444" trend="+5%" />
        <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global" value={data ? `${data.kpis.tasaEmpleabilidad}%` : null} icon={TrendingUp} color="#10B981" trend="+3%" />
      </section>

      {/* Gráficos principales */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === EVOLUCIÓN MENSUAL - NUEVO Y MÁS BONITO === */}
        <div className="lg:col-span-2">
          <ChartCard title="Evolución mensual" subtitle="Ofertas vs Postulaciones" loading={loading}>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart
                data={(data?.graficas?.ofertasPorMes || []).map(item => ({
                  ...item,
                  _label: formatMonthLabel(item.mes),
                }))}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="_label" tick={{ fill: '#9CA3AF', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 13 }} axisLine={false} tickLine={false} />

                <Tooltip contentStyle={tooltipStyle} />

                <Legend wrapperStyle={{ paddingTop: 20 }} />

                {/* Barras suaves */}
                <Bar dataKey="ofertas" fill="#3B82F6" name="Ofertas publicadas" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="postulaciones" fill="#EF4444" name="Postulaciones recibidas" radius={[6, 6, 0, 0]} barSize={32} />

                {/* Líneas para tendencia */}
                <Line type="natural" dataKey="ofertas" stroke="#60A5FA" strokeWidth={3} dot={{ r: 5, fill: '#1E40AF' }} />
                <Line type="natural" dataKey="postulaciones" stroke="#F87171" strokeWidth={3} dot={{ r: 5, fill: '#991B1B' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* === PIE CHART MEJORADO === */}
        <ChartCard title="Distribución por carrera" subtitle="Egresados por especialidad" loading={loading}>
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={data?.graficas?.egresadosPorCarrera || []}
                cx="50%"
                cy="48%"
                innerRadius={85}
                outerRadius={125}
                paddingAngle={6}
                cornerRadius={10}
                dataKey="value"
                nameKey="name"
              >
                {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="text-5xl font-bold fill-white tracking-tighter">
                {data?.kpis?.totalEgresados || 0}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 text-sm">TOTAL</text>

              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v} egresados`, n]} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={11}
                wrapperStyle={{ fontSize: '13px', color: '#9CA3AF', paddingTop: 30 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Resto de secciones (mantengo mejoradas) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top habilidades demandadas" subtitle="En ofertas activas" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF' }} width={140} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 12, 12, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contratación por cohorte" subtitle="Total vs Contratados" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="anio" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="total" fill="#334155" name="Total egresados" radius={6} />
              <Bar dataKey="contratados" fill="#3B82F6" name="Contratados" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Estados */}
      {data?.graficas?.distribucionEstados && (
        <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
          <h3 className="text-xl font-semibold mb-6">Estado de postulaciones</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {data.graficas.distribucionEstados.map((d: any, i: number) => {
              const map: any = {
                POSTULADO: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
                EN_REVISION: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
                ENTREVISTA: { color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
                CONTRATADO: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
                RECHAZADO: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
              };
              const c = map[d.name] || { color: '#94A3B8', bg: '#1F2937' };
              return (
                <div key={i} className="rounded-2xl p-6 text-center" style={{ background: c.bg }}>
                  <p className="text-5xl font-bold" style={{ color: c.color }}>{d.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: c.color }}>{d.name.replace('_', ' ')}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {error && <p className="text-red-400 text-center">{error}</p>}
    </main>
  );
}
