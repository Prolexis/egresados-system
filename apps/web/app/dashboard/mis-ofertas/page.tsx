'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ofertasApi } from '@/lib/api';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';

const modalidadColors: Record<string, { bg: string; text: string; ring: string }> = {
  REMOTO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
  },
  HIBRIDO: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    ring: 'ring-fuchsia-500/20',
  },
  PRESENCIAL: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
  },
};

const estadoColors: Record<string, { bg: string; text: string; ring: string; icon: any }> = {
  ACTIVA: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    icon: CheckCircle2,
  },
  CERRADA: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
    icon: XCircle,
  },
};

function Badge({
  children,
  config,
}: {
  children: ReactNode;
  config: { bg: string; text: string; ring: string };
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${config.bg} ${config.text} ${config.ring}`}
    >
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:scale-125"
        style={{ background: color }}
      />

      <div
        className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <p className="relative text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="relative mt-1 text-sm font-bold text-[var(--color-text-secondary)]">
        {title}
      </p>
    </article>
  );
}

export default function MisOfertasPage() {
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await ofertasApi.misOfertas();
      setOfertas(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ofertasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return ofertas;

    return ofertas.filter((oferta) => {
      const texto = [
        oferta.titulo,
        oferta.estado,
        oferta.modalidad,
        oferta.tipoContrato,
        oferta.ubicacion,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return texto.includes(term);
    });
  }, [ofertas, search]);

  const resumen = useMemo(() => {
    return {
      total: ofertas.length,
      activas: ofertas.filter((oferta) => oferta.estado === 'ACTIVA').length,
      postulantes: ofertas.reduce(
        (acc, oferta) => acc + (oferta._count?.postulaciones ?? 0),
        0,
      ),
      remotas: ofertas.filter((oferta) => oferta.modalidad === 'REMOTO').length,
    };
  }, [ofertas]);

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Gestión de oportunidades
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Mis Ofertas
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Administra tus ofertas laborales, revisa postulantes y controla el estado de cada proceso.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            <Link
              href="/dashboard/mis-ofertas/nueva"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              Nueva Oferta
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard title="Total ofertas" value={resumen.total} icon={Briefcase} color="#2563EB" />
        <StatCard title="Activas" value={resumen.activas} icon={CheckCircle2} color="#10B981" />
        <StatCard title="Postulantes" value={resumen.postulantes} icon={Users} color="#EF4444" />
        <StatCard title="Remotas" value={resumen.remotas} icon={MapPin} color="#7C3AED" />
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, estado, modalidad, contrato o ubicación..."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3 pl-11 pr-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      ) : ofertasFiltradas.length > 0 ? (
        <section className="grid grid-cols-1 gap-4">
          {ofertasFiltradas.map((oferta) => {
            const mColors =
              modalidadColors[oferta.modalidad] || {
                bg: 'bg-[var(--color-bg-subtle)]',
                text: 'text-[var(--color-text-secondary)]',
                ring: 'ring-[var(--color-border)]',
              };

            const eColors =
              estadoColors[oferta.estado] || {
                bg: 'bg-[var(--color-bg-subtle)]',
                text: 'text-[var(--color-text-secondary)]',
                ring: 'ring-[var(--color-border)]',
                icon: Clock,
              };

            const EstadoIcon = eColors.icon;

            return (
              <article
                key={oferta.id}
                className="group overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge config={eColors}>
                        <EstadoIcon className="mr-1.5 h-3.5 w-3.5" />
                        {oferta.estado}
                      </Badge>

                      <Badge config={mColors}>{oferta.modalidad}</Badge>
                    </div>

                    <h3 className="text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                      {oferta.titulo}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-[var(--color-text-secondary)]">
                      {oferta.ubicacion && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                          {oferta.ubicacion}
                        </span>
                      )}

                      {oferta.tipoContrato && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                          {oferta.tipoContrato.replace(/_/g, ' ')}
                        </span>
                      )}

                      {(oferta.salarioMin || oferta.salarioMax) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                          S/ {oferta.salarioMin ?? '—'} – {oferta.salarioMax ?? '—'}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                        <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                        {oferta._count?.postulaciones ?? 0} postulantes
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/candidatos?oferta=${oferta.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white hover:shadow-lg dark:text-blue-300 dark:hover:text-white"
                  >
                    Ver candidatos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <Briefcase className="h-8 w-8 text-[var(--color-text-muted)]" />
          </div>

          <h2 className="mt-5 text-xl font-display font-extrabold text-[var(--color-text-primary)]">
            No tienes ofertas para mostrar
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            Crea tu primera oferta laboral para empezar a recibir candidatos.
          </p>

          <Link
            href="/dashboard/mis-ofertas/nueva"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Crear oferta
          </Link>
        </section>
      )}
    </main>
  );
}
