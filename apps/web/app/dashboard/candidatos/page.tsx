
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
  return (
    `${nombre?.charAt(0) ?? ''}${apellido?.charAt(0) ?? ''}`.toUpperCase() ||
    'EG'
  );
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
  if (estado === 'CONTRATADO') {
    return <CheckCircle className="h-3 w-3" />;
  }

  if (estado === 'RECHAZADO') {
    return <XCircle className="h-3 w-3" />;
  }

  return <Clock className="h-3 w-3" />;
}

/* ─── Components ───────────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const s = isEstadoPostulacion(estado)
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

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-75"
        style={{ background: color }}
      />

      <p className="relative mb-1 text-[11px] font-medium text-[var(--color-text-muted)]">
        {title}
      </p>

      <p
        className="relative text-2xl font-bold tracking-tight"
        style={{ color }}
      >
        {value}
      </p>

      <p className="relative mt-0.5 text-[11px] text-[var(--color-text-muted)]">
        {subtitle}
      </p>
    </article>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={6} className="px-5 py-3">
            <div className="h-14 w-full animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
          </td>
        </tr>
      ))}
    </>
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

      const ofertaInicial = lista[0]?.id ?? '';

      setSelectedOferta(ofertaInicial);

      if (!ofertaInicial) {
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
        e?.user?.email,
        e?.telefono,
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

  const resumen = useMemo(
    () => ({
      total: postulacionesFiltradas.length,
      pendientes: postulacionesFiltradas.filter(
        (p) => p.estado === 'POSTULADO'
      ).length,

      entrevistas: postulacionesFiltradas.filter(
        (p) => p.estado === 'ENTREVISTA'
      ).length,

      aceptados: postulacionesFiltradas.filter(
        (p) => p.estado === 'CONTRATADO'
      ).length,
    }),
    [postulacionesFiltradas]
  );

  const handleCambiarEstado = async (
    postulacionId: string,
    nuevoEstado: string
  ) => {
    try {
      setError(null);

      await postulacionesApi.cambiarEstado(
        postulacionId,
        nuevoEstado
      );

      setPostulaciones((prev) =>
        prev.map((p) =>
          p.id === postulacionId
            ? { ...p, estado: nuevoEstado }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      setError('No se pudo cambiar el estado.');
    }
  };

  const isLoading =
    loadingOfertas || loadingPostulaciones;

  return (
    <main className="space-y-4">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          title="Total candidatos"
          value={resumen.total}
          subtitle="Según filtros"
          color="#2563EB"
        />

        <StatCard
          title="Postulados"
          value={resumen.pendientes}
          subtitle="Pendientes"
          color="#F59E0B"
        />

        <StatCard
          title="Entrevistas"
          value={resumen.entrevistas}
          subtitle="En proceso"
          color="#6366F1"
        />

        <StatCard
          title="Contratados"
          value={resumen.aceptados}
          subtitle="Aceptados"
          color="#10B981"
        />
      </section>
    </main>
  );
}
