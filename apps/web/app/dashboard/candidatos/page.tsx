'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ofertasApi, postulacionesApi } from '@/lib/api';
import {
  BookOpen, Briefcase, CheckCircle, ChevronDown, Clock,
  Filter, GraduationCap, Mail, Phone, RefreshCw,
  Search, UserCheck, XCircle,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type EstadoPostulacion = 'POSTULADO' | 'EN_REVISION' | 'ENTREVISTA' | 'CONTRATADO' | 'RECHAZADO';
type Empresa    = { nombreComercial?: string; razonSocial?: string };
type Oferta     = { id: string; titulo: string; _count?: { postulaciones?: number } };
type Egresado   = { id?: string; nombre?: string; apellido?: string; dni?: string; carrera?: string; anioEgreso?: number; telefono?: string; user?: { email?: string } };
type Postulacion = { id: string; estado: EstadoPostulacion | string; egresado?: Egresado; createdAt?: string; fechaPostulacion?: string };

/* ─── Constants ────────────────────────────────────────────────── */
const ESTADOS: EstadoPostulacion[] = ['POSTULADO','EN_REVISION','ENTREVISTA','CONTRATADO','RECHAZADO'];

const ESTADO_LABELS: Record<EstadoPostulacion, string> = {
  POSTULADO   : 'Postulado',
  EN_REVISION : 'En revisión',
  ENTREVISTA  : 'Entrevista',
  CONTRATADO  : 'Contratado',
  RECHAZADO   : 'Rechazado',
};

const ESTADO_STYLES: Record<EstadoPostulacion, string> = {
  POSTULADO:   'bg-amber-50   text-amber-700   ring-amber-200   dark:bg-amber-500/10   dark:text-amber-300   dark:ring-amber-500/20',
  EN_REVISION:    'bg-blue-50    text-blue-700    ring-blue-200    dark:bg-blue-500/10    dark:text-blue-300    dark:ring-blue-500/20',
  ENTREVISTA:  'bg-indigo-50  text-indigo-700  ring-indigo-200  dark:bg-indigo-500/10  dark:text-indigo-300  dark:ring-indigo-500/20',
  CONTRATADO:    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  RECHAZADO:   'bg-red-50     text-red-700     ring-red-200     dark:bg-red-500/10     dark:text-red-300     dark:ring-red-500/20',
};

const ESTADO_DOT: Record<EstadoPostulacion, string> = {
  PENDIENTE:'#F59E0B', REVISADO:'#2563EB', ENTREVISTA:'#6366F1', ACEPTADO:'#10B981', RECHAZADO:'#EF4444',
};

const SUMMARY_COLOR: Record<string, string> = {
  blue:'#2563EB', amber:'#F59E0B', indigo:'#6366F1', emerald:'#10B981',
};

/* ─── Helpers ──────────────────────────────────────────────────── */
function isEstadoPostulacion(v: string): v is EstadoPostulacion { return ESTADOS.includes(v as EstadoPostulacion); }

function normalizeOfertas(response: unknown): Oferta[] {
  if (Array.isArray(response)) return response as Oferta[];
  if (response && typeof response === 'object' && 'ofertas' in response && Array.isArray((response as any).ofertas)) return (response as any).ofertas;
  if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) return (response as any).data;
  return [];
}

function normalizePostulaciones(response: unknown): Postulacion[] {
  if (Array.isArray(response)) return response as Postulacion[];
  if (response && typeof response === 'object' && 'postulaciones' in response && Array.isArray((response as any).postulaciones)) return (response as any).postulaciones;
  if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) return (response as any).data;
  return [];
}

function getInitials(nombre?: string, apellido?: string) {
  return ${nombre?.charAt(0) ?? ''}${apellido?.charAt(0) ?? ''}.toUpperCase() || 'EG';
}

function formatDate(value?: string) {
  if (!value) return '—';
  try { return new Date(value).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return '—'; }
}

function getEstadoIcon(estado: string) {
  if (estado === 'CONTRATADO')  return <CheckCircle className="h-3 w-3" />;
  if (estado === 'RECHAZADO') return <XCircle className="h-3 w-3" />;
  return <Clock className="h-3 w-3" />;
}

/* ─── Sub-components ───────────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const s = isEstadoPostulacion(estado) ? estado : 'PENDIENTE';
  return (
    <span className={inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${ESTADO_STYLES[s]}}>
      {getEstadoIcon(s)}{ESTADO_LABELS[s]}
    </span>
  );
}

function SelectWrapper({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[var(--color-text-muted)]">{icon}</div>}
      {children}
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: number; subtitle: string; color: string }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125" style={{ backgroundColor: color }} />
      <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-75" style={{ background: color }} />
      <p className="relative text-[11px] font-medium text-[var(--color-text-muted)] mb-1">{title}</p>
      <p className="relative text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
      <p className="relative mt-0.5 text-[11px] text-[var(--color-text-muted)]">{subtitle}</p>
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
  const [ofertas,           setOfertas]           = useState<Oferta[]>([]);
  const [selectedOferta,    setSelectedOferta]    = useState('');
  const [postulaciones,     setPostulaciones]     = useState<Postulacion[]>([]);
  const [loadingOfertas,    setLoadingOfertas]    = useState(true);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
  const [search,            setSearch]            = useState('');
  const [estadoFilter,      setEstadoFilter]      = useState('');
  const [error,             setError]             = useState<string | null>(null);

  const loadPostulaciones = useCallback(async (ofertaId: string) => {
    if (!ofertaId) { setPostulaciones([]); setLoadingPostulaciones(false); return; }
    try {
      setLoadingPostulaciones(true); setError(null);
      const response = await postulacionesApi.porOferta(ofertaId);
      setPostulaciones(normalizePostulaciones(response));
    } catch (err) {
      console.error('Error al cargar postulaciones:', err);
      setError('No se pudieron cargar los candidatos de esta oferta.');
      setPostulaciones([]);
    } finally { setLoadingPostulaciones(false); }
  }, []);

  const loadOfertas = useCallback(async () => {
    try {
      setLoadingOfertas(true); setError(null);
      const response       = await ofertasApi.misOfertas();
      const listaOfertas   = normalizeOfertas(response);
      setOfertas(listaOfertas);
      let ofertaDesdeUrl   = '';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        ofertaDesdeUrl = params.get('oferta') ?? '';
      }
      const existeOfertaUrl = listaOfertas.some(o => o.id === ofertaDesdeUrl);
      const ofertaInicial   = existeOfertaUrl ? ofertaDesdeUrl : listaOfertas[0]?.id ?? '';
      setSelectedOferta(ofertaInicial);
      if (!ofertaInicial) setPostulaciones([]);
    } catch (err) {
      console.error('Error al cargar ofertas:', err);
      setError('No se pudieron cargar tus ofertas laborales.');
      setOfertas([]); setPostulaciones([]);
    } finally { setLoadingOfertas(false); }
  }, []);

  useEffect(() => { loadOfertas(); }, [loadOfertas]);
  useEffect(() => { if (selectedOferta) loadPostulaciones(selectedOferta); }, [selectedOferta, loadPostulaciones]);

  const selectedOfertaInfo = useMemo(() => ofertas.find(o => o.id === selectedOferta), [ofertas, selectedOferta]);

  const postulacionesFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return postulaciones.filter(p => {
      const e = p.egresado;
      const texto = [e?.nombre, e?.apellido, e?.dni, e?.carrera, e?.user?.email, e?.telefono, p.estado]
        .filter(Boolean).join(' ').toLowerCase();
      return (term ? texto.includes(term) : true) && (estadoFilter ? p.estado === estadoFilter : true);
    });
  }, [postulaciones, search, estadoFilter]);

  const resumen = useMemo(() => ({
    total      : postulacionesFiltradas.length,
    pendientes : postulacionesFiltradas.filter(p => p.estado === 'POSTULADO').length,
    entrevistas: postulacionesFiltradas.filter(p => p.estado === 'ENTREVISTA').length,
    aceptados  : postulacionesFiltradas.filter(p => p.estado === 'CONTRATADO').length,
  }), [postulacionesFiltradas]);

  const handleCambiarEstado = async (postulacionId: string, nuevoEstado: string) => {
    try {
      setError(null);
      await postulacionesApi.cambiarEstado(postulacionId, nuevoEstado);
      setPostulaciones(prev => prev.map(p => p.id === postulacionId ? { ...p, estado: nuevoEstado } : p));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError('No se pudo cambiar el estado de la postulación.');
    }
  };

  const isLoading = loadingOfertas || loadingPostulaciones;

  return (
    <main className="space-y-4">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <UserCheck className="h-3 w-3 text-blue-500" />
              Gestión de postulantes
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Candidatos</h1>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--color-text-secondary)]">
              Revisa, filtra y gestiona los postulantes asociados a tus ofertas laborales.
            </p>
          </div>
          <button
            type="button" onClick={loadOfertas} disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)] disabled:opacity-60"
          >
            <RefreshCw className={h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}} /> Actualizar
          </button>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="Total candidatos" value={resumen.total}       subtitle="Según filtros aplicados" color="#2563EB" />
        <StatCard title="Pendientes"       value={resumen.pendientes}  subtitle="Por revisar"             color="#F59E0B" />
        <StatCard title="Entrevistas"      value={resumen.entrevistas} subtitle="En proceso activo"       color="#6366F1" />
        <StatCard title="Aceptados"        value={resumen.aceptados}   subtitle="Proceso exitoso"         color="#10B981" />
      </section>

      {/* ── Selector de oferta ────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Selección de oferta</h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">Elige la oferta para ver sus postulantes</p>
          </div>
        </div>

        <SelectWrapper>
          <select
            value={selectedOferta}
            onChange={e => setSelectedOferta(e.target.value)}
            disabled={loadingOfertas}
            className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 pr-10 text-[13px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{loadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}</option>
            {ofertas.map(o => (
              <option key={o.id} value={o.id}>{o.titulo} ({o._count?.postulaciones ?? 0} postulantes)</option>
            ))}
          </select>
        </SelectWrapper>

        {selectedOfertaInfo && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[.06] px-3 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">
              Oferta seleccionada: <span className="font-semibold">{selectedOfertaInfo.titulo}</span>
            </p>
          </div>
        )}
      </section>

      {/* ── Filtros ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI, correo o carrera..."
              className="min-h-[42px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-4 text-[13px] text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <SelectWrapper icon={<Filter className="h-3.5 w-3.5" />}>
            <select
              value={estadoFilter}
              onChange={e => setEstadoFilter(e.target.value)}
              className="min-h-[42px] w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-2.5 pl-10 pr-10 text-[13px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABELS[e]}</option>)}
            </select>
          </SelectWrapper>
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
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Lista de candidatos</h2>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
              {isLoading ? 'Cargando postulantes...' : ${postulacionesFiltradas.length} candidato(s) encontrado(s)}
            </p>
          </div>

          {/* Estado distribution pills */}
          {!isLoading && postulacionesFiltradas.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ESTADOS.filter(e => postulacionesFiltradas.some(p => p.estado === e)).map(e => {
                const count = postulacionesFiltradas.filter(p => p.estado === e).length;
                return (
                  <span key={e} className={inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${ESTADO_STYLES[e]}}>
                    <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: ESTADO_DOT[e] }} />
                    {ESTADO_LABELS[e]} · {count}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                {['Candidato','Carrera','Contacto','Fecha','Estado','Acción'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] ${
                    i <= 2 ? 'text-left' : 'text-center'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <TableSkeleton />
              ) : postulacionesFiltradas.length > 0 ? (
                postulacionesFiltradas.map(postulacion => {
                  const e = postulacion.egresado;
                  const estadoActual = isEstadoPostulacion(postulacion.estado) ? postulacion.estado : 'PENDIENTE';
                  return (
                    <tr key={postulacion.id} className="group transition-colors hover:bg-[var(--color-bg-subtle)]/60">

                      {/* Candidato */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-700 ring-1 ring-blue-500/15 dark:text-blue-300">
                            {getInitials(e?.nombre, e?.apellido)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                              {e?.nombre ?? 'Sin nombre'} {e?.apellido ?? ''}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)]">DNI: {e?.dni ?? '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Carrera */}
                      <td className="px-5 py-3.5">
                        <p className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                          {e?.carrera ?? '—'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">Cohorte {e?.anioEgreso ?? '—'}</p>
                      </td>

                      {/* Contacto */}
                      <td className="px-5 py-3.5">
                        <p className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                          <Mail className="h-3 w-3 shrink-0" />{e?.user?.email ?? '—'}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
                          <Phone className="h-3 w-3 shrink-0" />{e?.telefono ?? '—'}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {formatDate(postulacion.fechaPostulacion ?? postulacion.createdAt)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5 text-center">
                        <EstadoBadge estado={postulacion.estado} />
                      </td>

                      {/* Acción – cambiar estado */}
                      <td className="px-5 py-3.5 text-center">
                        <SelectWrapper>
                          <select
                            value={estadoActual}
                            onChange={ev => handleCambiarEstado(postulacion.id, ev.target.value)}
                            className="min-w-[148px] appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 pr-9 text-[12px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                          >
                            {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_LABELS[s]}</option>)}
                          </select>
                        </SelectWrapper>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <GraduationCap className="h-6 w-6 text-[var(--color-text-muted)]" />
                    </div>
                    <h3 className="mt-3 text-[15px] font-semibold text-[var(--color-text-primary)]">No hay candidatos para mostrar</h3>
                    <p className="mt-1.5 text-[13px] text-[var(--color-text-muted)]">Selecciona otra oferta o limpia los filtros de búsqueda.</p>
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
