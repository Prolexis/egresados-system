'use client';

import { useEffect, useState } from 'react';
import { notificacionesApi } from '@/lib/api';
import {
  Bell, CheckCircle2, Clock, Mail, Briefcase, RefreshCw,
  Loader2, CheckCheck, Inbox, Sparkles, MessageSquare,
} from 'lucide-react';

/* ─── Tipo config ──────────────────────────────────────────────── */
const tipoIcon: Record<string, any> = {
  NUEVA_OFERTA: {
    icon: Briefcase, color: '#2563EB',
    bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', ring: 'ring-blue-500/20', label: 'Nueva oferta',
  },
  POSTULACION_RECIBIDA: {
    icon: Mail, color: '#EF4444',
    bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-500/20', label: 'Postulación',
  },
  ESTADO_CAMBIADO: {
    icon: CheckCircle2, color: '#10B981',
    bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500/20', label: 'Estado actualizado',
  },
  NUEVO_MENSAJE: {
    icon: MessageSquare, color: '#F59E0B',
    bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500/20', label: 'Mensaje',
  },
  DEFAULT: {
    icon: Bell, color: '#64748B',
    bg: 'bg-slate-500/10', text: 'text-slate-700 dark:text-slate-300', ring: 'ring-slate-500/20', label: 'Notificación',
  },
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

function timeAgo(value: string) {
  try {
    const diff = Date.now() - new Date(value).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Justo ahora';
    if (m < 60) return `Hace ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Hace ${h}h`;
    return `Hace ${Math.floor(h / 24)}d`;
  } catch { return '—'; }
}

/* ─── StatCard ─────────────────────────────────────────────────── */
function StatCard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: number; icon: any; color: string; subtitle: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125"
        style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-70" style={{ background: color }} />

      <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}12` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <div className="relative">
        <p className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{value}</p>
        <p className="mt-0.5 text-[13px] font-medium text-[var(--color-text-secondary)]">{title}</p>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────── */
function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
      <div className="flex-1 space-y-2.5">
        <div className="h-3.5 w-3/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        <div className="h-2.5 w-1/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
      </div>
    </div>
  );
}

/* ─── Mini progress bar para tipos ────────────────────────────── */
function TipoBreakdown({ notificaciones }: { notificaciones: any[] }) {
  if (!notificaciones.length) return null;
  const tipos = Object.entries(
    notificaciones.reduce((acc: any, n: any) => {
      const key = n.tipo || 'DEFAULT';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a: any, b: any) => b[1] - a[1]);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <h3 className="mb-4 text-[13px] font-semibold text-[var(--color-text-primary)]">Distribución por tipo</h3>
      <div className="space-y-3">
        {tipos.map(([tipo, count]: any) => {
          const cfg = tipoIcon[tipo] || tipoIcon.DEFAULT;
          const Icon = cfg.icon;
          const pct = Math.round((count / notificaciones.length) * 100);
          return (
            <div key={tipo}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                  <span className="text-[12px] text-[var(--color-text-secondary)]">{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--color-text-muted)]">{count}</span>
                  <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color, opacity: 0.8 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);
  const [marcando, setMarcando]             = useState<string | null>(null);
  const [marcandoTodas, setMarcandoTodas]   = useState(false);
  const [filtroTipo, setFiltroTipo]         = useState<string>('TODAS');

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const res = await notificacionesApi.list();
      setNotificaciones(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotificaciones(); }, []);

  const marcarLeida = async (id: string) => {
    setMarcando(id);
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } finally { setMarcando(null); }
  };

  const marcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await notificacionesApi.marcarTodas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    } finally { setMarcandoTodas(false); }
  };

  /* ── Derived ────────────────────────────────────────────────── */
  const total    = notificaciones.length;
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const leidas   = total - noLeidas;
  const recientes = notificaciones.slice(0, 5).length;

  const TABS = ['TODAS', 'NO LEÍDAS', ...Array.from(new Set(notificaciones.map(n => n.tipo || 'DEFAULT')))];

  const filtradas = notificaciones.filter(n => {
    if (filtroTipo === 'TODAS')    return true;
    if (filtroTipo === 'NO LEÍDAS') return !n.leida;
    return (n.tipo || 'DEFAULT') === filtroTipo;
  });

  return (
    <main className="space-y-4">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Centro de alertas
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Notificaciones</h1>
            <p className="mt-1.5 max-w-lg text-sm text-[var(--color-text-secondary)]">
              Revisa novedades del sistema, cambios de estado, mensajes y alertas importantes de tu actividad.
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button" onClick={loadNotificaciones} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Actualizar
            </button>
            <button
              type="button" onClick={marcarTodas} disabled={marcandoTodas || !notificaciones.length}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {marcandoTodas ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
              Marcar todas
            </button>
          </div>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="Total"     value={total}    icon={Bell}        color="#2563EB" subtitle="Notificaciones recibidas" />
        <StatCard title="No leídas" value={noLeidas} icon={Inbox}       color="#EF4444" subtitle="Pendientes de revisión"   />
        <StatCard title="Leídas"    value={leidas}   icon={CheckCircle2} color="#10B981" subtitle="Ya revisadas"            />
        <StatCard title="Recientes" value={recientes} icon={Clock}      color="#F59E0B" subtitle="Últimas alertas"          />
      </section>

      {/* ── Content: Lista + Sidebar ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">

        {/* Bandeja */}
        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">

          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Bandeja de notificaciones</h2>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                {loading ? 'Cargando...' : `${filtradas.length} de ${total} notificación(es)`}
              </p>
            </div>
            {noLeidas > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                <Bell className="h-3 w-3" />
                {noLeidas} sin leer
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-4 py-2.5 scrollbar-hide">
            {['TODAS', 'NO LEÍDAS'].map(tab => {
              const active = filtroTipo === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFiltroTipo(tab)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {tab === 'TODAS' ? 'Todas' : 'No leídas'}
                  {tab === 'NO LEÍDAS' && noLeidas > 0 && (
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'}`}>
                      {noLeidas}
                    </span>
                  )}
                </button>
              );
            })}
            {Array.from(new Set(notificaciones.map(n => n.tipo || 'DEFAULT'))).map(tipo => {
              const cfg = tipoIcon[tipo] || tipoIcon.DEFAULT;
              const active = filtroTipo === tipo;
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(tipo)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-border)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* List */}
          {loading ? (
            <div className="divide-y divide-[var(--color-border)]">
              {[...Array(6)].map((_, i) => <NotificationSkeleton key={i} />)}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <Bell className="h-6 w-6 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-text-primary)]">Sin notificaciones</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-[var(--color-text-muted)]">
                Cuando haya novedades aparecerán aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {filtradas.map(n => {
                const t = tipoIcon[n.tipo] || tipoIcon.DEFAULT;
                const Icon = t.icon;
                return (
                  <article
                    key={n.id}
                    className={`group relative flex items-start gap-3 px-5 py-4 transition-colors ${
                      n.leida
                        ? 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]'
                        : 'bg-blue-500/[.06] hover:bg-blue-500/10'
                    }`}
                  >
                    {/* Unread indicator */}
                    {!n.leida && (
                      <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-sm bg-blue-600" />
                    )}

                    {/* Icon */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.bg} ring-1 ${t.ring}`}>
                      <Icon className="h-4.5 w-4.5" style={{ color: t.color }} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${t.bg} ${t.text} ${t.ring}`}>
                          {t.label}
                        </span>
                        {!n.leida && (
                          <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Nuevo
                          </span>
                        )}
                      </div>

                      <h3 className={`text-[13px] font-semibold leading-snug ${n.leida ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {n.titulo}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-muted)]">{n.mensaje}</p>

                      <div className="mt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                          <Clock className="h-3 w-3" />
                          {timeAgo(n.createdAt)}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] opacity-60">{formatDate(n.createdAt)}</span>
                      </div>
                    </div>

                    {/* Mark read */}
                    {!n.leida && (
                      <button
                        type="button"
                        onClick={() => marcarLeida(n.id)}
                        disabled={marcando === n.id}
                        title="Marcar como leída"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-600 disabled:opacity-50 dark:hover:text-emerald-300"
                      >
                        {marcando === n.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Sidebar ─────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4">

          {/* Tasa de lectura */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <h3 className="mb-4 text-[13px] font-semibold text-[var(--color-text-primary)]">Tasa de lectura</h3>
            {total > 0 ? (
              <>
                <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-bg-subtle)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10B981" strokeWidth="2.5"
                      strokeDasharray={`${Math.round((leidas / total) * 100)} 100`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[var(--color-text-primary)]">{Math.round((leidas / total) * 100)}%</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">leídas</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-[var(--color-bg-subtle)] p-2.5">
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{leidas}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Leídas</p>
                  </div>
                  <div className="rounded-xl bg-[var(--color-bg-subtle)] p-2.5">
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">{noLeidas}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Pendientes</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[12px] text-[var(--color-text-muted)]">Sin datos aún.</p>
            )}
          </div>

          {/* Distribución por tipo */}
          <TipoBreakdown notificaciones={notificaciones} />

          {/* Tip */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Consejo</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              Mantén tu bandeja al día marcando las notificaciones como leídas para no perder alertas importantes.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
