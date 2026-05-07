'use client';

import { useEffect, useState } from 'react';
import { ofertasApi, postulacionesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Filter,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  CalendarDays,
  AlertTriangle,
  Info,
  X,
  Building2,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

const modalidadColors: Record<string, { bg: string; text: string; ring: string }> = {
  REMOTO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
  },
  HIBRIDO: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-300',
    ring: 'ring-indigo-500/20',
  },
  PRESENCIAL: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
  },
};

const estadoColors: Record<string, { bg: string; text: string; ring: string }> = {
  ACTIVA: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
  },
  CERRADA: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
  },
};

function formatShortDate(dateStr?: string) {
  if (!dateStr) return '—';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  });
}

function getDaysLeft(fechaFin?: string) {
  if (!fechaFin) return null;

  const endDate = new Date(fechaFin);

  if (Number.isNaN(endDate.getTime())) return null;

  return Math.ceil(
    (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );
}

function getDeadlineLabel(daysLeft: number | null) {
  if (daysLeft === null) return 'Sin fecha límite';
  if (daysLeft < 0) return 'Plazo vencido';
  if (daysLeft === 0) return 'Cierra hoy';
  if (daysLeft === 1) return 'Cierra mañana';
  return `${daysLeft} días restantes`;
}

function getDeadlineStyle(daysLeft: number | null, estado?: string) {
  if (estado !== 'ACTIVA') {
    return {
      className:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      icon: ShieldCheck,
    };
  }

  if (daysLeft === null) {
    return {
      className:
        'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]',
      icon: Info,
    };
  }

  if (daysLeft < 0) {
    return {
      className:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      icon: AlertTriangle,
    };
  }

  if (daysLeft <= 7) {
    return {
      className:
        'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      icon: AlertTriangle,
    };
  }

  return {
    className:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    icon: Info,
  };
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[46px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
    >
      {children}
    </select>
  );
}

function SmallBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

function InfoPill({
  icon: Icon,
  children,
  highlight = false,
  danger = false,
}: {
  icon: any;
  children: React.ReactNode;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
        danger
          ? 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          : highlight
            ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
            : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
          <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
          <div className="h-3 w-2/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <div className="h-7 w-24 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-7 w-28 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
      </div>
    </div>
  );
}

export default function OfertasPage() {
  const { user } = useAuthStore();

  const [ofertas, setOfertas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postuladas, setPostuladas] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: '',
    modalidad: '',
    estado: 'ACTIVA',
  });
  const [postulando, setPostulando] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);

    try {
      const res = await ofertasApi.list({ ...filters, take: 20 });
      setOfertas(res.ofertas);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters]);

  useEffect(() => {
    if (user?.role === 'EGRESADO') {
      postulacionesApi
        .misPostulaciones()
        .then((posts: any[]) =>
          setPostuladas(new Set(posts.map((p: any) => p.ofertaId)))
        )
        .catch(() => {});
    }
  }, [user]);

  const handlePostular = async (ofertaId: string) => {
    if (postuladas.has(ofertaId)) return;

    setPostulando(ofertaId);

    try {
      await postulacionesApi.postular(ofertaId);
      setPostuladas((prev) => new Set([...prev, ofertaId]));
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al postular');
    } finally {
      setPostulando(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      modalidad: '',
      estado: 'ACTIVA',
    });
  };

  const hasFilters =
    filters.search !== '' || filters.modalidad !== '' || filters.estado !== 'ACTIVA';

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-600" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Bolsa laboral
              </div>

              <h1 className="text-3xl font-display font-black tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                Ofertas Laborales
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
                Revisa oportunidades disponibles, filtra según tu perfil y postula de manera rápida y ordenada.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Resultados
                </p>
                <p className="mt-1 text-2xl font-black text-[var(--color-text-primary)]">
                  {total}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  ofertas encontradas
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Vista
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-black text-[var(--color-text-primary)]">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Profesional
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  claro / oscuro
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <Filter className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-display font-black tracking-tight text-[var(--color-text-primary)]">
                Filtros de búsqueda
              </h2>

              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Busca por título, empresa, ubicación, modalidad o estado.
              </p>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-bold text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:text-[var(--color-text-primary)] hover:shadow-sm"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              placeholder="Buscar por título, empresa, ubicación..."
              className="min-h-[46px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3 pl-11 pr-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <FilterSelect
            value={filters.modalidad}
            onChange={(value) =>
              setFilters((f) => ({ ...f, modalidad: value }))
            }
          >
            <option value="">Todas las modalidades</option>
            <option value="REMOTO">Remoto</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="PRESENCIAL">Presencial</option>
          </FilterSelect>

          <FilterSelect
            value={filters.estado}
            onChange={(value) => setFilters((f) => ({ ...f, estado: value }))}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="CERRADA">Cerradas</option>
          </FilterSelect>
        </div>
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ofertas.map((oferta) => {
            const mColors = modalidadColors[oferta.modalidad] || {
              bg: 'bg-[var(--color-bg-subtle)]',
              text: 'text-[var(--color-text-secondary)]',
              ring: 'ring-[var(--color-border)]',
            };

            const eColors = estadoColors[oferta.estado] || {
              bg: 'bg-[var(--color-bg-subtle)]',
              text: 'text-[var(--color-text-secondary)]',
              ring: 'ring-[var(--color-border)]',
            };

            const yaPostulado = postuladas.has(oferta.id);
            const daysLeft = getDaysLeft(oferta.fechaFin);
            const deadlineStyle = getDeadlineStyle(daysLeft, oferta.estado);
            const DeadlineIcon = deadlineStyle.icon;

            const isExpired = daysLeft !== null && daysLeft < 0;
            const canApply = oferta.estado === 'ACTIVA' && !isExpired;
            const isClosingSoon =
              oferta.estado === 'ACTIVA' &&
              daysLeft !== null &&
              daysLeft >= 0 &&
              daysLeft <= 7;

            return (
              <article
                key={oferta.id}
                className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600/80 via-indigo-600/70 to-slate-600/60 opacity-0 transition group-hover:opacity-100" />

                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-lg font-display font-black text-blue-700 dark:text-blue-300">
                    {oferta.empresa?.nombreComercial?.[0] || 'E'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <SmallBadge
                        className={`${eColors.bg} ${eColors.text} ${eColors.ring}`}
                      >
                        {oferta.estado}
                      </SmallBadge>

                      <SmallBadge
                        className={`${mColors.bg} ${mColors.text} ${mColors.ring}`}
                      >
                        {oferta.modalidad}
                      </SmallBadge>

                      {isClosingSoon && (
                        <SmallBadge className="bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Cierre próximo
                        </SmallBadge>
                      )}
                    </div>

                    <h3 className="line-clamp-2 text-base font-display font-black leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {oferta.titulo}
                    </h3>

                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)]">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {oferta.empresa?.nombreComercial || 'Empresa'}
                        {oferta.empresa?.sector && ` · ${oferta.empresa.sector}`}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 ${deadlineStyle.className}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/50 dark:bg-white/5">
                      <DeadlineIcon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">
                        Estado del plazo
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[var(--color-text-primary)] dark:text-current">
                        {getDeadlineLabel(daysLeft)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {oferta.ubicacion && (
                    <InfoPill icon={MapPin}>
                      {oferta.ubicacion}
                    </InfoPill>
                  )}

                  {(oferta.fechaInicio || oferta.fechaFin) && (
                    <InfoPill
                      icon={CalendarDays}
                      highlight={isClosingSoon}
                      danger={isExpired}
                    >
                      {formatShortDate(oferta.fechaInicio)} →{' '}
                      {formatShortDate(oferta.fechaFin)}
                    </InfoPill>
                  )}

                  {oferta.tipoContrato && (
                    <InfoPill icon={Briefcase}>
                      {oferta.tipoContrato.replace('_', ' ')}
                    </InfoPill>
                  )}

                  {(oferta.salarioMin || oferta.salarioMax) && (
                    <InfoPill icon={DollarSign}>
                      S/ {oferta.salarioMin ?? '—'} – {oferta.salarioMax ?? '—'}
                    </InfoPill>
                  )}

                  <InfoPill icon={Clock}>
                    {oferta._count?.postulaciones ?? 0} postulantes
                  </InfoPill>
                </div>

                {oferta.habilidades?.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-1.5">
                    {oferta.habilidades.slice(0, 4).map((h: any) => (
                      <span
                        key={h.habilidadId}
                        className="rounded-xl bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300"
                      >
                        {h.habilidad?.nombre}
                      </span>
                    ))}

                    {oferta.habilidades.length > 4 && (
                      <span className="rounded-xl bg-[var(--color-bg-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]">
                        +{oferta.habilidades.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`/dashboard/ofertas/${oferta.id}`}
                    className="inline-flex items-center gap-1 text-sm font-black text-blue-700 transition hover:gap-2 dark:text-blue-300"
                  >
                    Ver detalles
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {user?.role === 'EGRESADO' && (
                    <button
                      onClick={() => handlePostular(oferta.id)}
                      disabled={yaPostulado || postulando === oferta.id || !canApply}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                        yaPostulado
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : !canApply
                            ? 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                            : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {yaPostulado ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Postulado
                        </>
                      ) : postulando === oferta.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : !canApply ? (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Cerrada
                        </>
                      ) : (
                        'Postularme'
                      )}
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {ofertas.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <Briefcase className="h-8 w-8 text-[var(--color-text-muted)]" />
              </div>

              <h2 className="mt-5 text-xl font-display font-black text-[var(--color-text-primary)]">
                No se encontraron ofertas
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Intenta con otros filtros o cambia los criterios de búsqueda.
              </p>

              <button
                onClick={clearFilters}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Restablecer búsqueda
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
