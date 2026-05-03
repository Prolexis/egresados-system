'use client';

import { useEffect, useState } from 'react';
import { notificacionesApi } from '@/lib/api';
import {
  Bell,
  CheckCircle2,
  Clock,
  Mail,
  Briefcase,
  RefreshCw,
  Loader2,
  CheckCheck,
  Inbox,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

const tipoIcon: Record<string, any> = {
  NUEVA_OFERTA: {
    icon: Briefcase,
    color: '#2563EB',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
    label: 'Nueva oferta',
  },
  POSTULACION_RECIBIDA: {
    icon: Mail,
    color: '#EF4444',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
    label: 'Postulación',
  },
  ESTADO_CAMBIADO: {
    icon: CheckCircle2,
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    label: 'Estado actualizado',
  },
  NUEVO_MENSAJE: {
    icon: MessageSquare,
    color: '#F59E0B',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-500/20',
    label: 'Mensaje',
  },
  DEFAULT: {
    icon: Bell,
    color: '#64748B',
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-500/20',
    label: 'Notificación',
  },
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <div className="relative">
        <p className="text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="mt-1 text-sm font-black text-[var(--color-text-secondary)]">
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-5">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />

      <div className="flex-1 space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
      </div>
    </div>
  );
}

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState<string | null>(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const res = await notificacionesApi.list();
      setNotificaciones(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const marcarLeida = async (id: string) => {
    setMarcando(id);
    try {
      await notificacionesApi.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      );
    } finally {
      setMarcando(null);
    }
  };

  const marcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await notificacionesApi.marcarTodas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } finally {
      setMarcandoTodas(false);
    }
  };

  const total = notificaciones.length;
  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const leidas = total - noLeidas;
  const recientes = notificaciones.slice(0, 5).length;

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Centro de alertas
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Notificaciones
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Revisa novedades del sistema, cambios de estado, mensajes y
              alertas importantes de tu actividad.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadNotificaciones}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Actualizar
            </button>

            <button
              type="button"
              onClick={marcarTodas}
              disabled={marcandoTodas || notificaciones.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {marcandoTodas ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Marcar todas
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={total}
          icon={Bell}
          color="#2563EB"
          subtitle="Notificaciones recibidas"
        />

        <StatCard
          title="No leídas"
          value={noLeidas}
          icon={Inbox}
          color="#EF4444"
          subtitle="Pendientes de revisión"
        />

        <StatCard
          title="Leídas"
          value={leidas}
          icon={CheckCircle2}
          color="#10B981"
          subtitle="Ya revisadas"
        />

        <StatCard
          title="Recientes"
          value={recientes}
          icon={Clock}
          color="#F59E0B"
          subtitle="Últimas alertas"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Bandeja de notificaciones
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
              {loading
                ? 'Cargando notificaciones...'
                : `${notificaciones.length} notificación(es) encontrada(s)`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
            <Bell className="h-3.5 w-3.5" />
            Sistema activo
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-[var(--color-border)]">
            {[...Array(6)].map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <Bell className="h-8 w-8 text-[var(--color-text-muted)]" />
            </div>

            <h3 className="mt-5 text-lg font-display font-extrabold text-[var(--color-text-primary)]">
              No tienes notificaciones
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
              Cuando haya novedades, cambios de estado o mensajes importantes,
              aparecerán en esta sección.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {notificaciones.map((n) => {
              const t = tipoIcon[n.tipo] || tipoIcon.DEFAULT;
              const Icon = t.icon;

              return (
                <article
                  key={n.id}
                  className={`group relative flex items-start gap-4 px-6 py-5 transition-all duration-300 ${
                    n.leida
                      ? 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-subtle)]'
                      : 'bg-blue-500/10 hover:bg-blue-500/15'
                  }`}
                >
                  {!n.leida && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                  )}

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.bg} ring-1 ${t.ring}`}
                  >
                    <Icon className="h-6 w-6" style={{ color: t.color }} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${t.bg} ${t.text} ${t.ring}`}
                      >
                        {t.label}
                      </span>

                      {!n.leida && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-black text-white shadow-sm ring-1 ring-blue-400/20">
                          Nuevo
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-black ${
                        n.leida
                          ? 'text-[var(--color-text-secondary)]'
                          : 'text-[var(--color-text-primary)]'
                      }`}
                    >
                      {n.titulo}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
                      {n.mensaje}
                    </p>

                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(n.createdAt)}
                    </p>
                  </div>

                  {!n.leida && (
                    <button
                      type="button"
                      onClick={() => marcarLeida(n.id)}
                      disabled={marcando === n.id}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-emerald-300"
                      title="Marcar como leída"
                    >
                      {marcando === n.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}