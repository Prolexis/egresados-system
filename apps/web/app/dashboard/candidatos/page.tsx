'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ofertasApi, postulacionesApi } from '@/lib/api';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CheckCircle,
  Clock,
  Filter,
  GraduationCap,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react';

type EstadoPostulacion =
  | 'PENDIENTE'
  | 'REVISADO'
  | 'ENTREVISTA'
  | 'ACEPTADO'
  | 'RECHAZADO';

type Oferta = {
  id: string;
  titulo: string;
  _count?: {
    postulaciones?: number;
  };
};

type Egresado = {
  id?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  carrera?: string;
  anioEgreso?: number;
  telefono?: string;
  user?: {
    email?: string;
  };
};

type Postulacion = {
  id: string;
  estado: EstadoPostulacion | string;
  egresado?: Egresado;
  createdAt?: string;
  fechaPostulacion?: string;
};

const ESTADOS: EstadoPostulacion[] = [
  'PENDIENTE',
  'REVISADO',
  'ENTREVISTA',
  'ACEPTADO',
  'RECHAZADO',
];

const ESTADO_LABELS: Record<EstadoPostulacion, string> = {
  PENDIENTE: 'Pendiente',
  REVISADO: 'Revisado',
  ENTREVISTA: 'Entrevista',
  ACEPTADO: 'Aceptado',
  RECHAZADO: 'Rechazado',
};

const ESTADO_STYLES: Record<EstadoPostulacion, string> = {
  PENDIENTE:
    'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  REVISADO:
    'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
  ENTREVISTA:
    'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
  ACEPTADO:
    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  RECHAZADO:
    'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
};

function isEstadoPostulacion(value: string): value is EstadoPostulacion {
  return ESTADOS.includes(value as EstadoPostulacion);
}

function normalizeOfertas(response: unknown): Oferta[] {
  if (Array.isArray(response)) return response as Oferta[];

  if (
    response &&
    typeof response === 'object' &&
    'ofertas' in response &&
    Array.isArray((response as { ofertas?: unknown }).ofertas)
  ) {
    return (response as { ofertas: Oferta[] }).ofertas;
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as { data?: unknown }).data)
  ) {
    return (response as { data: Oferta[] }).data;
  }

  return [];
}

function normalizePostulaciones(response: unknown): Postulacion[] {
  if (Array.isArray(response)) return response as Postulacion[];

  if (
    response &&
    typeof response === 'object' &&
    'postulaciones' in response &&
    Array.isArray((response as { postulaciones?: unknown }).postulaciones)
  ) {
    return (response as { postulaciones: Postulacion[] }).postulaciones;
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as { data?: unknown }).data)
  ) {
    return (response as { data: Postulacion[] }).data;
  }

  return [];
}

function getInitials(nombre?: string, apellido?: string) {
  const first = nombre?.trim()?.charAt(0) ?? '';
  const second = apellido?.trim()?.charAt(0) ?? '';

  return `${first}${second}`.toUpperCase() || 'EG';
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
  if (estado === 'ACEPTADO') return <CheckCircle className="h-3.5 w-3.5" />;
  if (estado === 'RECHAZADO') return <XCircle className="h-3.5 w-3.5" />;

  return <Clock className="h-3.5 w-3.5" />;
}

function EstadoBadge({ estado }: { estado: string }) {
  const safeEstado = isEstadoPostulacion(estado) ? estado : 'PENDIENTE';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${ESTADO_STYLES[safeEstado]}`}
    >
      {getEstadoIcon(safeEstado)}
      {ESTADO_LABELS[safeEstado]}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: string;
  icon: any;
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
      {Array.from({ length: 7 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={6} className="px-6 py-4">
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function CandidatosPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [selectedOferta, setSelectedOferta] = useState('');
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadPostulaciones = useCallback(async (ofertaId: string) => {
    if (!ofertaId) {
      setPostulaciones([]);
      setLoadingPostulaciones(false);
      return;
    }

    try {
      setLoadingPostulaciones(true);
      setError(null);

      const response = await postulacionesApi.porOferta(ofertaId);
      setPostulaciones(normalizePostulaciones(response));
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
      setError('No se pudieron cargar los candidatos de esta oferta.');
      setPostulaciones([]);
    } finally {
      setLoadingPostulaciones(false);
    }
  }, []);

  const loadOfertas = useCallback(async () => {
    try {
      setLoadingOfertas(true);
      setError(null);

      const response = await ofertasApi.misOfertas();
      const listaOfertas = normalizeOfertas(response);

      setOfertas(listaOfertas);

      let ofertaDesdeUrl = '';

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        ofertaDesdeUrl = params.get('oferta') ?? '';
      }

      const existeOfertaUrl = listaOfertas.some(
        (oferta) => oferta.id === ofertaDesdeUrl,
      );

      const ofertaInicial = existeOfertaUrl
        ? ofertaDesdeUrl
        : listaOfertas[0]?.id ?? '';

      setSelectedOferta(ofertaInicial);

      if (!ofertaInicial) {
        setPostulaciones([]);
      }
    } catch (err) {
      console.error('Error al cargar ofertas:', err);
      setError('No se pudieron cargar tus ofertas laborales.');
      setOfertas([]);
      setPostulaciones([]);
    } finally {
      setLoadingOfertas(false);
    }
  }, []);

  useEffect(() => {
    loadOfertas();
  }, [loadOfertas]);

  useEffect(() => {
    if (selectedOferta) {
      loadPostulaciones(selectedOferta);
    }
  }, [selectedOferta, loadPostulaciones]);

  const selectedOfertaInfo = useMemo(() => {
    return ofertas.find((oferta) => oferta.id === selectedOferta);
  }, [ofertas, selectedOferta]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return postulaciones.filter((postulacion) => {
      const egresado = postulacion.egresado;

      const searchableText = [
        egresado?.nombre,
        egresado?.apellido,
        egresado?.dni,
        egresado?.carrera,
        egresado?.user?.email,
        egresado?.telefono,
        postulacion.estado,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = term ? searchableText.includes(term) : true;
      const matchEstado = estadoFilter
        ? postulacion.estado === estadoFilter
        : true;

      return matchSearch && matchEstado;
    });
  }, [postulaciones, search, estadoFilter]);

  const resumen = useMemo(() => {
    return {
      total: postulacionesFiltradas.length,
      pendientes: postulacionesFiltradas.filter(
        (postulacion) => postulacion.estado === 'PENDIENTE',
      ).length,
      entrevistas: postulacionesFiltradas.filter(
        (postulacion) => postulacion.estado === 'ENTREVISTA',
      ).length,
      aceptados: postulacionesFiltradas.filter(
        (postulacion) => postulacion.estado === 'ACEPTADO',
      ).length,
    };
  }, [postulacionesFiltradas]);

  const handleCambiarEstado = async (
    postulacionId: string,
    nuevoEstado: string,
  ) => {
    try {
      setError(null);

      await postulacionesApi.cambiarEstado(postulacionId, nuevoEstado);

      setPostulaciones((prev) =>
        prev.map((postulacion) =>
          postulacion.id === postulacionId
            ? { ...postulacion, estado: nuevoEstado }
            : postulacion,
        ),
      );
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('No se pudo cambiar el estado de la postulación.');
    }
  };

  const isLoading = loadingOfertas || loadingPostulaciones;

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 text-white shadow-xl dark:border-slate-700">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-24 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/75">
              <UserCheck className="h-4 w-4 text-blue-300" />
              Gestión de postulantes
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white">
              Candidatos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Revisa, filtra y gestiona los postulantes asociados a tus ofertas
              laborales.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOfertas}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total candidatos"
          value={resumen.total}
          subtitle="Según filtros aplicados"
          color="#2563eb"
          icon={UserCheck}
        />

        <StatCard
          title="Pendientes"
          value={resumen.pendientes}
          subtitle="Por revisar"
          color="#f59e0b"
          icon={Clock}
        />

        <StatCard
          title="Entrevistas"
          value={resumen.entrevistas}
          subtitle="En proceso activo"
          color="#6366f1"
          icon={Briefcase}
        />

        <StatCard
          title="Aceptados"
          value={resumen.aceptados}
          subtitle="Proceso exitoso"
          color="#10b981"
          icon={CheckCircle}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20">
            <Briefcase className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Selección de oferta laboral
            </h2>

            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Elige una oferta para revisar sus postulantes.
            </p>
          </div>
        </div>

        <select
          value={selectedOferta}
          onChange={(event) => setSelectedOferta(event.target.value)}
          disabled={loadingOfertas}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
        >
          <option value="">
            {loadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}
          </option>

          {ofertas.map((oferta) => (
            <option key={oferta.id} value={oferta.id}>
              {oferta.titulo} ({oferta._count?.postulaciones ?? 0} postulantes)
            </option>
          ))}
        </select>

        {selectedOfertaInfo && (
          <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
            Oferta seleccionada:{' '}
            <span className="text-slate-600 dark:text-slate-300">
              {selectedOfertaInfo.titulo}
            </span>
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, DNI, correo o carrera..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <select
              value={estadoFilter}
              onChange={(event) => setEstadoFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            >
              <option value="">Todos los estados</option>

              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABELS[estado]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error && (
        <section className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Lista de candidatos
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
              {isLoading
                ? 'Cargando postulantes...'
                : `${postulacionesFiltradas.length} candidato(s) encontrado(s)`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
            <GraduationCap className="h-3.5 w-3.5" />
            Postulantes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50 dark:bg-slate-950/70">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Candidato
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Carrera
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Contacto
                </th>

                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Fecha
                </th>

                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Estado
                </th>

                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((postulacion) => {
                  const egresado = postulacion.egresado;

                  return (
                    <tr
                      key={postulacion.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 text-sm font-black text-blue-700 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-800 dark:text-blue-300 dark:ring-slate-700">
                            {getInitials(egresado?.nombre, egresado?.apellido)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                              {egresado?.nombre ?? 'Sin nombre'}{' '}
                              {egresado?.apellido ?? ''}
                            </p>

                            <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                              DNI: {egresado?.dni ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200">
                          <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                          {egresado?.carrera ?? '—'}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Cohorte {egresado?.anioEgreso ?? '—'}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <Mail className="h-3.5 w-3.5" />
                            {egresado?.user?.email ?? '—'}
                          </p>

                          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <Phone className="h-3.5 w-3.5" />
                            {egresado?.telefono ?? '—'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                          {formatDate(
                            postulacion.fechaPostulacion ??
                              postulacion.createdAt,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <EstadoBadge estado={postulacion.estado} />
                      </td>

                      <td className="px-6 py-4 text-center">
                        <select
                          value={
                            isEstadoPostulacion(postulacion.estado)
                              ? postulacion.estado
                              : 'PENDIENTE'
                          }
                          onChange={(event) =>
                            handleCambiarEstado(
                              postulacion.id,
                              event.target.value,
                            )
                          }
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 outline-none transition hover:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                              {ESTADO_LABELS[estado]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800">
                      <GraduationCap className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                      No hay candidatos para mostrar
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Selecciona otra oferta o limpia los filtros de búsqueda.
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