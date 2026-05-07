'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Users, Building2, Briefcase, TrendingUp, RefreshCw, Activity,
  CalendarDays, ArrowUpRight, BarChart3, Download
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Line
} from 'recharts';

const COLORS = ['#2563EB', '#EF4444', '#7C3AED', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '14px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  fontSize: '14px',
  padding: '12px 16px',
};

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

function KpiCard({ title, value, icon: Icon, color, trend, subtitle }: any) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl" style={{ background: color }} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <ArrowUpRight className="h-3.5 w-3.5" />{trend}
          </span>
        )}
      </div>
      <div className="mt-6">
        <div className="text-4xl font-semibold tracking-tighter text-[var(--color-text-primary)]">
          {value ?? <div className="h-10 w-28 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />}
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{title}</p>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)]">{subtitle}</p>}
      </div>
    </article>
  );
}

function ChartCard({ title, subtitle, children, loading }: any) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
          {subtitle && <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <BarChart3 className="h-5 w-5 text-[var(--color-text-muted)]" />
      </div>
      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-text-muted)]" />
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
    <main className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-xs uppercase tracking-widest mb-4">
              <Activity className="h-4 w-4 text-[#10B981]" /> PANEL INSTITUCIONAL
            </div>
            <h1 className="text-4xl font-semibold tracking-tighter text-[var(--color-text-primary)]">Dashboard Administrativo</h1>
            <p className="mt-3 text-[var(--color-text-secondary)]">Vista ejecutiva del sistema de egresados y empleabilidad</p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && <p className="text-sm text-[var(--color-text-muted)]">Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}</p>}
            <button onClick={load} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1e40a8] text-white rounded-2xl transition">
              <Download className="h-4 w-4" /> Exportar
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard title="Total egresados" subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados} icon={Users} color="#2563EB" trend="+12%" />
        <KpiCard title="Empresas registradas" subtitle="Aliados empleadores" value={data?.kpis?.totalEmpresas} icon={Building2} color="#7C3AED" trend="+8%" />
        <KpiCard title="Ofertas activas" subtitle="Vacantes disponibles" value={data?.kpis?.ofertasActivas} icon={Briefcase} color="#EF4444" trend="+5%" />
        <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global" value={data ? `${data.kpis.tasaEmpleabilidad}%` : null} icon={TrendingUp} color="#10B981" trend="+3%" />
      </section>

      {/* Gráficos principales */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución mensual - Versión limpia y clara */}
        <div className="lg:col-span-2">
          <ChartCard title="Evolución mensual" subtitle="Ofertas vs Postulaciones" loading={loading}>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={(data?.graficas?.ofertasPorMes || []).map(item => ({ ...item, _label: formatMonthLabel(item.mes) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                <XAxis dataKey="_label" tick={{ fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ paddingTop: 15 }} />

                <Bar dataKey="ofertas" fill="#2563EB" name="Ofertas" radius={[6, 6, 0, 0]} barSize={45} />
                <Bar dataKey="postulaciones" fill="#EF4444" name="Postulaciones" radius={[6, 6, 0, 0]} barSize={45} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Pie Chart - Mejorado */}
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

              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="text-5xl font-bold fill-[var(--color-text-primary)] tracking-tighter">
                {data?.kpis?.totalEgresados || 0}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-medium fill-[var(--color-text-muted)]">
                TOTAL EGRESADOS
              </text>

              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} egresados`]} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={11}
                wrapperStyle={{ fontSize: '13px', color: 'var(--color-text-secondary)', paddingTop: 30 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Resto de gráficos (puedes seguir mejorando) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top habilidades demandadas" subtitle="En ofertas activas" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fill: 'var(--color-text-muted)' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--color-text-muted)' }} width={150} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 12, 12, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contratación por cohorte" subtitle="Total vs Contratados" loading={loading}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
              <CartesianGrid stroke="var(--color-border)" />
              <XAxis dataKey="anio" tick={{ fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="total" fill="#E2E8F0" name="Total egresados" radius={6} />
              <Bar dataKey="contratados" fill="#2563EB" name="Contratados" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {error && <p className="text-red-500 text-center">{error}</p>}
    </main>
  );
}
