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
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 dark:text-white/45">
          {icon}
        </div>
      )}

      {children}

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />
    </div>
  );
}

function getEstadoClasses(estadoActual: string) {
  const styles: Record<string, string> = {
    PENDIENTE:
      'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
    POSTULADO:
      'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
    REVISADO:
      'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
    EN_REVISION:
      'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
    ENTREVISTA:
      'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
    ACEPTADO:
      'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
    CONTRATADO:
      'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
    RECHAZADO:
      'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
  };

  return (
    styles[estadoActual] ||
    'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-white/10 dark:text-white/60 dark:ring-white/10'
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
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
          </td>
        </tr>
      ))}
    </>
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
    <main className="space-y-5 animate-fadeIn">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 px-6 py-5 shadow-md shadow-blue-100/50 dark:border-slate-700 dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:shadow-none">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_35%)] dark:bg-none" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Briefcase className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Seguimiento laboral
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
              Postulaciones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Revisa las postulaciones registradas por los egresados, el estado
              de cada proceso y las empresas asociadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-blue-100 bg-white px-5 py-2.5 shadow-md shadow-blue-100 dark:border-white/10 dark:bg-white/10 dark:shadow-none">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-white/45">
                Total registrado
              </p>

              <p className="mt-0.5 text-2xl font-black text-slate-950 dark:text-white">
                {data.total ?? 0}
              </p>
            </div>

            <button
              type="button"
              onClick={loadPostulaciones}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por egresado, oferta o empresa..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-4 w-4" />}>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            >
              <option value="">Todos los estados</option>

              {ESTADOS.map((item) => (
                <option key={item} value={item}>
                  {formatEstado(item)}
                </option>
              ))}
            </select>
          </SelectWrapper>

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!tieneFiltros}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Directorio de postulaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
              {loading
                ? 'Cargando postulaciones...'
                : `${postulacionesFiltradas.length} postulación(es) encontrada(s)`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
            <Briefcase className="h-3.5 w-3.5" />
            Procesos laborales
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Egresado
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Oferta
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Empresa
                </th>

                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Estado
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((post: any) => (
                  <tr
                    key={post.id}
                    className="transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                          {getInitials(post)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {post.egresado?.nombre || 'Sin nombre'}{' '}
                            {post.egresado?.apellido || ''}
                          </p>

                          <p className="truncate text-xs font-semibold text-slate-400 dark:text-white/45">
                            {post.egresado?.carrera || 'Sin carrera registrada'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate text-sm font-black text-slate-900 dark:text-white">
                        {post.oferta?.titulo || 'Sin oferta'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-500 dark:text-white/55">
                        {post.oferta?.empresa?.nombreComercial || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
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

                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-500 dark:text-white/55">
                        {formatDate(post.createdAt)}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/10">
                      <UserRound className="h-7 w-7 text-slate-300 dark:text-white/35" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                      No se encontraron postulaciones
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/55">
                      Intenta seleccionar otro estado o verifica si ya existen
                      postulaciones registradas en el sistema.
                    </p>

                    {tieneFiltros && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-blue-700"
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
