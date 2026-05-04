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

const COLORS = ['#2563EB', '#EF4444', '#0D1117', '#7C3AED', '#10B981', '#F59E0B'];

const tooltipStyle: CSSProperties = {
  borderRadius: '16px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: 'var(--shadow-lg)',
};

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
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:scale-125"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
          style={{ background: `${color}15` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>

        {trend && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success)]/10 px-3 py-1.5 text-xs font-black text-[var(--color-success)] ring-1 ring-[var(--color-success)]/20">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        )}
      </div>

      <div className="relative mt-6">
        <div className="text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {value ?? <div className="h-10 w-28 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />}
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--color-text-secondary)]">{title}</p>
        {subtitle && <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{subtitle}</p>}
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
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">{title}</h3>
          {subtitle && <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
          <BarChart3 className="h-6 w-6 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
          <RefreshCw className="h-7 w-7 animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

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

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
  <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

  <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
        <Activity className="h-4 w-4 text-[var(--color-success)]" />
        Panel institucional
      </div>

      <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
        Dashboard Administrativo
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
        Vista ejecutiva del sistema de egresados, empresas, ofertas laborales y postulaciones.
      </p>
    </div>

    <button
      onClick={load}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80 dark:border-blue-400/20 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Actualizar
    </button>
  </div>
</section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Egresados"
          subtitle="Registrados en plataforma"
          value={data?.kpis?.totalEgresados}
          icon={Users}
          color="#2563EB"
          trend="+12%"
        />
        <KpiCard
          title="Empresas Registradas"
          subtitle="Aliados empleadores"
          value={data?.kpis?.totalEmpresas}
          icon={Building2}
          color="#0D1117"
          trend="+8%"
        />
        <KpiCard
          title="Ofertas Activas"
          subtitle="Vacantes disponibles"
          value={data?.kpis?.ofertasActivas}
          icon={Briefcase}
          color="#EF4444"
          trend="+5%"
        />
        <KpiCard
          title="Tasa de Empleabilidad"
          subtitle="Indicador global"
          value={data ? `${data?.kpis?.tasaEmpleabilidad ?? 0}%` : null}
          icon={TrendingUp}
          color="#10B981"
          trend="+3%"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Evolución Mensual"
            subtitle="Ofertas publicadas vs postulaciones recibidas"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.graficas?.ofertasPorMes || []}>
                <defs>
                  <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="ofertas" stroke="#2563EB" strokeWidth={3} dot={false} fillOpacity={1} fill="url(#colorOfertas)" name="Ofertas" />
                <Area type="monotone" dataKey="postulaciones" stroke="#EF4444" strokeWidth={3} dot={false} fillOpacity={1} fill="url(#colorPostulaciones)" name="Postulaciones" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title="Por Carrera"
          subtitle="Distribución de egresados"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data?.graficas?.egresadosPorCarrera || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={4}
              >
                {(data?.graficas?.egresadosPorCarrera || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-bg-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top Habilidades Demandadas"
          subtitle="Las 10 más solicitadas en ofertas activas"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.graficas?.topHabilidades || []} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} width={110} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 8, 8, 0]} name="Ofertas" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Contratación por Cohorte"
          subtitle="Total egresados vs contratados por año"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="total" fill="rgba(37,99,235,0.2)" radius={[8, 8, 0, 0]} name="Total" />
              <Bar dataKey="contratados" fill="#2563EB" radius={[8, 8, 0, 0]} name="Contratados" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {data?.graficas?.distribucionEstados && (
        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(37,99,235,0.1)' }}>
              <CalendarDays className="h-6 w-6" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold text-[var(--color-text-primary)]">Estado de Postulaciones</h3>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">Distribución actual del proceso</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {data.graficas.distribucionEstados.map((d: any, i: number) => {
              const colors: Record<string, string> = {
                POSTULADO: 'bg-[rgba(37,99,235,0.1)] text-[#2563EB] ring-[rgba(37,99,235,0.2)]',
                EN_REVISION: 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B] ring-[rgba(245,158,11,0.2)]',
                ENTREVISTA: 'bg-[rgba(236,72,153,0.1)] text-[#EC4899] ring-[rgba(236,72,153,0.2)]',
                CONTRATADO: 'bg-[rgba(16,185,129,0.1)] text-[#10B981] ring-[rgba(16,185,129,0.2)]',
                RECHAZADO: 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] ring-[rgba(239,68,68,0.2)]',
              };

              return (
                <div key={i} className={`rounded-2xl p-5 text-center ring-1 ${colors[d.name] || 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] ring-[var(--color-border)]'}`}>
                  <p className="text-3xl font-display font-extrabold">{d.value}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-wide">
                    {d.name.replace('_', ' ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
