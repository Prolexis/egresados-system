'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Users, Building2, Briefcase, TrendingUp, RefreshCw, Activity,
  CalendarDays, ArrowUpRight, BarChart3, Download, Sparkles, Zap
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Line
} from 'recharts';

const COLORS = ['#6366F1', '#F43F5E', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'];

const tooltipStyle: CSSProperties = {
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.08)',
  backgroundColor: '#0F0F14',
  color: '#F8FAFC',
  boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  fontSize: '13px',
  padding: '12px 18px',
  backdropFilter: 'blur(20px)',
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

const GRID_LINES = 'rgba(255,255,255,0.05)';
const AXIS_TICK = 'rgba(255,255,255,0.35)';

function KpiCard({ title, value, icon: Icon, accent, trend, subtitle }: any) {
  return (
    <article
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        border: `1px solid ${accent}22`,
        background: 'linear-gradient(135deg, #13131A 0%, #0D0D12 100%)',
        padding: '28px',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 60px ${accent}22`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: accent, opacity: 0.08, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />
      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color={accent} />
        </div>
        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(16,185,129,0.1)', color: '#10B981',
            fontSize: 12, fontWeight: 600,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <ArrowUpRight size={13} />{trend}
          </span>
        )}
      </div>

      <div>
        <div style={{
          fontSize: 40, fontWeight: 700, letterSpacing: '-2px',
          color: '#F8FAFC', lineHeight: 1, marginBottom: 8,
          fontFamily: "'Syne', sans-serif",
        }}>
          {value ?? (
            <div style={{
              height: 40, width: 120,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10, animation: 'pulse 1.5s infinite',
            }} />
          )}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{subtitle}</p>}
      </div>
    </article>
  );
}

function ChartCard({ title, subtitle, children, loading, accent = '#6366F1' }: any) {
  return (
    <section style={{
      borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'linear-gradient(135deg, #13131A 0%, #0D0D12 100%)',
      padding: 28,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h3 style={{
            fontSize: 16, fontWeight: 700,
            color: '#F8FAFC', letterSpacing: '-0.3px',
            marginBottom: 4,
            fontFamily: "'Syne', sans-serif",
          }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>}
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: `${accent}15`, border: `1px solid ${accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BarChart3 size={16} color={accent} />
        </div>
      </div>
      {loading ? (
        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={28} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : children}
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

  const handleExport = () => {
    if (!data) return alert("No hay datos para exportar");
    const exportData = { ...data, exportadoEn: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-egresados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert("✅ Reporte exportado correctamente");
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .dash-section { animation: fadeUp 0.5s ease both; }
        .dash-section:nth-child(1){animation-delay:.05s}
        .dash-section:nth-child(2){animation-delay:.12s}
        .dash-section:nth-child(3){animation-delay:.2s}
        .dash-section:nth-child(4){animation-delay:.28s}
        .dash-section:nth-child(5){animation-delay:.36s}
        .dash-section:nth-child(6){animation-delay:.44s}
        .btn-secondary:hover{background:rgba(255,255,255,0.06)!important}
        .btn-primary:hover{background:#4F46E5!important}
        .status-card:hover{transform:scale(1.04)!important}
      `}</style>

      <main style={{
        background: '#08080F',
        minHeight: '100vh',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* ── HERO ── */}
        <section className="dash-section" style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          border: '1px solid rgba(99,102,241,0.2)',
          background: 'linear-gradient(135deg, #13131A 0%, #0D0D12 100%)',
          padding: '40px 44px',
        }}>
          {/* decorative grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          {/* gradient orb */}
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 300, height: 300, borderRadius: '50%',
            background: 'radial-gradient(circle, #6366F144 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -60, left: 200,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, #F43F5E22 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', borderRadius: 999,
                border: '1px solid rgba(99,102,241,0.35)',
                background: 'rgba(99,102,241,0.1)',
                marginBottom: 20,
              }}>
                <Zap size={13} color="#6366F1" />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6366F1', textTransform: 'uppercase' }}>
                  Panel Institucional
                </span>
              </div>

              <h1 style={{
                fontSize: 44, fontWeight: 800, letterSpacing: '-2px',
                color: '#F8FAFC', lineHeight: 1.05, marginBottom: 12,
                fontFamily: "'Syne', sans-serif",
              }}>
                Dashboard{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #6366F1, #F43F5E)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Administrativo
                </span>
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em' }}>
                Vista ejecutiva del sistema de egresados y empleabilidad
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {lastUpdated && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                  Actualizado: {lastUpdated.toLocaleTimeString('es-PE')}
                </p>
              )}
              <button
                className="btn-secondary"
                onClick={load}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                Actualizar
              </button>
              <button
                className="btn-primary"
                onClick={handleExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 14,
                  border: '1px solid rgba(99,102,241,0.4)',
                  background: '#6366F1',
                  color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                }}
              >
                <Download size={15} />
                Exportar Reporte
              </button>
            </div>
          </div>
        </section>

        {/* ── KPIs ── */}
        <section className="dash-section" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          <KpiCard title="Total egresados" subtitle="Registrados en plataforma" value={data?.kpis?.totalEgresados} icon={Users} accent="#6366F1" trend="+12%" />
          <KpiCard title="Empresas registradas" subtitle="Aliados empleadores" value={data?.kpis?.totalEmpresas} icon={Building2} accent="#0EA5E9" trend="+8%" />
          <KpiCard title="Ofertas activas" subtitle="Vacantes disponibles" value={data?.kpis?.ofertasActivas} icon={Briefcase} accent="#F43F5E" trend="+5%" />
          <KpiCard title="Tasa de empleabilidad" subtitle="Indicador global" value={data ? `${data.kpis.tasaEmpleabilidad}%` : null} icon={TrendingUp} accent="#10B981" trend="+3%" />
        </section>

        {/* ── MAIN CHARTS ── */}
        <section className="dash-section" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          <ChartCard title="Evolución mensual" subtitle="Ofertas vs Postulaciones" loading={loading} accent="#6366F1">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={(data?.graficas?.ofertasPorMes || []).map(item => ({ ...item, _label: formatMonthLabel(item.mes) }))}>
                <defs>
                  <linearGradient id="ofertasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={1} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_LINES} vertical={false} />
                <XAxis dataKey="_label" tick={{ fill: AXIS_TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: AXIS_TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', paddingTop: 16 }}
                  iconType="circle"
                />
                <Bar dataKey="ofertas" fill="url(#ofertasGrad)" name="Ofertas" radius={[8, 8, 0, 0]} barSize={36} />
                <Bar dataKey="postulaciones" fill="url(#postGrad)" name="Postulaciones" radius={[8, 8, 0, 0]} barSize={36} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Por carrera" subtitle="Egresados por especialidad" loading={loading} accent="#F59E0B">
            <ResponsiveContainer width="100%" height={360}>
              <PieChart>
                <Pie
                  data={data?.graficas?.egresadosPorCarrera || []}
                  cx="50%"
                  cy="46%"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={5}
                  cornerRadius={8}
                  dataKey="value"
                  nameKey="name"
                >
                  {(data?.graficas?.egresadosPorCarrera || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <text x="50%" y="42%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 36, fontWeight: 800, fill: '#F8FAFC', fontFamily: 'Syne, sans-serif', letterSpacing: '-2px' }}>
                  {data?.kpis?.totalEgresados || 0}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.1em' }}>
                  TOTAL
                </text>
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [`${value} egresados`, name]} />
                <Legend
                  layout="horizontal" verticalAlign="bottom" align="center"
                  iconType="circle" iconSize={9}
                  wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', paddingTop: 20, lineHeight: 2 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── SECONDARY CHARTS ── */}
        <section className="dash-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ChartCard title="Empleabilidad por cohorte" subtitle="Evolución por año" loading={loading} accent="#10B981">
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={data?.graficas?.contratacionesPorCohorte || []}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
                  </linearGradient>
                  <linearGradient id="contratGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#10B98188" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_LINES} vertical={false} />
                <XAxis dataKey="anio" tick={{ fill: AXIS_TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: AXIS_TICK, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', paddingTop: 16 }} iconType="circle" />
                <Bar dataKey="total" fill="url(#totalGrad)" name="Total egresados" radius={[6, 6, 0, 0]} />
                <Bar dataKey="contratados" fill="url(#contratGrad)" name="Contratados" radius={[6, 6, 0, 0]} />
                <Line type="natural" dataKey="contratados" stroke="#10B981" strokeWidth={3}
                  dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#08080F' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top habilidades demandadas" subtitle="Las más solicitadas en ofertas" loading={loading} accent="#0EA5E9">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data?.graficas?.topHabilidades?.slice(0, 8) || []}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <defs>
                  <linearGradient id="skillGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID_LINES} horizontal={false} />
                <XAxis type="number" tick={{ fill: AXIS_TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  width={150} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="value" fill="url(#skillGrad)" radius={[0, 10, 10, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* ── ESTADOS ── */}
        {data?.graficas?.distribucionEstados && (
          <section className="dash-section" style={{
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(135deg, #13131A 0%, #0D0D12 100%)',
            padding: '32px 36px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CalendarDays size={20} color="#6366F1" />
              </div>
              <div>
                <h3 style={{
                  fontSize: 17, fontWeight: 700, color: '#F8FAFC',
                  letterSpacing: '-0.3px', marginBottom: 2,
                  fontFamily: "'Syne', sans-serif",
                }}>Estado de postulaciones</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Distribución actual del proceso de selección</p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 14,
            }}>
              {data.graficas.distribucionEstados.map((d: any, i: number) => {
                const stateConfig: Record<string, { accent: string; bg: string; label: string }> = {
                  POSTULADO:   { accent: '#6366F1', bg: 'rgba(99,102,241,0.08)', label: 'Postulado' },
                  EN_REVISION: { accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'En revisión' },
                  ENTREVISTA:  { accent: '#EC4899', bg: 'rgba(236,72,153,0.08)', label: 'Entrevista' },
                  CONTRATADO:  { accent: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Contratado' },
                  RECHAZADO:   { accent: '#F43F5E', bg: 'rgba(244,63,94,0.08)', label: 'Rechazado' },
                };
                const cfg = stateConfig[d.name] || { accent: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', label: d.name };

                return (
                  <div
                    key={i}
                    className="status-card"
                    style={{
                      borderRadius: 20,
                      border: `1px solid ${cfg.accent}20`,
                      background: cfg.bg,
                      padding: '24px 20px',
                      textAlign: 'center',
                      transition: 'transform 0.2s ease',
                      cursor: 'default',
                    }}
                  >
                    <p style={{
                      fontSize: 48, fontWeight: 800, lineHeight: 1,
                      color: cfg.accent, marginBottom: 10,
                      fontFamily: "'Syne', sans-serif", letterSpacing: '-2px',
                    }}>{d.value}</p>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px', borderRadius: 999,
                      background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}30`,
                    }}>
                      <p style={{
                        fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: cfg.accent,
                      }}>
                        {cfg.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p style={{
            textAlign: 'center', padding: '24px',
            color: '#F43F5E', background: 'rgba(244,63,94,0.08)',
            borderRadius: 16, border: '1px solid rgba(244,63,94,0.2)',
          }}>{error}</p>
        )}
      </main>
    </>
  );
}
