'use client';

import { useEffect, useMemo, useState } from 'react';
import { reportesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Settings2,
  Sparkles,
  XCircle,
} from 'lucide-react';

const TIPOS_REPORTE = [
  {
    id: 'egresados_carrera',
    label: 'Egresados por Carrera',
    tipo: 'operacional',
    desc: 'Listado de egresados con datos de contacto agrupados por carrera.',
  },
  {
    id: 'ofertas_activas',
    label: 'Ofertas Activas',
    tipo: 'operacional',
    desc: 'Todas las ofertas laborales activas con sus requisitos.',
  },
  {
    id: 'postulaciones_oferta',
    label: 'Reporte de Postulaciones',
    tipo: 'operacional',
    desc: 'Historial completo de postulaciones con estados actuales.',
  },
  {
    id: 'empleabilidad',
    label: 'Empleabilidad',
    tipo: 'gestion',
    desc: 'Tasa de empleo de egresados por carrera y año de egreso.',
  },
  {
    id: 'demanda_laboral',
    label: 'Demanda Laboral',
    tipo: 'gestion',
    desc: 'Habilidades más solicitadas y sectores con mayor demanda.',
  },
  {
    id: 'comparativo_cohortes',
    label: 'Comparativo por Cohortes',
    tipo: 'gestion',
    desc: 'Análisis comparativo de empleabilidad entre cohortes.',
  },
];

const estadoIcon: Record<string, any> = {
  PENDIENTE: {
    icon: Clock,
    color: '#F59E0B',
    bg: 'bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-500/20',
    label: 'Pendiente',
  },
  PROCESANDO: {
    icon: Loader2,
    color: '#2563EB',
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
    label: 'Procesando',
    spin: true,
  },
  COMPLETADO: {
    icon: CheckCircle2,
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    label: 'Completado',
  },
  FALLIDO: {
    icon: XCircle,
    color: '#EF4444',
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
    label: 'Fallido',
  },
};

const inputClass =
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10';

const labelClass =
  'mb-2 block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]';

function formatDate(value?: string) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getFileNameFromResponse(response: Response, fallback: string) {
  const contentDisposition = response.headers.get('content-disposition');

  if (!contentDisposition) return fallback;

  const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

  return fileNameMatch?.[1] || fallback;
}

function getStoredToken() {
  const authStore = useAuthStore as any;
  const state = authStore.getState?.();

  const tokenFromStore =
    state?.accessToken ||
    state?.token ||
    state?.auth?.accessToken ||
    state?.auth?.token ||
    state?.user?.accessToken;

  if (tokenFromStore) return tokenFromStore;

  if (typeof window === 'undefined') return null;

  const directToken =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken');

  if (directToken) return directToken;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) continue;

    const rawValue = localStorage.getItem(key);

    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue);

      const possibleToken =
        parsed?.state?.accessToken ||
        parsed?.state?.token ||
        parsed?.state?.auth?.accessToken ||
        parsed?.state?.auth?.token ||
        parsed?.accessToken ||
        parsed?.token ||
        parsed?.auth?.accessToken ||
        parsed?.auth?.token;

      if (possibleToken) return possibleToken;
    } catch {
      continue;
    }
  }

  return null;
}

function buildReportUrl(urlArchivo: string) {
  if (urlArchivo.startsWith('http')) return urlArchivo;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = urlArchivo.startsWith('/') ? urlArchivo : `/${urlArchivo}`;

  return `${cleanBase}${cleanPath}`;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  subtitle: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover:scale-125"
        style={{ backgroundColor: color }}
      />

      <div
        className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      <div className="relative">
        <p className="text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {value}
        </p>
        <p className="mt-1 text-sm font-black text-[var(--color-text-secondary)]">
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
          {subtitle}
        </p>
      </div>
    </article>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="h-12 w-12 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />

      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
      </div>

      <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
    </div>
  );
}

export default function ReportesPage() {
  const [tipo, setTipo] = useState('egresados_carrera');
  const [parametros, setParametros] = useState<any>({});
  const [generando, setGenerando] = useState(false);
  const [reportes, setReportes] = useState<any[]>([]);
  const [polling, setPolling] = useState<Set<string>>(new Set());
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [descargando, setDescargando] = useState<string | null>(null);

  const cargarReportes = () => {
    setLoadingReportes(true);

    reportesApi
      .misReportes()
      .then(setReportes)
      .catch(console.error)
      .finally(() => setLoadingReportes(false));
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  const pollEstado = (id: string) => {
    setPolling((prev) => new Set([...prev, id]));

    const interval = setInterval(async () => {
      try {
        const r = await reportesApi.estado(id);

        setReportes((prev) =>
          prev.map((rep) => (rep.id === id ? r : rep)),
        );

        if (r.estado === 'COMPLETADO' || r.estado === 'FALLIDO') {
          clearInterval(interval);

          setPolling((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
          });
        }
      } catch {
        clearInterval(interval);

        setPolling((prev) => {
          const s = new Set(prev);
          s.delete(id);
          return s;
        });
      }
    }, 2500);
  };

  const handleGenerar = async () => {
    setGenerando(true);

    try {
      const r = await reportesApi.solicitar(tipo, parametros);

      setReportes((prev) => [r, ...prev]);
      pollEstado(r.id);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al solicitar reporte');
    } finally {
      setGenerando(false);
    }
  };

  const descargarReporte = async (reporte: any) => {
    if (!reporte?.urlArchivo) {
      alert('Este reporte no tiene archivo disponible.');
      return;
    }

    const token = getStoredToken();

    if (!token) {
      alert('No se encontró un token de sesión. Inicia sesión nuevamente.');
      return;
    }

    const url = buildReportUrl(reporte.urlArchivo);

    try {
      setDescargando(reporte.id);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'No autorizado. Tu sesión pudo haber expirado. Inicia sesión nuevamente.',
          );
        }

        throw new Error('No se pudo descargar el reporte.');
      }

      const blob = await response.blob();

      const fileName = getFileNameFromResponse(
        response,
        `reporte-${reporte.tipo || 'generado'}.pdf`,
      );

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      alert(error.message || 'Error al descargar el PDF.');
    } finally {
      setDescargando(null);
    }
  };

  const tipoSeleccionado = TIPOS_REPORTE.find((t) => t.id === tipo);

  const resumen = useMemo(() => {
    return {
      total: reportes.length,
      completados: reportes.filter((r) => r.estado === 'COMPLETADO').length,
      procesando: reportes.filter(
        (r) => r.estado === 'PROCESANDO' || r.estado === 'PENDIENTE',
      ).length,
      fallidos: reportes.filter((r) => r.estado === 'FALLIDO').length,
    };
  }, [reportes]);

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Centro de reportes
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Generación de Reportes
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Exporta información del sistema en formato PDF profesional para
              seguimiento académico, laboral y de gestión institucional.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarReportes}
            disabled={loadingReportes}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-80 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingReportes ? 'animate-spin' : ''}`}
            />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={resumen.total}
          icon={FileText}
          color="#2563EB"
          subtitle="Reportes solicitados"
        />

        <StatCard
          title="Completados"
          value={resumen.completados}
          icon={CheckCircle2}
          color="#10B981"
          subtitle="Listos para descargar"
        />

        <StatCard
          title="En proceso"
          value={resumen.procesando}
          icon={Clock}
          color="#F59E0B"
          subtitle="Pendientes o procesando"
        />

        <StatCard
          title="Fallidos"
          value={resumen.fallidos}
          icon={XCircle}
          color="#EF4444"
          subtitle="No generados"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)] shadow-sm">
                <Settings2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                  Configurar reporte
                </h2>
                <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
                  Selecciona el tipo y parámetros antes de generar el PDF.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {['operacional', 'gestion'].map((cat) => (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-bg-subtle)]">
                      {cat === 'operacional' ? (
                        <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-[var(--color-text-muted)]" />
                      )}
                    </div>

                    <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                      {cat === 'operacional'
                        ? 'Reportes operacionales'
                        : 'Reportes de gestión'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {TIPOS_REPORTE.filter((t) => t.tipo === cat).map((t) => {
                      const active = tipo === t.id;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTipo(t.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                            active
                              ? 'border-blue-400/30 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/10'
                              : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-blue-400/30 hover:bg-blue-500/10'
                          }`}
                        >
                          <p
                            className={`text-sm font-black ${
                              active
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-[var(--color-text-primary)]'
                            }`}
                          >
                            {t.label}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs font-medium text-[var(--color-text-muted)]">
                            {t.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {tipoSeleccionado && (
              <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  <Filter className="h-3.5 w-3.5" />
                  Descripción
                </p>

                <p className="text-sm font-semibold leading-6 text-blue-900/70 dark:text-blue-100/80">
                  {tipoSeleccionado.desc}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              {tipo === 'egresados_carrera' && (
                <div>
                  <label className={labelClass}>
                    Carrera
                  </label>

                  <input
                    placeholder="Ej: Ingeniería de Sistemas"
                    onChange={(e) =>
                      setParametros((p: any) => ({
                        ...p,
                        carrera: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              )}

              {tipo === 'empleabilidad' && (
                <div>
                  <label className={labelClass}>
                    Año de egreso
                  </label>

                  <input
                    type="number"
                    placeholder="Ej: 2022"
                    min={2000}
                    max={2030}
                    onChange={(e) =>
                      setParametros((p: any) => ({
                        ...p,
                        anioEgreso: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerar}
                disabled={generando}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {generando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Reportes generados
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
                {loadingReportes
                  ? 'Cargando historial...'
                  : `${reportes.length} reporte(s) registrado(s)`}
              </p>
            </div>

            <button
              type="button"
              onClick={cargarReportes}
              disabled={loadingReportes}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition hover:-translate-y-0.5 hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingReportes ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {loadingReportes ? (
            <div className="divide-y divide-[var(--color-border)]">
              {Array.from({ length: 5 }).map((_, index) => (
                <ReportSkeleton key={index} />
              ))}
            </div>
          ) : reportes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                <FileText className="h-8 w-8 text-[var(--color-text-muted)]" />
              </div>

              <h3 className="mt-5 text-lg font-display font-extrabold text-[var(--color-text-primary)]">
                Sin reportes generados
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Configura el tipo de reporte y genera tu primer PDF profesional.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {reportes.map((r) => {
                const est = estadoIcon[r.estado] || estadoIcon.PENDIENTE;
                const EstIcon = est.icon;
                const isPolling = polling.has(r.id);
                const reporteLabel =
                  TIPOS_REPORTE.find((t) => t.id === r.tipo)?.label || r.tipo;
                const isDownloading = descargando === r.id;

                return (
                  <article
                    key={r.id}
                    className="group flex flex-col gap-4 px-6 py-5 transition-all hover:bg-[var(--color-bg-subtle)] lg:flex-row lg:items-center"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${est.bg} ring-1 ${est.ring}`}
                    >
                      <EstIcon
                        className={`h-6 w-6 ${
                          est.spin || isPolling ? 'animate-spin' : ''
                        }`}
                        style={{ color: est.color }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${est.bg} ${est.text} ${est.ring}`}
                        >
                          {est.label}
                        </span>

                        {isPolling && (
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white ring-1 ring-blue-400/20">
                            Actualizando
                          </span>
                        )}
                      </div>

                      <h3 className="truncate text-sm font-black text-[var(--color-text-primary)]">
                        {reporteLabel}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-[var(--color-text-muted)]">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>

                    {r.estado === 'COMPLETADO' && r.urlArchivo && (
                      <button
                        type="button"
                        onClick={() => descargarReporte(r)}
                        disabled={isDownloading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        {isDownloading ? 'Descargando...' : 'Descargar'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}