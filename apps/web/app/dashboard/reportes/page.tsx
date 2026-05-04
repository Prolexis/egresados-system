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
    color: '#f59e0b',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-100 dark:ring-amber-500/20',
    label: 'Pendiente',
  },
  PROCESANDO: {
    icon: Loader2,
    color: '#2563eb',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-100 dark:ring-blue-500/20',
    label: 'Procesando',
    spin: true,
  },
  COMPLETADO: {
    icon: CheckCircle2,
    color: '#10b981',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-100 dark:ring-emerald-500/20',
    label: 'Completado',
  },
  FALLIDO: {
    icon: XCircle,
    color: '#f43f5e',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-100 dark:ring-rose-500/20',
    label: 'Fallido',
  },
};

function formatDate(value?: string) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleString('es-PE', {
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
    <article className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover:scale-110"
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

function ReportSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10" />

      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
      </div>

      <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/10" />
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

        setReportes((prev) => prev.map((rep) => (rep.id === id ? r : rep)));

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
    <main className="space-y-5 animate-fadeIn">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 px-6 py-5 shadow-md shadow-blue-100/50 dark:border-slate-700 dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:shadow-none">
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/15" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Centro de reportes
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
              Generación de Reportes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Exporta información del sistema en formato PDF profesional para
              seguimiento académico, laboral y de gestión institucional.
            </p>
          </div>

          <button
            type="button"
            onClick={cargarReportes}
            disabled={loadingReportes}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingReportes ? 'animate-spin' : ''}`}
            />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={resumen.total}
          icon={FileText}
          color="#2563eb"
          subtitle="Reportes solicitados"
        />

        <StatCard
          title="Completados"
          value={resumen.completados}
          icon={CheckCircle2}
          color="#10b981"
          subtitle="Listos para descargar"
        />

        <StatCard
          title="En proceso"
          value={resumen.procesando}
          icon={Clock}
          color="#f59e0b"
          subtitle="Pendientes o procesando"
        />

        <StatCard
          title="Fallidos"
          value={resumen.fallidos}
          icon={XCircle}
          color="#f43f5e"
          subtitle="No generados"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-100/50 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20">
                <Settings2 className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>

              <div>
                <h2 className="text-base font-black text-slate-950 dark:text-white">
                  Configurar reporte
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
                  Selecciona el tipo y parámetros antes de generar el PDF.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {['operacional', 'gestion'].map((cat) => (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 dark:bg-white/10 dark:ring-white/10">
                      {cat === 'operacional' ? (
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      )}
                    </div>

                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/45">
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
                              ? 'border-blue-200 bg-blue-50 shadow-sm shadow-blue-100/70 dark:border-blue-500/30 dark:bg-blue-500/10 dark:shadow-none'
                              : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30 dark:hover:bg-white/10'
                          }`}
                        >
                          <p
                            className={`text-sm font-black ${
                              active
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-slate-700 dark:text-white/80'
                            }`}
                          >
                            {t.label}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-400 dark:text-white/45">
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
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
                <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  <Filter className="h-3.5 w-3.5" />
                  Descripción
                </p>

                <p className="text-sm font-semibold leading-6 text-blue-900/70 dark:text-blue-100/75">
                  {tipoSeleccionado.desc}
                </p>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {tipo === 'egresados_carrera' && (
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/45">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-white/15 dark:focus:ring-blue-500/20"
                  />
                </div>
              )}

              {tipo === 'empleabilidad' && (
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-white/45">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-white/15 dark:focus:ring-blue-500/20"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerar}
                disabled={generando}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:from-blue-700 hover:via-sky-600 hover:to-indigo-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:shadow-none"
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

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/50 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white">
                Reportes generados
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-400 dark:text-white/45">
                {loadingReportes
                  ? 'Cargando historial...'
                  : `${reportes.length} reporte(s) registrado(s)`}
              </p>
            </div>

            <button
              type="button"
              onClick={cargarReportes}
              disabled={loadingReportes}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white text-slate-400 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white/55 dark:hover:bg-white/15 dark:hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingReportes ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {loadingReportes ? (
            <div className="divide-y divide-slate-100 dark:divide-white/10">
              {Array.from({ length: 5 }).map((_, index) => (
                <ReportSkeleton key={index} />
              ))}
            </div>
          ) : reportes.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 ring-1 ring-blue-100 dark:bg-white/10 dark:ring-white/10">
                <FileText className="h-7 w-7 text-blue-300 dark:text-white/35" />
              </div>

              <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                Sin reportes generados
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/55">
                Configura el tipo de reporte y genera tu primer PDF profesional.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/10">
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
                    className="group flex flex-col gap-4 px-5 py-4 transition-all hover:bg-blue-50/40 dark:hover:bg-white/5 lg:flex-row lg:items-center"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${est.bg} ring-1 ${est.ring}`}
                    >
                      <EstIcon
                        className={`h-5 w-5 ${
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
                          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                            Actualizando
                          </span>
                        )}
                      </div>

                      <h3 className="truncate text-sm font-black text-slate-950 dark:text-white">
                        {reporteLabel}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-slate-400 dark:text-white/45">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>

                    {r.estado === 'COMPLETADO' && r.urlArchivo && (
                      <button
                        type="button"
                        onClick={() => descargarReporte(r)}
                        disabled={isDownloading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-sm shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
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
