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
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';

type EstadoPostulacion =
  | 'POSTULADO'
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'REVISADO'
  | 'ENTREVISTA'
  | 'CONTRATADO'
  | 'ACEPTADO'
  | 'RECHAZADO';

type Empresa = {
  nombreComercial?: string;
  razonSocial?: string;
};

type Oferta = {
  id?: string;
  titulo?: string;
  modalidad?: string;
  tipoContrato?: string;
  ubicacion?: string;
  empresa?: Empresa;
};

type Postulacion = {
  id: string;
  estado: EstadoPostulacion | string;
  createdAt?: string;
  fechaPostulacion?: string;
  oferta?: Oferta;
};

type PostulacionesData = {
  postulaciones: Postulacion[];
  total: number;
};

const ESTADOS = [
  'POSTULADO',
  'PENDIENTE',
  'EN_REVISION',
  'REVISADO',
  'ENTREVISTA',
  'CONTRATADO',
  'ACEPTADO',
  'RECHAZADO',
];

const ESTADO_LABELS: Record<string, string> = {
  POSTULADO: 'Postulado',
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  REVISADO: 'Revisado',
  ENTREVISTA: 'Entrevista',
  CONTRATADO: 'Contratado',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
};

const ESTADO_CLASSES: Record<string, string> = {
  POSTULADO:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  PENDIENTE:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  EN_REVISION:
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
  REVISADO:
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
  ENTREVISTA:
    'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
  CONTRATADO:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  ACEPTADO:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  RECHAZADO:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
};

function normalizePostulaciones(response: unknown): PostulacionesData {
  if (Array.isArray(response)) {
    return {
      postulaciones: response as Postulacion[],
      total: response.length,
    };
  }

  if (
    response &&
    typeof response === 'object' &&
    'postulaciones' in response &&
    Array.isArray((response as { postulaciones?: unknown }).postulaciones)
  ) {
    const data = response as PostulacionesData;

    return {
      postulaciones: data.postulaciones ?? [],
      total: data.total ?? data.postulaciones?.length ?? 0,
    };
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as { data?: unknown }).data)
  ) {
    const lista = (response as { data: Postulacion[] }).data;

    return {
      postulaciones: lista,
      total: lista.length,
    };
  }

  return {
    postulaciones: [],
    total: 0,
  };
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

function formatEstado(value?: string) {
  const safeValue = String(value || 'POSTULADO');
  return ESTADO_LABELS[safeValue] || safeValue.replace('_', ' ');
}

function getEstadoIcon(estado: string) {
  if (estado === 'CONTRATADO' || estado === 'ACEPTADO') {
    return <CheckCircle2 className="h-3.5 w-3.5" />;
  }

  if (estado === 'RECHAZADO') {
    return <XCircle className="h-3.5 w-3.5" />;
  }

  return <Clock className="h-3.5 w-3.5" />;
}

function EstadoBadge({ estado }: { estado: string }) {
  const safeEstado = estado || 'POSTULADO';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
        ESTADO_CLASSES[safeEstado] ||
        'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-white/10 dark:text-white/60 dark:ring-white/10'
      }`}
    >
      {getEstadoIcon(safeEstado)}
      {formatEstado(safeEstado)}
    </span>
  );
}

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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  color: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition group-hover:scale-110"
        style={{ backgroundColor: color }}
      />

      <div
        className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-white/80 dark:ring-white/10"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <div className="relative">
        <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          {value}
        </p>

        <p className="mt-0.5 text-sm font-black text-slate-600 dark:text-white/70">
          {title}
        </p>

        <p className="mt-0.5 text-xs font-semibold text-slate-400 dark:text-white/45">
          {subtitle}
        </p>
      </div>
    </article>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={5} className="px-5 py-4">
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

async function obtenerMisPostulaciones() {
  const api = postulacionesApi as any;

  if (typeof api.misPostulaciones === 'function') {
    return api.misPostulaciones();
  }

  if (typeof api.getMisPostulaciones === 'function') {
    return api.getMisPostulaciones();
  }

  if (typeof api.me === 'function') {
    return api.me();
  }

  if (typeof api.mis === 'function') {
    return api.mis();
  }

  if (typeof api.getAll === 'function') {
    return api.getAll({});
  }

  throw new Error(
    'No existe un método para cargar mis postulaciones en postulacionesApi.',
  );
}

export default function MisPostulacionesPage() {
  const [data, setData] = useState<PostulacionesData>({
    postulaciones: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cargarPostulaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await obtenerMisPostulaciones();
      setData(normalizePostulaciones(response));
    } catch (err) {
      console.error('Error al cargar mis postulaciones:', err);
      setError('No se pudieron cargar tus postulaciones.');
      setData({
        postulaciones: [],
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPostulaciones();
  }, [cargarPostulaciones]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return data.postulaciones.filter((postulacion) => {
      const texto = [
        postulacion.oferta?.titulo,
        postulacion.oferta?.empresa?.nombreComercial,
        postulacion.oferta?.empresa?.razonSocial,
        postulacion.oferta?.ubicacion,
        postulacion.estado,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = term ? texto.includes(term) : true;
      const matchEstado = estado ? postulacion.estado === estado : true;

      return matchSearch && matchEstado;
    });
  }, [data.postulaciones, search, estado]);

  const resumen = useMemo(() => {
    return {
      total: postulacionesFiltradas.length,
      revision: postulacionesFiltradas.filter((item) =>
        ['EN_REVISION', 'REVISADO', 'PENDIENTE', 'POSTULADO'].includes(
          String(item.estado),
        ),
      ).length,
      entrevistas: postulacionesFiltradas.filter(
        (item) => item.estado === 'ENTREVISTA',
      ).length,
      exitosas: postulacionesFiltradas.filter((item) =>
        ['CONTRATADO', 'ACEPTADO'].includes(String(item.estado)),
      ).length,
    };
  }, [postulacionesFiltradas]);

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
              <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Seguimiento personal
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
              Mis Postulaciones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Revisa el estado de tus postulaciones, las ofertas a las que
              aplicaste y las empresas asociadas.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPostulaciones}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={resumen.total}
          subtitle="Postulaciones realizadas"
          icon={Briefcase}
          color="#2563eb"
        />

        <StatCard
          title="En revisión"
          value={resumen.revision}
          subtitle="Pendientes de evaluación"
          icon={Clock}
          color="#f59e0b"
        />

        <StatCard
          title="Entrevistas"
          value={resumen.entrevistas}
          subtitle="Procesos activos"
          icon={CalendarDays}
          color="#6366f1"
        />

        <StatCard
          title="Aceptadas"
          value={resumen.exitosas}
          subtitle="Resultados positivos"
          icon={CheckCircle2}
          color="#10b981"
        />
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por oferta, empresa o ubicación..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-4 w-4" />}>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
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

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Historial de postulaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
              {loading
                ? 'Cargando postulaciones...'
                : `${postulacionesFiltradas.length} postulación(es) encontrada(s)`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
            <FileText className="h-3.5 w-3.5" />
            Mis procesos
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Oferta
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Empresa
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Modalidad
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
                postulacionesFiltradas.map((postulacion) => (
                  <tr
                    key={postulacion.id}
                    className="transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                          <Briefcase className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {postulacion.oferta?.titulo ||
                              'Oferta no disponible'}
                          </p>

                          <p className="truncate text-xs font-semibold text-slate-400 dark:text-white/45">
                            {postulacion.oferta?.ubicacion || 'Sin ubicación'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-white/75">
                        <Building2 className="h-4 w-4 text-slate-400 dark:text-white/45" />
                        {postulacion.oferta?.empresa?.nombreComercial ||
                          postulacion.oferta?.empresa?.razonSocial ||
                          '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-600 dark:text-white/65">
                          {postulacion.oferta?.modalidad || '—'}
                        </p>

                        <p className="text-xs font-semibold text-slate-400 dark:text-white/45">
                          {postulacion.oferta?.tipoContrato?.replace(
                            '_',
                            ' ',
                          ) || 'Contrato no especificado'}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <EstadoBadge estado={String(postulacion.estado)} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <span className="text-xs font-black text-slate-500 dark:text-white/55">
                        {formatDate(
                          postulacion.fechaPostulacion ??
                            postulacion.createdAt,
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/10">
                      <FileText className="h-7 w-7 text-slate-300 dark:text-white/35" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                      No tienes postulaciones registradas
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/55">
                      Cuando postules a una oferta laboral, aparecerá aquí el
                      seguimiento de tu proceso.
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
