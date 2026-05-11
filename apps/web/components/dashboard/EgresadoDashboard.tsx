'use client';

import { useEffect, useMemo, useState } from 'react';
import { estadisticasApi, egresadosApi } from '@/lib/api';
import {
  BookOpen, CheckCircle2, Clock, Star, Briefcase,
  ArrowRight, UserRound, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Estado config ────────────────────────────────────────────── */
const estadoBadge: Record<string, { bg: string; text: string; ring: string; label: string; bar: string }> = {
  POSTULADO:   { bg: 'bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-300',    ring: 'ring-blue-500/20',    label: 'Postulado',      bar: '#2563EB' },
  EN_REVISION: { bg: 'bg-amber-500/10',   text: 'text-amber-700 dark:text-amber-300',  ring: 'ring-amber-500/20',   label: 'En Revisión',    bar: '#D97706' },
  ENTREVISTA:  { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-700 dark:text-fuchsia-300', ring: 'ring-fuchsia-500/20', label: 'Entrevista',  bar: '#DB2777' },
  CONTRATADO:  { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500/20', label: 'Contratado ✓', bar: '#059669' },
  RECHAZADO:   { bg: 'bg-rose-500/10',    text: 'text-rose-700 dark:text-rose-300',    ring: 'ring-rose-500/20',    label: 'Rechazado',      bar: '#DC2626' },
};

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Soft ambient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125"
        style={{ background: color }} />

      <div className="relative mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}12` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <p className="relative text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="relative mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: color }} />
    </article>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────── */
export default function EgresadoDashboard() {
  const [data, setData]     = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    estadisticasApi.egresado().then(setData).catch(console.error);
    egresadosApi.me().then(setPerfil).catch(console.error);
  }, []);

  const stats          = data?.stats;
  const historial      = useMemo(() => data?.historialPostulaciones || [], [data]);
  const recomendaciones = useMemo(() => data?.recomendaciones || [], [data]);

  const tasaRespuesta = stats
    ? stats.total > 0 ? Math.round(((stats.total - stats.rechazado) / stats.total) * 100) : 0
    : null;

  return (
    <main className="space-y-5">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7">
        {/* Subtle tinted corner */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/8" />

        {/* Left accent border */}
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
              <UserRound className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Bienvenido de vuelta
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                {perfil ? `${perfil.nombre} ${perfil.apellido}` : (
                  <span className="inline-block h-7 w-48 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
                )}
              </h1>

              <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                {perfil?.carrera || 'Carrera pendiente'}
                {perfil?.anioEgreso && <> · Cohorte <span className="font-semibold">{perfil.anioEgreso}</span></>}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/mi-perfil"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Editar perfil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── KPI Stats ────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard label="Postulaciones"  value={stats?.total ?? '–'}       icon={BookOpen}    color="#2563EB" />
        <StatCard label="En Revisión"    value={stats?.enRevision ?? '–'}  icon={Clock}       color="#D97706" />
        <StatCard label="Entrevistas"    value={stats?.entrevistas ?? '–'} icon={Star}        color="#DB2777" />
        <StatCard label="Contratado"     value={stats?.contratado ?? '–'}  icon={CheckCircle2} color="#059669" />
        <StatCard label="Tasa respuesta" value={tasaRespuesta !== null ? `${tasaRespuesta}%` : '–'} icon={Briefcase} color="#EF4444" />
      </section>

      {/* ── Main panels ──────────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recomendaciones */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                Ofertas recomendadas
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">Basadas en tus habilidades</p>
            </div>
            <Link
              href="/dashboard/ofertas"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
            >
              Ver todas →
            </Link>
          </div>

          <div className="space-y-2">
            {recomendaciones.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-10 text-center">
                <Briefcase className="mx-auto mb-2.5 h-9 w-9 text-[var(--color-text-muted)] opacity-50" />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  Completa tu perfil para ver recomendaciones
                </p>
              </div>
            )}

            {recomendaciones.slice(0, 4).map((oferta: any) => (
              <Link
                key={oferta.id}
                href={`/dashboard/ofertas/${oferta.id}`}
                className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3.5 transition hover:border-blue-400/30 hover:bg-blue-500/5"
              >
                {/* Logo placeholder */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[13px] font-bold text-blue-600 dark:text-blue-400">
                  {oferta.empresa?.nombreComercial?.[0] || 'E'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                    {oferta.titulo}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {oferta.empresa?.nombreComercial} · {oferta.modalidad}
                  </p>
                </div>

                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Estado postulaciones */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                Estado de postulaciones
              </h3>
              <p className="text-xs text-[var(--color-text-muted)]">Distribución actual</p>
            </div>
            <Link
              href="/dashboard/mis-postulaciones"
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
            >
              Ver detalles →
            </Link>
          </div>

          <div className="space-y-3">
            {historial.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-10 text-center">
                <BookOpen className="mx-auto mb-2.5 h-9 w-9 text-[var(--color-text-muted)] opacity-50" />
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Sin postulaciones aún</p>
                <Link href="/dashboard/ofertas" className="mt-1.5 block text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Explorar ofertas →
                </Link>
              </div>
            )}

            {historial.map((item: any) => {
              const badge  = estadoBadge[item.estado] || {
                bg: 'bg-[var(--color-bg-subtle)]', text: 'text-[var(--color-text-secondary)]',
                ring: 'ring-[var(--color-border)]', label: item.estado, bar: '#6B7280',
              };
              const maxVal = Math.max(...historial.map((h: any) => h.cantidad), 1);
              const pct    = Math.round((item.cantidad / maxVal) * 100);

              return (
                <div key={item.estado} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3.5">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${badge.bg} ${badge.text} ${badge.ring}`}>
                      {badge.label}
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">
                      {item.cantidad}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: badge.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
