'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ofertasApi, postulacionesApi } from '@/lib/api';
import {
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronDown,
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
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  REVISADO:
    'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
  ENTREVISTA:
    'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
  ACEPTADO:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  RECHAZADO:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
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
  const first = nombre?.charAt(0) ?? '';
  const second = apellido?.charAt(0) ?? '';

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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${ESTADO_STYLES[safeEstado]}`}
    >
      {getEstadoIcon(safeEstado)}
      {ESTADO_LABELS[safeEstado]}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={6} className="px-5 py-4">
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  tone = 'blue',
}: {
  title: string;
  value: number;
  subtitle: string;
  tone?: 'blue' | 'amber' | 'indigo' | 'emerald';
}) {
  const toneMap = {
    blue: 'border-blue-100 bg-white shadow-blue-100/40 dark:border-white/10 dark:bg-white/5',
    amber:
      'border-amber-100 bg-gradient-to-br from-white to-amber-50/70 shadow-amber-100/40 dark:border-white/10 dark:from-white/5 dark:to-amber-500/5',
    indigo:
      'border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 shadow-indigo-100/40 dark:border-white/10 dark:from-white/5 dark:to-indigo-500/5',
    emerald:
      'border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 shadow-emerald-100/40 dark:border-white/10 dark:from-white/5 dark:to-emerald-500/5',
  };

  const valueColor = {
    blue: 'text-slate-950 dark:text-white',
    amber: 'text-amber-600 dark:text-amber-300',
    indigo: 'text-indigo-600 dark:text-indigo-300',
    emerald: 'text-emerald-600 dark:text-emerald-300',
  };

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneMap[tone]}`}
    >
      <p className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </p>
      <h3 className={`mt-1.5 text-2xl font-black ${valueColor[tone]}`}>
        {value}
      </h3>
      <p className="mt-1 text-xs text-slate-400 dark:text-white/45">
        {subtitle}
      </p>
    </article>
  );
}

function SelectWrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
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
    <main className="space-y-5 animate-fadeIn">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 px-6 py-5 shadow-md shadow-blue-100/50 dark:border-slate-700 dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:shadow-none">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_35%)] dark:bg-none" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Gestión de postulantes
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
              Candidatos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Revisa, filtra y gestiona los postulantes asociados a tus ofertas
              laborales.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOfertas}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total candidatos"
          value={resumen.total}
          subtitle="Según filtros aplicados"
          tone="blue"
        />
        <SummaryCard
          title="Pendientes"
          value={resumen.pendientes}
          subtitle="Por revisar"
          tone="amber"
        />
        <SummaryCard
          title="Entrevistas"
          value={resumen.entrevistas}
          subtitle="En proceso activo"
          tone="indigo"
        />
        <SummaryCard
          title="Aceptados"
          value={resumen.aceptados}
          subtitle="Proceso exitoso"
          tone="emerald"
        />
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">
              Selección de oferta laboral
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/50">
              Elige la oferta para ver sus postulantes
            </p>
          </div>
        </div>

        <SelectWrapper>
          <select
            value={selectedOferta}
            onChange={(event) => setSelectedOferta(event.target.value)}
            disabled={loadingOfertas}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
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
        </SelectWrapper>

        {selectedOfertaInfo && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            Oferta seleccionada: <span className="font-black">{selectedOfertaInfo.titulo}</span>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, DNI, correo o carrera..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-4 w-4" />}>
            <select
              value={estadoFilter}
              onChange={(event) => setEstadoFilter(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABELS[estado]}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="text-base font-black text-slate-950 dark:text-white">
            Lista de candidatos
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/55">
            {isLoading
              ? 'Cargando postulantes...'
              : `${postulacionesFiltradas.length} candidato(s) encontrado(s)`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Candidato
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Carrera
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Contacto
                </th>
                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Fecha
                </th>
                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Estado
                </th>
                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {isLoading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map((postulacion) => {
                  const egresado = postulacion.egresado;

                  return (
                    <tr
                      key={postulacion.id}
                      className="transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                            {getInitials(egresado?.nombre, egresado?.apellido)}
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">
                              {egresado?.nombre ?? 'Sin nombre'}{' '}
                              {egresado?.apellido ?? ''}
                            </p>
                            <p className="text-xs font-medium text-slate-400 dark:text-white/45">
                              DNI: {egresado?.dni ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-white/75">
                          <BookOpen className="h-4 w-4 text-slate-400 dark:text-white/45" />
                          {egresado?.carrera ?? '—'}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-400 dark:text-white/45">
                          Cohorte {egresado?.anioEgreso ?? '—'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/55">
                            <Mail className="h-3.5 w-3.5" />
                            {egresado?.user?.email ?? '—'}
                          </p>

                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/55">
                            <Phone className="h-3.5 w-3.5" />
                            {egresado?.telefono ?? '—'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-white/55">
                          {formatDate(
                            postulacion.fechaPostulacion ??
                              postulacion.createdAt,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <EstadoBadge estado={postulacion.estado} />
                      </td>

                      <td className="px-5 py-4 text-center">
                        <SelectWrapper>
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
                            className="min-w-[160px] appearance-none rounded-2xl border border-slate-200 bg-white px-3 py-2 pr-10 text-xs font-bold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                          >
                            {ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {ESTADO_LABELS[estado]}
                              </option>
                            ))}
                          </select>
                        </SelectWrapper>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/10">
                      <GraduationCap className="h-7 w-7 text-slate-300 dark:text-white/35" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">
                      No hay candidatos para mostrar
                    </h3>

                    <p className="mt-1 text-sm text-slate-400 dark:text-white/45">
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
