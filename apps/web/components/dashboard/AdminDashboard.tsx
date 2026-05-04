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

const COLORS = ['#2563EB', '#EF4444', '#7C3AED', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '14px',
  border: '0.5px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  fontSize: '13px',
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
    <article className="group relative overflow-hidden rounded-[20px] border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* color glow — muy sutil */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.08] blur-2xl transition-transform duration-500 group-hover:scale-150"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[12px]"
          style={{ background: `${color}12` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>

        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{
              background: 'rgba(16,185,129,0.08)',
              color: '#10B981',
              border: '0.5px solid rgba(16,185,129,0.2)',
            }}>
            <ArrowUpRight className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <div className="text-[28px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
          {value ?? (
            <div className="h-8 w-24 animate-pulse rounded-[10px] bg-[var(--color-bg-subtle)]" />
          )}
        </div>
        <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">{title}</p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
        )}
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
    <section className="rounded-[20px] border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-bg-subtle)]">
          <BarChart3 className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center rounded-[14px] bg-[var(--color-bg-subtle)]">
          <RefreshCw className="h-5 w-5 animate-spin text-[var(--color-text-muted)]" />
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
    <main className="space-y-5 animate-fadeIn">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-7">
        {/* fondos decorativos — funcionan en claro y oscuro */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/[0.06] blur-3xl dark:bg-blue-400/[0.08]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-violet-500/[0.05] blur-3xl dark:bg-violet-400/[0.07]" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            {/* badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
              <Activity className="h-3.5 w-3.5 text-[#10B981]" />
              Panel institucional
            </div>

            <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
              Dashboard Administrativo
            </h1>
            <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Vista ejecutiva del sistema de egresados, empresas, ofertas laborales y postulaciones.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-bg-surface)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* ── CHARTS ROW 1 ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="Evolución mensual"
            subtitle="Ofertas publicadas vs postulaciones recibidas"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={(data?.graficas?.ofertasPorMes || []).map((item: any) => ({
                  ...item,
                  // normaliza cualquier formato de fecha que venga del backend:
                  // "2026-05-01" → "May" | "May 2026" → "May" | "Ene" → "Ene"
                  _label: (() => {
                    const raw: string = item.mes ?? '';
                    // formato ISO: 2026-05-01
                    if (/^\d{4}-\d{2}/.test(raw)) {
                      return new Date(raw + 'T00:00:00').toLocaleString('es-PE', { month: 'short' });
                    }
                    // formato "May 2026" o "January 2026"
                    if (/\d{4}/.test(raw)) {
                      const d = new Date(raw);
                      if (!isNaN(d.getTime())) {
                        return d.toLocaleString('es-PE', { month: 'short' });
                      }
                      // si no parsea, tomar la primera palabra
                      return raw.split(' ')[0];
                    }
                    return raw; // ya viene corto ("Ene", "Feb"…)
                  })(),
                }))}
              >
                <defs>
                  <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  strokeOpacity={0.4}
                  vertical={false}
                />
                <XAxis
                  dataKey="_label"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  dx={-4}
                  width={32}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) => `Mes: ${label}`}
                  formatter={(value: any, name: string) => [value, name]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)', paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="ofertas"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: 'var(--color-bg-surface)' }}
                  fillOpacity={1}
                  fill="url(#colorOfertas)"
                  name="Ofertas"
                />
                <Area
                  type="monotone"
                  dataKey="postulaciones"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#EF4444', strokeWidth: 2, stroke: 'var(--color-bg-surface)' }}
                  fillOpacity={1}
                  fill="url(#colorPostulaciones)"
                  name="Postulaciones"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title="Por carrera"
          subtitle="Distribución de egresados"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.graficas?.egresadosPorCarrera || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
              >
                {(data?.graficas?.egresadosPorCarrera || []).map((_: any, i: number) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                    stroke="var(--color-bg-surface)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ── CHARTS ROW 2 ─────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard
          title="Top habilidades demandadas"
          subtitle="Las 10 más solicitadas en ofertas activas"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data?.graficas?.topHabilidades || []}
              layout="vertical"
              margin={{ left: 16 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--color-border)"
                strokeOpacity={0.5}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                fill="#2563EB"
                radius={[0, 6, 6, 0]}
                name="Ofertas"
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Contratación por cohorte"
          subtitle="Total egresados vs contratados por año"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.graficas?.contratacionesPorCohorte || []}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="anio"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
              />
              <Bar
                dataKey="total"
                fill="rgba(37,99,235,0.12)"
                radius={[6, 6, 0, 0]}
                name="Total"
              />
              <Bar
                dataKey="contratados"
                fill="#2563EB"
                radius={[6, 6, 0, 0]}
                name="Contratados"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ── ESTADOS ──────────────────────────────────────────────── */}
      {data?.graficas?.distribucionEstados && (
        <section className="rounded-[20px] border border-[var(--color-border)]/60 bg-[var(--color-bg-surface)] p-6">
          <div className="mb-5 flex items-center gap-3.5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[12px]"
              style={{ background: 'rgba(37,99,235,0.08)' }}
            >
              <CalendarDays className="h-5 w-5" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                Estado de postulaciones
              </h3>
              <p className="text-[12px] text-[var(--color-text-muted)]">
                Distribución actual del proceso
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {data.graficas.distribucionEstados.map((d: any, i: number) => {
              const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                POSTULADO: {
                  bg: 'rgba(37,99,235,0.06)',
                  text: '#2563EB',
                  border: 'rgba(37,99,235,0.15)',
                },
                EN_REVISION: {
                  bg: 'rgba(245,158,11,0.06)',
                  text: '#D97706',
                  border: 'rgba(245,158,11,0.15)',
                },
                ENTREVISTA: {
                  bg: 'rgba(236,72,153,0.06)',
                  text: '#DB2777',
                  border: 'rgba(236,72,153,0.15)',
                },
                CONTRATADO: {
                  bg: 'rgba(16,185,129,0.06)',
                  text: '#059669',
                  border: 'rgba(16,185,129,0.15)',
                },
                RECHAZADO: {
                  bg: 'rgba(239,68,68,0.06)',
                  text: '#DC2626',
                  border: 'rgba(239,68,68,0.15)',
                },
              };

              const c = colorMap[d.name] ?? {
                bg: 'var(--color-bg-subtle)',
                text: 'var(--color-text-secondary)',
                border: 'var(--color-border)',
              };

              return (
                <div
                  key={i}
                  className="rounded-[14px] p-4 text-center"
                  style={{
                    background: c.bg,
                    border: `0.5px solid ${c.border}`,
                  }}
                >
                  <p
                    className="text-[26px] font-semibold leading-none tracking-tight"
                    style={{ color: c.text }}
                  >
                    {d.value}
                  </p>
                  <p
                    className="mt-2 text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: c.text }}
                  >
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
