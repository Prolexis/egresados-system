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

export default function OfertasPage() {
  const { user } = useAuthStore();
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [postuladas, setPostuladas] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ search: '', modalidad: '', estado: 'ACTIVA' });
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

  useEffect(() => { load(); }, [filters]);

  useEffect(() => {
    if (user?.role === 'EGRESADO') {
      postulacionesApi.misPostulaciones()
        .then((posts: any[]) => setPostuladas(new Set(posts.map((p: any) => p.ofertaId))))
        .catch(() => {});
    }
  }, []);

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

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Bolsa laboral
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Ofertas Laborales
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              {total} oportunidades disponibles para revisar, filtrar y postular según tu perfil profesional.
            </p>
          </div>

          <div className="hidden rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/10 lg:block">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white/45">
              Estado
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Ofertas disponibles
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h2 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Filtros de búsqueda
            </h2>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              Busca por título, empresa, ubicación, modalidad o estado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Buscar por título, empresa, ubicación..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3 pl-11 pr-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={filters.modalidad}
            onChange={(e) => setFilters((f) => ({ ...f, modalidad: e.target.value }))}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">Todas las modalidades</option>
            <option value="REMOTO">Remoto</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="PRESENCIAL">Presencial</option>
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="CERRADA">Cerradas</option>
          </select>
        </div>
      </section>

      {loading ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
                  <div className="h-3 w-2/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ofertas.map((oferta) => {
            const mColors =
              modalidadColors[oferta.modalidad] || {
                bg: 'bg-[var(--color-bg-subtle)]',
                text: 'text-[var(--color-text-secondary)]',
                ring: 'ring-[var(--color-border)]',
              };

            const yaPostulado = postuladas.has(oferta.id);

            return (
              <Link
                key={oferta.id}
                href={`/dashboard/ofertas/${oferta.id}`}
                className="group block rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[var(--shadow-lg)]"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-lg font-display font-extrabold text-blue-700 dark:text-blue-300">
                    {oferta.empresa?.nombreComercial?.[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-display font-extrabold leading-tight text-[var(--color-text-primary)] transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      {oferta.titulo}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
                      {oferta.empresa?.nombreComercial} · {oferta.empresa?.sector}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${mColors.bg} ${mColors.text} ${mColors.ring}`}
                  >
                    {oferta.modalidad}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                  {oferta.ubicacion && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      {oferta.ubicacion}
                    </span>
                  )}

                  {oferta.tipoContrato && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      {oferta.tipoContrato.replace('_', ' ')}
                    </span>
                  )}

                  {(oferta.salarioMin || oferta.salarioMax) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                      S/ {oferta.salarioMin} – {oferta.salarioMax}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    {oferta._count?.postulaciones} postulantes
                  </span>
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

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-sm font-black text-blue-700 transition group-hover:gap-2 dark:text-blue-300">
                    Ver detalles
                    <ArrowRight className="h-4 w-4" />
                  </span>

                  {user?.role === 'EGRESADO' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePostular(oferta.id);
                      }}
                      disabled={yaPostulado || postulando === oferta.id || oferta.estado !== 'ACTIVA'}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                        yaPostulado
                          ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : oferta.estado !== 'ACTIVA'
                            ? 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                            : 'border-blue-400/20 bg-blue-600 text-white hover:bg-blue-500'
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
                      ) : oferta.estado !== 'ACTIVA' ? (
                        'Oferta cerrada'
                      ) : (
                        'Postularme'
                      )}
                    </button>
                  )}
                </div>
              </Link>
            );
          })}

          {ofertas.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <Briefcase className="h-8 w-8 text-[var(--color-text-muted)]" />
              </div>

              <h2 className="mt-5 text-xl font-display font-extrabold text-[var(--color-text-primary)]">
                No se encontraron ofertas
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Intenta con otros filtros o cambia los criterios de búsqueda.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}