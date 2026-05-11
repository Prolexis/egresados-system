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

/* ─── Types ────────────────────────────────────────────────────── */
type EstadoPostulacion =
  | 'POSTULADO'
  | 'EN_REVISION'
  | 'ENTREVISTA'
  | 'CONTRATADO'
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

/* ─── Constants ────────────────────────────────────────────────── */
const ESTADOS: EstadoPostulacion[] = [
  'POSTULADO',
  'EN_REVISION',
  'ENTREVISTA',
  'CONTRATADO',
  'RECHAZADO',
];

const ESTADO_LABELS: Record<EstadoPostulacion, string> = {
  POSTULADO: 'Postulado',
  EN_REVISION: 'En revisión',
  ENTREVISTA: 'Entrevista',
  CONTRATADO: 'Contratado',
  RECHAZADO: 'Rechazado',
};

const ESTADO_STYLES: Record<EstadoPostulacion, string> = {
  POSTULADO:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',

  EN_REVISION:
    'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',

  ENTREVISTA:
    'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',

  CONTRATADO:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',

  RECHAZADO:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
};

const ESTADO_DOT: Record<EstadoPostulacion, string> = {
  POSTULADO: '#F59E0B',
  EN_REVISION: '#2563EB',
  ENTREVISTA: '#6366F1',
  CONTRATADO: '#10B981',
  RECHAZADO: '#EF4444',
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function isEstadoPostulacion(v: string): v is EstadoPostulacion {
  return ESTADOS.includes(v as EstadoPostulacion);
}

function normalizeOfertas(response: unknown): Oferta[] {
  if (Array.isArray(response)) return response as Oferta[];

  if (
    response &&
    typeof response === 'object' &&
    'ofertas' in response &&
    Array.isArray((response as any).ofertas)
  ) {
    return (response as any).ofertas;
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as any).data)
  ) {
    return (response as any).data;
  }

  return [];
}

function normalizePostulaciones(response: unknown): Postulacion[] {
  if (Array.isArray(response)) return response as Postulacion[];

  if (
    response &&
    typeof response === 'object' &&
    'postulaciones' in response &&
    Array.isArray((response as any).postulaciones)
  ) {
    return (response as any).postulaciones;
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    Array.isArray((response as any).data)
  ) {
    return (response as any).data;
  }

  return [];
}

function getInitials(nombre?: string, apellido?: string) {
  return `${nombre?.charAt(0) ?? ''}${apellido?.charAt(0) ?? ''}`.toUpperCase() || 'EG';
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

function getEstadoIcon(estado: EstadoPostulacion) {
  if (estado === 'CONTRATADO') {
    return <CheckCircle className="h-3 w-3" />;
  }

  if (estado === 'RECHAZADO') {
    return <XCircle className="h-3 w-3" />;
  }

  return <Clock className="h-3 w-3" />;
}

/* ─── Sub-components ───────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const s: EstadoPostulacion = isEstadoPostulacion(estado)
    ? estado
    : 'POSTULADO';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ESTADO_STYLES[s]}`}
    >
      {getEstadoIcon(s)}
      {ESTADO_LABELS[s]}
    </span>
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
        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]">
          {icon}
        </div>
      )}

      {children}

      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
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
      console.error(err);

      setError('No se pudieron cargar los candidatos.');
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

      const lista = normalizeOfertas(response);

      setOfertas(lista);

      const inicial = lista[0]?.id ?? '';

      setSelectedOferta(inicial);

      if (!inicial) {
        setPostulaciones([]);
      }
    } catch (err) {
      console.error(err);

      setError('No se pudieron cargar las ofertas.');
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

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return postulaciones.filter((p) => {
      const e = p.egresado;

      const texto = [
        e?.nombre,
        e?.apellido,
        e?.dni,
        e?.carrera,
        e?.telefono,
        e?.user?.email,
        p.estado,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (term ? texto.includes(term) : true) &&
        (estadoFilter ? p.estado === estadoFilter : true)
      );
    });
  }, [postulaciones, search, estadoFilter]);

  const handleCambiarEstado = async (
    postulacionId: string,
    nuevoEstado: EstadoPostulacion
  ) => {
    try {
      setError(null);

      await postulacionesApi.cambiarEstado(postulacionId, {
        estado: nuevoEstado,
      });

      setPostulaciones((prev) =>
        prev.map((p) =>
          p.id === postulacionId
            ? {
                ...p,
                estado: nuevoEstado,
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);

      setError('No se pudo cambiar el estado de la postulación.');
    }
  };

  return (
    <main className="space-y-4">
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </section>
      )}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <SelectWrapper>
          <select
            value={selectedOferta}
            onChange={(e) => setSelectedOferta(e.target.value)}
            className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 pr-10 text-[13px]"
          >
            <option value="">Selecciona una oferta</option>

            {ofertas.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titulo}
              </option>
            ))}
          </select>
        </SelectWrapper>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="min-h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-4 text-[13px]"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-3.5 w-3.5" />}>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-10 text-[13px]"
            >
              <option value="">Todos los estados</option>

              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_LABELS[e]}
                </option>
              ))}
            </select>
          </SelectWrapper>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase">
                  Candidato
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase">
                  Carrera
                </th>

                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase">
                  Contacto
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase">
                  Fecha
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase">
                  Estado
                </th>

                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {postulacionesFiltradas.map((postulacion) => {
                const e = postulacion.egresado;

                const estadoActual: EstadoPostulacion =
                  isEstadoPostulacion(postulacion.estado)
                    ? postulacion.estado
                    : 'POSTULADO';

                return (
                  <tr
                    key={postulacion.id}
                    className="group transition-colors hover:bg-[var(--color-bg-subtle)]/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-700">
                          {getInitials(e?.nombre, e?.apellido)}
                        </div>

                        <div>
                          <p className="text-[13px] font-semibold">
                            {e?.nombre} {e?.apellido}
                          </p>

                          <p className="text-[11px] text-[var(--color-text-muted)]">
                            DNI: {e?.dni ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 text-[13px]">
                        <BookOpen className="h-3.5 w-3.5" />
                        {e?.carrera ?? '—'}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        Cohorte {e?.anioEgreso ?? '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 text-[12px]">
                        <Mail className="h-3 w-3" />
                        {e?.user?.email ?? '—'}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-[12px]">
                        <Phone className="h-3 w-3" />
                        {e?.telefono ?? '—'}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {formatDate(
                          postulacion.fechaPostulacion ??
                            postulacion.createdAt
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <EstadoBadge estado={postulacion.estado} />
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <SelectWrapper>
                        <select
                          value={estadoActual}
                          onChange={(ev) =>
                            handleCambiarEstado(
                              postulacion.id,
                              ev.target.value as EstadoPostulacion
                            )
                          }
                          className="min-w-[148px] appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 pr-9 text-[12px]"
                        >
                          {ESTADOS.map((s) => (
                            <option key={s} value={s}>
                              {ESTADO_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </SelectWrapper>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
