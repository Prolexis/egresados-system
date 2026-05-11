'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Users, Building2, Briefcase, TrendingUp, RefreshCw,
  Activity, CalendarDays, ArrowUpRight, BarChart3, Download,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Line,
} from 'recharts';

/* ─── Palette ─────────────────────────────────────────────────── */
const COLORS = ['#2563EB', '#F43F5E', '#7C3AED', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-surface)',
  color: 'var(--color-text-primary)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  fontSize: '13px',
  padding: '10px 16px',
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

/* ─── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ title, value, icon: Icon, color, trend, subtitle }: any) {
  return (
    <article
      className="kpi-card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        padding: '22px',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
        borderRadius: '14px 0 0 14px',
        background: color,
        opacity: 0.75,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={color} />
        </div>
        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(16,185,129,0.1)', color: '#10B981',
            fontSize: 11, fontWeight: 600,
          }}>
            <ArrowUpRight size={11} />{trend}
          </span>
        )}
      </div>

      <div style={{
        fontSize: 32, fontWeight: 700, letterSpacing: '-1.2px',
        color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 6,
      }}>
        {value ?? (
          <div style={{
            height: 32, width: 90,
            background: 'var(--color-bg-subtle)',
            borderRadius: 7, opacity: 0.5,
          }} />
        )}
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 1 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{subtitle}</p>}
    </article>
  );
}

/* ─── Chart Card ───────────────────────────────────────────────── */
function ChartCard({ title, subtitle, children, loading }: any) {
  return (
    <section style={{
      borderRadius: '14px',
      border: '1px solid var(--color-border)',
      background: 'var(--color-bg-surface)',
      padding: '22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{
            fontSize: 14, fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.2px', marginBottom: 2,
          }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{subtitle}</p>}
        </div>
        <BarChart3 size={15} color="var(--color-text-muted)" />
      </div>
      {loading ? (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={20} color="var(--color-text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : children}
    </section>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */
const formatMonthLabel = (raw: string) => {
  if (!raw) return '';
  if (/^\d{4}-\d{2}/.test(raw)) return new Date(raw).toLocaleString('es-PE', { month: 'short' });
  return raw.split(' ')[0];
};

/* ─── Dashboard ────────────────────────────────────────────────── */
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

  const handleExport = () => {
    if (!data) return alert('No hay datos para exportar');
    const exportData = { ...data, exportadoEn: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-egresados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✅ Reporte exportado correctamente');
  };

  useEffect(() => { load(); }, []);

  const axisColor = 'var(--color-text-muted)';
  const gridColor = 'var(--color-border)';

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
        .dash-row { animation: fadeUp 0.35s ease both; }
        .dash-row:nth-child(2) { animation-delay: .06s }
        .dash-row:nth-child(3) { animation-delay: .12s }
        .dash-row:nth-child(4) { animation-delay: .18s }
        .dash-row:nth-child(5) { animation-delay: .24s }
        .dash-row:nth-child(6) { animation-delay: .30s }
        .status-pill:hover { opacity: .85; }
      `}</style>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="dash-row" style={{
          borderRadius: '14px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 11px', borderRadius: 999,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-subtle)',
                marginBottom: 12,
              }}>
                <Activity size={11} color="#10B981" />
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'var(--color-text-muted)',
                }}>Panel Institucional</span>
              </div>

              <h1 style={{
                fontSize: 26, fontWeight: 700, letterSpacing: '-0.6px',
                color: 'var(--color-text-primary)', marginBottom: 5, lineHeight: 1.1,
              }}>
                Dashboard Administrativo
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                Vista ejecutiva del sistema de egresados y empleabilidad
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {lastUpdated && (
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {lastUpdated.toLocaleTimeString('es-PE')}
                </p>
              )}
              <button
                onClick={load}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 9,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'opacity .15s',
                }}
              >
                <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                Actualizar
              </button>
              <button
                onClick={handleExport}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 9,
                  border: '1px solid #1d4ed8',
                  background: '#2563EB',
                  color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background .15s',
                }}
              >
                <Download size={13} />
                Exportar Reporte
              </button>
            </div>
          </div>
        </section>

        {/* ── KPIs ─────────────────────────────────────────────── */}
        <section
          className="dash-row"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}
        >
          <KpiCard title="Total egresados"       subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados}                       icon={Users}      color="#2563EB" trend="+12%" />
          <KpiCard title="Empresas registradas"  subtitle="Aliados empleadores"        value={data?.kpis?.totalEmpresas}                        icon={Building2}  color="#7C3AED" trend="+8%"  />
          <KpiCard title="Ofertas activas"       subtitle="Vacantes disponibles"       value={data?.kpis?.ofertasActivas}                       icon={Briefcase}  color="#F43F5E" trend="+5%"  />
          <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global"           value={data ? `${data.kpis.tasaEmpleabilidad}%` : null}  icon={TrendingUp} color="#10B981" trend="+3%"  />
        </section>

        {/* ── Main charts ──────────────────────────────────────── */}
        <section className="dash-row" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 12 }}>

          <ChartCard title="Evolución mensual" subtitle="Ofertas vs Postulaciones" loading={loading}>
            <ResponsiveContainer width="100%" height={330}>
              <ComposedChart
                data={(data?.graficas?.ofertasPorMes || []).map(item => ({
                  ...item, _label: formatMonthLabel(item.mes),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="_label" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-bg-subtle)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)', paddingTop: 12 }} iconType="circle" />
                <Bar dataKey="ofertas"       fill="#2563EB" name="Ofertas"       radius={[5,5,0,0]} barSize={32} opacity={0.88} />
                <Bar dataKey="postulaciones" fill="#F43F5E" name="Postulaciones" radius={[5,5,0,0]} barSize={32} opacity={0.88} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribución por carrera" subtitle="Egresados por especialidad" loading={loading}>
            <ResponsiveContainer width="100%" height={330}>
              <PieChart>
                <Pie
                  data={data?.graficas?.egresadosPorCarrera || []}
                  cx="50%" cy="44%"
                  innerRadius={78} outerRadius={112}
                  paddingAngle={4} cornerRadius={5}
                  dataKey="value" nameKey="name"
                >
                  {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>

                <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle"
                  fill="var(--color-text-primary)"
                  style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px' }}>
                  {data?.kpis?.totalEgresados || 0}
                </text>
                <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle"
                  fill="var(--color-text-muted)"
                  style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.09em' }}>
                  TOTAL EGRESADOS
                </text>

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [`${value} egresados`, name]}
                />
                <Legend
                  layout="horizontal" verticalAlign="bottom" align="center"
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: 'var(--color-text-muted)', paddingTop: 16, lineHeight: 1.8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Secondary charts ─────────────────────────────────── */}
        <section className="dash-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          <ChartCard title="Empleabilidad por cohorte" subtitle="Evolución por año" loading={loading}>
            <ResponsiveContainer width="100%" height={290}>
              <ComposedChart data={data?.graficas?.contratacionesPorCohorte || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="anio" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-bg-subtle)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)', paddingTop: 12 }} iconType="circle" />
                <Bar dataKey="total"       fill="var(--color-bg-subtle)" name="Total egresados"
                  radius={[4,4,0,0]} stroke="var(--color-border)" strokeWidth={1} />
                <Bar dataKey="contratados" fill="#10B981"                name="Contratados"
                  radius={[4,4,0,0]} opacity={0.9} />
                <Line type="natural" dataKey="contratados" stroke="#10B981" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top habilidades demandadas" subtitle="Más solicitadas en ofertas" loading={loading}>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={data?.graficas?.topHabilidades?.slice(0, 8) || []}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category" dataKey="name"
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  width={148} axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-bg-subtle)' }} />
                <Bar dataKey="value" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={22} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── Estado de postulaciones ───────────────────────────── */}
        {data?.graficas?.distribucionEstados && (
          <section className="dash-row" style={{
            borderRadius: '14px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg-surface)',
            padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(37,99,235,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CalendarDays size={16} color="#2563EB" />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Estado de postulaciones
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Distribución actual del proceso
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 10,
            }}>
              {data.graficas.distribucionEstados.map((d: any, i: number) => {
                const STATE: Record<string, { color: string; label: string }> = {
                  POSTULADO:   { color: '#2563EB', label: 'Postulado'   },
                  EN_REVISION: { color: '#D97706', label: 'En revisión' },
                  ENTREVISTA:  { color: '#DB2777', label: 'Entrevista'  },
                  CONTRATADO:  { color: '#059669', label: 'Contratado'  },
                  RECHAZADO:   { color: '#DC2626', label: 'Rechazado'   },
                };
                const s = STATE[d.name] || { color: 'var(--color-text-secondary)', label: d.name.replace('_', ' ') };

                return (
                  <div key={i} style={{
                    borderRadius: 10,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-subtle)',
                    padding: '16px 14px',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      fontSize: 34, fontWeight: 700, lineHeight: 1,
                      color: s.color, letterSpacing: '-1px', marginBottom: 7,
                    }}>{d.value}</p>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 9px', borderRadius: 999,
                      background: `${s.color}12`,
                      fontSize: 10, fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: s.color,
                    }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p style={{
            textAlign: 'center', padding: 18, borderRadius: 10,
            color: '#DC2626', background: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.14)', fontSize: 13,
          }}>
            {error}
          </p>
        )}
      </main>
    </>
  );
}
