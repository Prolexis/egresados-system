'use client';

import { useEffect, useMemo, useState } from 'react';
import { estadisticasApi, egresadosApi } from '@/lib/api';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Briefcase,
  ArrowRight,
  UserRound,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

const estadoBadge: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  POSTULADO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
    label: 'Postulado',
  },
  EN_REVISION: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-500/20',
    label: 'En Revisión',
  },
  ENTREVISTA: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    ring: 'ring-fuchsia-500/20',
    label: 'Entrevista',
  },
  CONTRATADO: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    label: 'Contratado ✓',
  },
  RECHAZADO: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
    label: 'Rechazado',
  },
};

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:scale-125"
        style={{ background: color }}
      />

      <div
        className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-110"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <p className="relative text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>

      <p className="relative mt-1 text-xs font-bold text-[var(--color-text-muted)]">
        {label}
      </p>
    </article>
  );
}

export default function EgresadoDashboard() {
  const [data, setData] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    estadisticasApi.egresado().then(setData).catch(console.error);
    egresadosApi.me().then(setPerfil).catch(console.error);
  }, []);

  const stats = data?.stats;

  const historial = useMemo(() => data?.historialPostulaciones || [], [data]);
  const recomendaciones = useMemo(() => data?.recomendaciones || [], [data]);

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 shadow-sm dark:border-white/10 dark:bg-white/10">
              <UserRound className="h-8 w-8 text-blue-700 dark:text-white" />
            </div>

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Bienvenido de vuelta
              </div>

              <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
                {perfil ? `${perfil.nombre} ${perfil.apellido}` : 'Cargando perfil...'}
              </h1>

              <p className="mt-3 text-sm font-medium leading-6 text-slate-600 dark:text-white/70">
                {perfil?.carrera || 'Carrera pendiente'} • Cohorte {perfil?.anioEgreso || '—'}
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/mi-perfil"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
          >
            Editar perfil
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard
          label="Postulaciones"
          value={stats?.total ?? '–'}
          icon={BookOpen}
          color="#2563EB"
        />

        <StatCard
          label="En Revisión"
          value={stats?.enRevision ?? '–'}
          icon={Clock}
          color="#F59E0B"
        />

        <StatCard
          label="Entrevistas"
          value={stats?.entrevistas ?? '–'}
          icon={Star}
          color="#BE185D"
        />

        <StatCard
          label="Contratado"
          value={stats?.contratado ?? '–'}
          icon={CheckCircle2}
          color="#10B981"
        />

        <StatCard
          label="Tasa respuesta"
          value={
            stats
              ? `${stats.total > 0 ? Math.round(((stats.total - stats.rechazado) / stats.total) * 100) : 0}%`
              : '–'
          }
          icon={Briefcase}
          color="#EF4444"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Ofertas recomendadas
              </h3>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Basadas en tus habilidades
              </p>
            </div>

            <Link
              href="/dashboard/ofertas"
              className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
            >
              Ver todas →
            </Link>
          </div>

          <div className="space-y-3">
            {recomendaciones.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-10 text-center">
                <Briefcase className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-muted)] opacity-60" />
                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                  Completa tu perfil para ver recomendaciones
                </p>
              </div>
            )}

            {recomendaciones.slice(0, 4).map((oferta: any) => (
              <Link
                key={oferta.id}
                href={`/dashboard/ofertas/${oferta.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 transition hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-500/10 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-sm font-display font-extrabold text-blue-700 dark:text-blue-300">
                  {oferta.empresa?.nombreComercial?.[0] || 'E'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-[var(--color-text-primary)]">
                    {oferta.titulo}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                    {oferta.empresa?.nombreComercial} · {oferta.modalidad}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] transition group-hover:translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Estado de postulaciones
              </h3>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Distribución actual
              </p>
            </div>

            <Link
              href="/dashboard/mis-postulaciones"
              className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
            >
              Ver detalles →
            </Link>
          </div>

          <div className="space-y-4">
            {historial.map((item: any) => {
              const badge =
                estadoBadge[item.estado] || {
                  bg: 'bg-[var(--color-bg-subtle)]',
                  text: 'text-[var(--color-text-secondary)]',
                  ring: 'ring-[var(--color-border)]',
                  label: item.estado,
                };

              const maxVal = Math.max(...historial.map((h: any) => h.cantidad), 1);

              return (
                <div
                  key={item.estado}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${badge.bg} ${badge.text} ${badge.ring}`}
                    >
                      {badge.label}
                    </span>

                    <span className="font-black text-[var(--color-text-primary)]">
                      {item.cantidad}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-bg-surface)]">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-700"
                      style={{ width: `${(item.cantidad / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {!historial.length && (
              <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-10 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-[var(--color-text-muted)] opacity-60" />

                <p className="text-sm font-bold text-[var(--color-text-muted)]">
                  Sin postulaciones aún
                </p>

                <Link
                  href="/dashboard/ofertas"
                  className="mt-2 block text-xs font-black text-blue-700 dark:text-blue-300"
                >
                  Explorar ofertas →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}