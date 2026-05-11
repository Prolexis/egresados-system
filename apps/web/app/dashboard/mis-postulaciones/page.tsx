'use client';

import {
  useCallback, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { postulacionesApi } from '@/lib/api';
import {
  Briefcase, Building2, CalendarDays, CheckCircle2, ChevronDown,
  Clock, FileText, Filter, RefreshCw, Search, X, XCircle, MapPin,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type EstadoPostulacion =
  | 'POSTULADO' | 'PENDIENTE' | 'EN_REVISION' | 'REVISADO'
  | 'ENTREVISTA' | 'CONTRATADO' | 'ACEPTADO' | 'RECHAZADO';

type Empresa   = { nombreComercial?: string; razonSocial?: string };
type Oferta    = { id?: string; titulo?: string; modalidad?: string; tipoContrato?: string; ubicacion?: string; empresa?: Empresa };
type Postulacion = { id: string; estado: EstadoPostulacion | string; createdAt?: string; fechaPostulacion?: string; oferta?: Oferta };
type PostulacionesData = { postulaciones: Postulacion[]; total: number };

/* ─── Constants ────────────────────────────────────────────────── */
const ESTADOS = ['POSTULADO','PENDIENTE','EN_REVISION','REVISADO','ENTREVISTA','CONTRATADO','ACEPTADO','RECHAZADO'];

const ESTADO_LABELS: Record<string,string> = {
  POSTULADO:'Postulado', PENDIENTE:'Pendiente', EN_REVISION:'En revisión',
  REVISADO:'Revisado', ENTREVISTA:'Entrevista', CONTRATADO:'Contratado',
  ACEPTADO:'Aceptado', RECHAZADO:'Rechazado',
};

const ESTADO_CLASSES: Record<string,string> = {
  POSTULADO:   'bg-amber-50   text-amber-700   ring-amber-100   dark:bg-amber-500/10   dark:text-amber-300   dark:ring-amber-500/20',
  PENDIENTE:   'bg-amber-50   text-amber-700   ring-amber-100   dark:bg-amber-500/10   dark:text-amber-300   dark:ring-amber-500/20',
  EN_REVISION: 'bg-blue-50    text-blue-700    ring-blue-100    dark:bg-blue-500/10    dark:text-blue-300    dark:ring-blue-500/20',
  REVISADO:    'bg-blue-50    text-blue-700    ring-blue-100    dark:bg-blue-500/10    dark:text-blue-300    dark:ring-blue-500/20',
  ENTREVISTA:  'bg-indigo-50  text-indigo-700  ring-indigo-100  dark:bg-indigo-500/10  dark:text-indigo-300  dark:ring-indigo-500/20',
  CONTRATADO:  'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  ACEPTADO:    'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  RECHAZADO:   'bg-red-50     text-red-700     ring-red-100     dark:bg-red-500/10     dark:text-red-300     dark:ring-red-500/20',
};

const ESTADO_BAR: Record<string,string> = {
  POSTULADO:'#F59E0B', PENDIENTE:'#F59E0B', EN_REVISION:'#2563EB', REVISADO:'#2563EB',
  ENTREVISTA:'#6366F1', CONTRATADO:'#10B981', ACEPTADO:'#10B981', RECHAZADO:'#EF4444',
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function normalizePostulaciones(response: unknown): PostulacionesData {
  if (Array.isArray(response)) return { postulaciones: response as Postulacion[], total: response.length };
  if (response && typeof response === 'object' && 'postulaciones' in response && Array.isArray((response as any).postulaciones)) {
    const d = response as PostulacionesData;
    return { postulaciones: d.postulaciones ?? [], total: d.total ?? d.postulaciones?.length ?? 0 };
  }
  if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
    const lista = (response as any).data as Postulacion[];
    return { postulaciones: lista, total: lista.length };
  }
  return { postulaciones: [], total: 0 };
}

function formatDate(value?: string) {
  if (!value) return '—';
  try { return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function formatEstado(value?: string) {
  const s = String(value || 'POSTULADO');
  return ESTADO_LABELS[s] || s.replace('_', ' ');
}

function getEstadoIcon(estado: string) {
  if (estado === 'CONTRATADO' || estado === 'ACEPTADO') return <CheckCircle2 className="h-3 w-3" />;
  if (estado === 'RECHAZADO') return <XCircle className="h-3 w-3" />;
  return <Clock className="h-3 w-3" />;
}

async function obtenerMisPostulaciones() {
  const api = postulacionesApi as any;
  if (typeof api.misPostulaciones === 'function')    return api.misPostulaciones();
  if (typeof api.getMisPostulaciones === 'function') return api.getMisPostulaciones();
  if (typeof api.me === 'function')                  return api.me();
  if (typeof api.mis === 'function')                 return api.mis();
  if (typeof api.getAll === 'function')              return api.getAll({});
  throw new Error('No existe un método para cargar mis postulaciones en postulacionesApi.');
}

/* ─── Sub-components ───────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const s = estado || 'POSTULADO';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
      ESTADO_CLASSES[s] || 'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-white/10 dark:text-white/60 dark:ring-white/10'
    }`}>
      {getEstadoIcon(s)}{formatEstado(s)}
    </span>
  );
}

function SelectWrapper({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="relative">
      {icon && <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]">{icon}</div>}
      {children}
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string; value: number; subtitle: string; icon: any; color: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125" style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-70" style={{ background: color }} />

      <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}12` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="relative">
        <p className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">{value}</p>
        <p className="mt-0.5 text-[13px] font-medium text-[var(--color-text-secondary)]">{title}</p>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
      </div>
    </article>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={5} className="px-5 py-3">
            <div className="h-14 w-full animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
          </td>
        </tr>
      ))}
    </>
  );
}

/* Tiny timeline de estados ──────────────────────────────────────── */
const ESTADO_ORDER = ['POSTULADO','EN_REVISION','ENTREVISTA','ACEPTADO'];
function EstadoTimeline({ estado }: { estado: string }) {
  const idx = ESTADO_ORDER.indexOf(estado);
  const active = idx >= 0 ? idx : (estado === 'PENDIENTE' ? 0 : estado === 'REVISADO' ? 1 : -1);
  const isRechazado = estado === 'RECHAZADO' || estado === 'CONTRATADO';

  return (
    <div className="flex items-center gap-1">
      {ESTADO_ORDER.map((s, i) => {
        const done    = active >= i;
        const current = active === i;
        const bar     = ESTADO_BAR[s] || '#2563EB';
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              title={ESTADO_LABELS[s]}
              className="h-1.5 w-5 rounded-full transition-all"
              style={{ background: done ? bar : 'var(--color-bg-subtle)', opacity: done ? 1 : 0.4 }}
            />
          </div>
        );
      })}
      {isRechazado && <div className="h-1.5 w-5 rounded-full bg-red-400 opacity-80" title="Rechazado" />}
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function MisPostulacionesPage() {
  const [data, setData]     = useState<PostulacionesData>({ postulaciones: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [estado, setEstado]   = useState('');
  const [error, setError]     = useState<string | null>(null);

  const cargarPostulaciones = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const response = await obtenerMisPostulaciones();
      setData(normalizePostulaciones(response));
    } catch (err) {
      console.error('Error al cargar mis postulaciones:', err);
      setError('No se pudieron cargar tus postulaciones.');
      setData({ postulaciones: [], total: 0 });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarPostulaciones(); }, [cargarPostulaciones]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.postulaciones.filter(p => {
      const texto = [p.oferta?.titulo, p.oferta?.empresa?.nombreComercial, p.oferta?.empresa?.razonSocial, p.oferta?.ubicacion, p.estado]
        .filter(Boolean).join(' ').toLowerCase();
      return (term ? texto.includes(term) : true) && (estado ? p.estado === estado : true);
    });
  }, [data.postulaciones, search, estado]);

  const resumen = useMemo(() => ({
    total      : postulacionesFiltradas.length,
    revision   : postulacionesFiltradas.filter(p => ['EN_REVISION','REVISADO','PENDIENTE','POSTULADO'].includes(String(p.estado))).length,
    entrevistas: postulacionesFiltradas.filter(p => p.estado === 'ENTREVISTA').length,
    exitosas   : postulacionesFiltradas.filter(p => ['CONTRATADO','ACEPTADO'].includes(String(p.estado))).length,
  }), [postulacionesFiltradas]);

  const tieneFiltros  = search.trim() !== '' || estado !== '';
  const limpiarFiltros = () => { setSearch(''); setEstado(''); };

  return (
    <main className="space-y-4">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <FileText className="h-3 w-3 text-blue-500" />
              Seguimiento personal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Mis Postulaciones</h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--color-text-secondary)]">
              Revisa el estado de tus postulaciones, las ofertas a las que aplicaste y las empresas asociadas.
            </p>
          </div>

          <button
            type="button" onClick={cargarPostulaciones} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="Total"       value={resumen.total}       subtitle="Postulaciones realizadas"   icon={Briefcase}   color="#2563EB" />
        <StatCard title="En revisión" value={resumen.revision}    subtitle="Pendientes de evaluación"   icon={Clock}       color="#F59E0B" />
        <StatCard title="Entrevistas" value={resumen.entrevistas} subtitle="Procesos activos"           icon={CalendarDays} color="#6366F1" />
        <StatCard title="Aceptadas"   value={resumen.exitosas}    subtitle="Resultados positivos"       icon={CheckCircle2} color="#10B981" />
      </section>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por oferta, empresa o ubicación..."
              className="min-h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-4 text-[13px] text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-3.5 w-3.5" />}>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-10 text-[13px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(item => <option key={item} value={item}>{formatEstado(item)}</option>)}
            </select>
          </SelectWrapper>

          <button
            type="button" onClick={limpiarFiltros} disabled={!tieneFiltros}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 text-[12px] font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        </div>
      </section>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </section>
      )}

      {/* ── Tabla ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">

        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Historial de postulaciones</h2>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
              {loading ? 'Cargando postulaciones...' : `${postulacionesFiltradas.length} postulación(es) encontrada(s)`}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            <FileText className="h-3 w-3 text-blue-500" />
            Mis procesos
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                {['Oferta', 'Empresa', 'Modalidad', 'Progreso', 'Estado', 'Fecha'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] ${
                    i >= 3 ? 'text-center' : 'text-left'} ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {loading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map(postulacion => (
                  <tr key={postulacion.id} className="group transition-colors hover:bg-[var(--color-bg-subtle)]/60">

                    {/* Oferta */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/15 dark:text-blue-400">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
                            {postulacion.oferta?.titulo || 'Oferta no disponible'}
                          </p>
                          {postulacion.oferta?.ubicacion && (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[var(--color-text-muted)]">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {postulacion.oferta.ubicacion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Empresa */}
                    <td className="px-5 py-3.5">
                      <p className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                        {postulacion.oferta?.empresa?.nombreComercial || postulacion.oferta?.empresa?.razonSocial || '—'}
                      </p>
                    </td>

                    {/* Modalidad */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-[var(--color-text-secondary)]">{postulacion.oferta?.modalidad || '—'}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                        {postulacion.oferta?.tipoContrato?.replace('_', ' ') || 'No especificado'}
                      </p>
                    </td>

                    {/* Progreso */}
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <EstadoTimeline estado={String(postulacion.estado)} />
                      </div>
                    </td>

                    {/* Estado badge */}
                    <td className="px-5 py-3.5 text-center">
                      <EstadoBadge estado={String(postulacion.estado)} />
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {formatDate(postulacion.fechaPostulacion ?? postulacion.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <FileText className="h-6 w-6 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-text-primary)]">No tienes postulaciones registradas</h3>
                    <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-[var(--color-text-muted)]">
                      Cuando postules a una oferta laboral, aparecerá aquí el seguimiento de tu proceso.
                    </p>
                    {tieneFiltros && (
                      <button
                        type="button" onClick={limpiarFiltros}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-blue-500"
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
