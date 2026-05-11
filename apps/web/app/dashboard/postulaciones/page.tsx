'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { postulacionesApi } from '@/lib/api';
import {
  Briefcase,
  CheckCircle,
  ChevronDown,
  Clock,
  Filter,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type PostulacionesData = { postulaciones: any[]; total: number };

const ESTADOS = [
  'PENDIENTE', 'POSTULADO', 'REVISADO', 'EN_REVISION',
  'ENTREVISTA', 'ACEPTADO', 'CONTRATADO', 'RECHAZADO',
];

/* ─── Helpers ──────────────────────────────────────────────────── */
function getEstadoClasses(e: string) {
  const s: Record<string, string> = {
    PENDIENTE:   'bg-amber-500/10   text-amber-700   ring-amber-500/20   dark:text-amber-300',
    POSTULADO:   'bg-amber-500/10   text-amber-700   ring-amber-500/20   dark:text-amber-300',
    REVISADO:    'bg-blue-500/10    text-blue-700    ring-blue-500/20    dark:text-blue-300',
    EN_REVISION: 'bg-blue-500/10    text-blue-700    ring-blue-500/20    dark:text-blue-300',
    ENTREVISTA:  'bg-indigo-500/10  text-indigo-700  ring-indigo-500/20  dark:text-indigo-300',
    ACEPTADO:    'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    CONTRATADO:  'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    RECHAZADO:   'bg-rose-500/10    text-rose-700    ring-rose-500/20    dark:text-rose-300',
  };
  return s[e] || 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] ring-[var(--color-border)]';
}

function getEstadoIcon(e: string) {
  if (e === 'ACEPTADO' || e === 'CONTRATADO') return <CheckCircle className="h-3 w-3" />;
  if (e === 'RECHAZADO') return <XCircle className="h-3 w-3" />;
  return <Clock className="h-3 w-3" />;
}

const formatEstado = (v?: string) => String(v || 'PENDIENTE').replace('_', ' ');

function formatDate(v?: string) {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function getInitials(post: any) {
  return `${post.egresado?.nombre?.[0] || 'E'}${post.egresado?.apellido?.[0] || 'G'}`.toUpperCase();
}

/* ─── Sub-components ───────────────────────────────────────────── */
function SelectWrapper({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}
      {children}
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </div>
  );
}

function StatCard({ label, value, description }: { label: string; value: string | number; description: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{value}</p>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={5} className="px-4 py-2.5">
            <div className="h-14 w-full animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
          </td>
        </tr>
      ))}
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function PostulacionesPage() {
  const [data, setData]     = useState<PostulacionesData>({ postulaciones: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [estado, setEstado]   = useState('');

  const loadPostulaciones = useCallback(() => {
    setLoading(true);
    postulacionesApi
      .getAll({ estado })
      .then((response: any) => {
        setData({
          postulaciones: Array.isArray(response?.postulaciones) ? response.postulaciones
            : Array.isArray(response) ? response : [],
          total: typeof response?.total === 'number' ? response.total
            : Array.isArray(response?.postulaciones) ? response.postulaciones.length
            : Array.isArray(response) ? response.length : 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [estado]);

  useEffect(() => { loadPostulaciones(); }, [loadPostulaciones]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data.postulaciones ?? [];
    return (data.postulaciones ?? []).filter((post: any) =>
      [post.egresado?.nombre, post.egresado?.apellido, post.egresado?.carrera,
        post.oferta?.titulo, post.oferta?.empresa?.nombreComercial, post.estado]
        .filter(Boolean).join(' ').toLowerCase().includes(term),
    );
  }, [data.postulaciones, search]);

  const tieneFiltros = search.trim() !== '' || estado !== '';
  const limpiarFiltros = () => { setSearch(''); setEstado(''); };

  return (
    <main className="space-y-4">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <Briefcase className="h-3 w-3 text-blue-500" />
              Seguimiento laboral
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Postulaciones
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--color-text-secondary)]">
              Revisa las postulaciones registradas por los egresados, el estado de cada proceso y las empresas asociadas.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row xl:min-w-[360px]">
            <StatCard label="Total registrado" value={data.total ?? 0} description="postulaciones en el sistema" />
            <StatCard label="Resultado visible" value={postulacionesFiltradas.length} description="según filtros aplicados" />
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadPostulaciones}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3.5 py-2 text-[13px] text-[var(--color-text-secondary)]">
            <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            Panel de control de postulantes
          </div>
        </div>
      </section>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">Filtros de búsqueda</h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">Filtra por egresado, carrera, oferta, empresa o estado.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!tieneFiltros}
            className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3.5 py-2 text-[12px] font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por egresado, oferta o empresa..."
              className="min-h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-10 text-[13px] text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Estado select */}
          <SelectWrapper icon={<Filter className="h-3.5 w-3.5" />}>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-10 text-[13px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(item => (
                <option key={item} value={item}>{formatEstado(item)}</option>
              ))}
            </select>
          </SelectWrapper>
        </div>
      </section>

      {/* ── Tabla ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">

        {/* Table header */}
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <Briefcase className="h-3 w-3 text-blue-500" />
              Procesos laborales
            </div>
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Directorio de postulaciones</h2>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
              {loading ? 'Cargando postulaciones...' : `${postulacionesFiltradas.length} postulación(es) encontrada(s)`}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-1.5 px-3 py-3">
            <thead>
              <tr>
                {['Egresado', 'Oferta', 'Empresa', 'Estado', 'Fecha'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] ${
                      i === 3 ? 'text-center' : i === 4 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((post: any) => (
                  <tr key={post.id} className="group">

                    {/* Egresado */}
                    <td className="rounded-l-xl border-y border-l border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 transition group-hover:bg-[var(--color-bg-surface)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                          {getInitials(post)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                            {post.egresado?.nombre || 'Sin nombre'} {post.egresado?.apellido || ''}
                          </p>
                          <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                            {post.egresado?.carrera || 'Sin carrera registrada'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Oferta */}
                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="max-w-[200px] truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                        {post.oferta?.titulo || 'Sin oferta'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">Oferta laboral</p>
                    </td>

                    {/* Empresa */}
                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="text-[13px] text-[var(--color-text-secondary)]">
                        {post.oferta?.empresa?.nombreComercial || '—'}
                      </p>
                    </td>

                    {/* Estado */}
                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 transition group-hover:bg-[var(--color-bg-surface)]">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getEstadoClasses(post.estado)}`}>
                          {getEstadoIcon(post.estado)}
                          {formatEstado(post.estado)}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="rounded-r-xl border-y border-r border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-right transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        {formatDate(post.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <UserRound className="h-6 w-6 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-text-primary)]">
                      No se encontraron postulaciones
                    </h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-[var(--color-text-muted)]">
                      Intenta seleccionar otro estado o verifica si ya existen postulaciones en el sistema.
                    </p>
                    {tieneFiltros && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500"
                      >
                        <X className="h-3.5 w-3.5" />
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
