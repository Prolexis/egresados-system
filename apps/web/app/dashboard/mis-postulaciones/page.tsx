'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { postulacionesApi } from '@/lib/api';
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
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
        'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
      }`}
    >
      {getEstadoIcon(safeEstado)}
      {ESTADO_LABELS[safeEstado] || safeEstado.replace('_', ' ')}
    </span>
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
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-white/60 dark:ring-white/10"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <div className="relative">
        <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-sm font-black text-slate-600 dark:text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
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
          <td colSpan={5} className="px-6 py-4">
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
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

  throw new Error('No existe un método para cargar mis postulaciones en postulacionesApi.');
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

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 text-white shadow-xl dark:border-slate-700">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-24 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/75">
              <FileText className="h-4 w-4 text-blue-300" />
              Seguimiento personal
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              Mis Postulaciones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Revisa el estado de tus postulaciones, las ofertas a las que
              aplicaste y las empresas asociadas.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarPostulaciones}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por oferta, empresa o ubicación..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            >
              <option value="">Todos los estados</option>

              {ESTADOS.map((item) => (
                <option key={item} value={item}>
                  {ESTADO_LABELS[item] || item.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Historial de postulaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
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
            <thead className="bg-slate-50 dark:bg-slate-950/70">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Oferta
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Empresa
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Modalidad
                </th>

                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Estado
                </th>

                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((postulacion) => (
                  <tr
                    key={postulacion.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 text-blue-700 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-800 dark:text-blue-300 dark:ring-slate-700">
                          <Briefcase className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {postulacion.oferta?.titulo || 'Oferta no disponible'}
                          </p>

                          <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {postulacion.oferta?.ubicacion || 'Sin ubicación'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200">
                        <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        {postulacion.oferta?.empresa?.nombreComercial ||
                          postulacion.oferta?.empresa?.razonSocial ||
                          '—'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {postulacion.oferta?.modalidad || '—'}
                        </p>

                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          {postulacion.oferta?.tipoContrato?.replace('_', ' ') ||
                            'Contrato no especificado'}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <EstadoBadge estado={String(postulacion.estado)} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                        {formatDate(
                          postulacion.fechaPostulacion ?? postulacion.createdAt,
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800">
                      <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                      No tienes postulaciones registradas
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Cuando postules a una oferta laboral, aparecerá aquí el
                      seguimiento de tu proceso.
                    </p>
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