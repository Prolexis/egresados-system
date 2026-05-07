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

type PostulacionesData = {
  postulaciones: any[];
  total: number;
};

const ESTADOS = [
  'PENDIENTE',
  'POSTULADO',
  'REVISADO',
  'EN_REVISION',
  'ENTREVISTA',
  'ACEPTADO',
  'CONTRATADO',
  'RECHAZADO',
];

function SelectWrapper({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}

      {children}

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </div>
  );
}

function getEstadoClasses(estadoActual: string) {
  const styles: Record<string, string> = {
    PENDIENTE:
      'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    POSTULADO:
      'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    REVISADO:
      'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    EN_REVISION:
      'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    ENTREVISTA:
      'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300',
    ACEPTADO:
      'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    CONTRATADO:
      'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    RECHAZADO:
      'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  };

  return (
    styles[estadoActual] ||
    'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] ring-[var(--color-border)]'
  );
}

function getEstadoIcon(estadoActual: string) {
  if (estadoActual === 'ACEPTADO' || estadoActual === 'CONTRATADO') {
    return <CheckCircle className="h-3.5 w-3.5" />;
  }

  if (estadoActual === 'RECHAZADO') {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock className="h-3.5 w-3.5" />;
}

function formatEstado(value?: string) {
  return String(value || 'PENDIENTE').replace('_', ' ');
}

function formatDate(value?: string) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getInitials(post: any) {
  const nombre = post.egresado?.nombre?.[0] || 'E';
  const apellido = post.egresado?.apellido?.[0] || 'G';

  return `${nombre}${apellido}`.toUpperCase();
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={5} className="px-5 py-4">
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
          </td>
        </tr>
      ))}
    </>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          {label}
        </p>

        <p className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text-primary)]">
          {value}
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function PostulacionesPage() {
  const [data, setData] = useState<PostulacionesData>({
    postulaciones: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');

  const loadPostulaciones = useCallback(() => {
    setLoading(true);

    postulacionesApi
      .getAll({ estado })
      .then((response: any) => {
        setData({
          postulaciones: Array.isArray(response?.postulaciones)
            ? response.postulaciones
            : Array.isArray(response)
              ? response
              : [],
          total:
            typeof response?.total === 'number'
              ? response.total
              : Array.isArray(response?.postulaciones)
                ? response.postulaciones.length
                : Array.isArray(response)
                  ? response.length
                  : 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [estado]);

  useEffect(() => {
    loadPostulaciones();
  }, [loadPostulaciones]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return data.postulaciones ?? [];

    return (data.postulaciones ?? []).filter((post: any) => {
      const searchableText = [
        post.egresado?.nombre,
        post.egresado?.apellido,
        post.egresado?.carrera,
        post.oferta?.titulo,
        post.oferta?.empresa?.nombreComercial,
        post.estado,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [data.postulaciones, search]);

  const tieneFiltros = search.trim() !== '' || estado !== '';

  const limpiarFiltros = () => {
    setSearch('');
    setEstado('');
  };

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Seguimiento laboral
              </div>

              <h1 className="text-3xl font-display font-black tracking-tight text-[var(--color-text-primary)] md:text-4xl">
                Postulaciones
              </h1>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
                Revisa las postulaciones registradas por los egresados, el estado de cada proceso y las empresas asociadas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <StatCard
                label="Total registrado"
                value={data.total ?? 0}
                description="postulaciones en el sistema"
              />

              <StatCard
                label="Resultado visible"
                value={postulacionesFiltradas.length}
                description="según filtros aplicados"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadPostulaciones}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-bold text-[var(--color-text-secondary)]">
              <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
              Panel de control de postulantes
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <Filter className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-display font-black tracking-tight text-[var(--color-text-primary)]">
                Filtros de búsqueda
              </h2>

              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Filtra por egresado, carrera, oferta, empresa o estado del proceso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!tieneFiltros}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-2.5 text-sm font-black text-[var(--color-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:text-[var(--color-text-primary)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por egresado, oferta o empresa..."
              className="min-h-[48px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3 pl-11 pr-12 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <SelectWrapper icon={<Filter className="h-4 w-4" />}>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="min-h-[48px] w-full appearance-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3 pl-11 pr-11 text-sm font-bold text-[var(--color-text-primary)] outline-none transition-all focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Todos los estados</option>

              {ESTADOS.map((item) => (
                <option key={item} value={item}>
                  {formatEstado(item)}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Procesos laborales
            </div>

            <h2 className="text-lg font-display font-black text-[var(--color-text-primary)]">
              Directorio de postulaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
              {loading
                ? 'Cargando postulaciones...'
                : `${postulacionesFiltradas.length} postulación(es) encontrada(s)`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-[var(--color-bg-surface)]">
          <table className="w-full min-w-[1050px] border-separate border-spacing-y-2 px-3 py-3">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Egresado
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Oferta
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Empresa
                </th>

                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((post: any) => (
                  <tr key={post.id} className="group">
                    <td className="rounded-l-3xl border-y border-l border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 transition group-hover:bg-[var(--color-bg-surface)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-sm font-black text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                          {getInitials(post)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-[var(--color-text-primary)]">
                            {post.egresado?.nombre || 'Sin nombre'}{' '}
                            {post.egresado?.apellido || ''}
                          </p>

                          <p className="truncate text-xs font-semibold text-[var(--color-text-muted)]">
                            {post.egresado?.carrera || 'Sin carrera registrada'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="max-w-xs truncate text-sm font-black text-[var(--color-text-primary)]">
                        {post.oferta?.titulo || 'Sin oferta'}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                        Oferta laboral registrada
                      </p>
                    </td>

                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {post.oferta?.empresa?.nombreComercial || '—'}
                      </p>
                    </td>

                    <td className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 transition group-hover:bg-[var(--color-bg-surface)]">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getEstadoClasses(
                            post.estado,
                          )}`}
                        >
                          {getEstadoIcon(post.estado)}
                          {formatEstado(post.estado)}
                        </span>
                      </div>
                    </td>

                    <td className="rounded-r-3xl border-y border-r border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-5 py-4 text-right transition group-hover:bg-[var(--color-bg-surface)]">
                      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        {formatDate(post.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <UserRound className="h-8 w-8 text-[var(--color-text-muted)]" />
                    </div>

                    <h3 className="mt-4 text-lg font-display font-black text-[var(--color-text-primary)]">
                      No se encontraron postulaciones
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                      Intenta seleccionar otro estado o verifica si ya existen postulaciones registradas en el sistema.
                    </p>

                    {tieneFiltros && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md"
                      >
                        <X className="h-4 w-4" />
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
