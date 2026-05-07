'use client';

import { useEffect, useState } from 'react';
import { ofertasApi, postulacionesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  CalendarDays,
  Timer,
  AlertTriangle,
  BellRing,
  BadgeCheck,
  Flame,
  ShieldCheck,
  Star,
  Target,
  Zap,
} from 'lucide-react';

const modalidadColors: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
  REMOTO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/20',
  },
  HIBRIDO: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    ring: 'ring-fuchsia-500/20',
    glow: 'shadow-fuchsia-500/20',
  },
  PRESENCIAL: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
};

const estadoColors: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
  ACTIVA: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/20',
  },
  CERRADA: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
    glow: 'shadow-rose-500/20',
  },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(dateStr?: string) {
  if (!dateStr) return '—';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysLeft(dateStr?: string) {
  if (!dateStr) return null;

  const endDate = new Date(dateStr);

  if (Number.isNaN(endDate.getTime())) return null;

  return Math.ceil(
    (endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );
}

function getUrgencyInfo(daysLeft: number | null, estado?: string) {
  if (estado !== 'ACTIVA') {
    return {
      title: 'Oferta cerrada',
      message: 'Esta convocatoria ya no se encuentra disponible para nuevas postulaciones.',
      icon: ShieldCheck,
      badge: 'CERRADA',
      container:
        'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-red-500/10 to-orange-500/10',
      iconBox: 'bg-rose-500 text-white shadow-rose-500/30',
      text: 'text-rose-700 dark:text-rose-300',
      badgeClass: 'bg-rose-600 text-white',
    };
  }

  if (daysLeft === null) {
    return {
      title: 'Convocatoria activa',
      message: 'La oferta se encuentra disponible. Revisa los requisitos antes de postular.',
      icon: BellRing,
      badge: 'ACTIVA',
      container:
        'border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-sky-500/10',
      iconBox: 'bg-blue-600 text-white shadow-blue-500/30',
      text: 'text-blue-700 dark:text-blue-300',
      badgeClass: 'bg-blue-600 text-white',
    };
  }

  if (daysLeft < 0) {
    return {
      title: 'Plazo vencido',
      message: 'La fecha límite de postulación ya finalizó.',
      icon: AlertTriangle,
      badge: 'VENCIDA',
      container:
        'border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-red-500/10 to-orange-500/10',
      iconBox: 'bg-rose-600 text-white shadow-rose-500/30',
      text: 'text-rose-700 dark:text-rose-300',
      badgeClass: 'bg-rose-600 text-white',
    };
  }

  if (daysLeft === 0) {
    return {
      title: 'Último día para postular',
      message: 'La convocatoria cierra hoy. Esta es una alerta crítica para el postulante.',
      icon: Flame,
      badge: 'HOY',
      container:
        'border-red-500/30 bg-gradient-to-br from-red-500/15 via-orange-500/15 to-amber-500/15',
      iconBox: 'bg-red-600 text-white shadow-red-500/40',
      text: 'text-red-700 dark:text-red-300',
      badgeClass: 'bg-red-600 text-white animate-pulse',
    };
  }

  if (daysLeft <= 3) {
    return {
      title: 'Cierre crítico',
      message: `Solo quedan ${daysLeft} días para postular. Esta oferta requiere atención inmediata.`,
      icon: Flame,
      badge: `${daysLeft} DÍAS`,
      container:
        'border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-amber-500/15 to-yellow-500/15',
      iconBox: 'bg-orange-500 text-white shadow-orange-500/40',
      text: 'text-orange-700 dark:text-orange-300',
      badgeClass: 'bg-orange-500 text-white animate-pulse',
    };
  }

  if (daysLeft <= 7) {
    return {
      title: 'Cierre próximo',
      message: `Quedan ${daysLeft} días para postular. Aún estás a tiempo, pero no lo dejes pasar.`,
      icon: AlertTriangle,
      badge: `${daysLeft} DÍAS`,
      container:
        'border-amber-500/25 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/10',
      iconBox: 'bg-amber-500 text-white shadow-amber-500/30',
      text: 'text-amber-700 dark:text-amber-300',
      badgeClass: 'bg-amber-500 text-white',
    };
  }

  return {
    title: 'Convocatoria activa',
    message: `Quedan ${daysLeft} días disponibles para enviar la postulación.`,
    icon: BellRing,
    badge: `${daysLeft} DÍAS`,
    container:
      'border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-blue-500/10',
    iconBox: 'bg-emerald-600 text-white shadow-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    badgeClass: 'bg-emerald-600 text-white',
  };
}

function StatusBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider ring-1 shadow-sm ${className}`}
    >
      {children}
    </span>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  highlight = false,
  danger = false,
}: {
  icon: any;
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        danger
          ? 'border-rose-500/20 bg-rose-500/10'
          : highlight
            ? 'border-amber-500/20 bg-amber-500/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]'
      }`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/30 blur-2xl dark:bg-white/5" />

      <div className="relative flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-110 ${
            danger
              ? 'bg-rose-600 text-white shadow-rose-500/30'
              : highlight
                ? 'bg-amber-500 text-white shadow-amber-500/30'
                : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {label}
          </p>
          <p
            className={`mt-1 text-sm font-black leading-6 ${
              danger
                ? 'text-rose-700 dark:text-rose-300'
                : highlight
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-[var(--color-text-primary)]'
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  urgency,
}: {
  urgency: ReturnType<typeof getUrgencyInfo>;
}) {
  const Icon = urgency.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-lg ${urgency.container}`}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/30 blur-3xl dark:bg-white/10" />
      <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-white/20 blur-3xl dark:bg-white/5" />

      <div className="relative flex items-start gap-4">
        <div
          className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-3xl shadow-xl ${urgency.iconBox}`}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${urgency.badgeClass}`}
            >
              {urgency.badge}
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700 ring-1 ring-white/80 dark:bg-white/10 dark:text-white dark:ring-white/10">
              Alerta de postulación
            </span>
          </div>

          <h3 className={`text-base font-black ${urgency.text}`}>
            {urgency.title}
          </h3>

          <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
            {urgency.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: any;
  label: string;
  value: string | number;
  tone?: 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const tones = {
    blue: 'from-blue-600 to-indigo-600 shadow-blue-500/25',
    emerald: 'from-emerald-600 to-teal-600 shadow-emerald-500/25',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/25',
    violet: 'from-violet-600 to-fuchsia-600 shadow-violet-500/25',
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-white/50">
            {label}
          </p>
          <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OfertaDetallePage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const [oferta, setOferta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postulada, setPostulada] = useState(false);
  const [postulando, setPostulando] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const data = await ofertasApi.get(params.id);
      setOferta(data);

      if (user?.role === 'EGRESADO') {
        const posts = await postulacionesApi.misPostulaciones();
        const hasPostulado = posts.some((p: any) => p.ofertaId === params.id);
        setPostulada(hasPostulado);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const handlePostular = async () => {
    if (postulada || postulando) return;

    setPostulando(true);

    try {
      await postulacionesApi.postular(params.id);
      setPostulada(true);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al postular');
    } finally {
      setPostulando(false);
    }
  };

  if (loading) {
    return (
      <main className="space-y-7 animate-pulse">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="h-8 w-44 rounded-2xl bg-[var(--color-bg-subtle)]" />
          <div className="mt-8 h-12 w-2/3 rounded-2xl bg-[var(--color-bg-subtle)]" />
          <div className="mt-4 h-5 w-1/2 rounded-xl bg-[var(--color-bg-subtle)]" />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm lg:col-span-2" />
          <div className="h-80 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm" />
        </section>
      </main>
    );
  }

  if (!oferta) {
    return (
      <main className="space-y-7 animate-fadeIn">
        <section className="relative overflow-hidden rounded-[2rem] border border-dashed border-rose-300/60 bg-rose-500/10 px-6 py-16 text-center shadow-sm">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-rose-400/20 bg-white text-rose-600 shadow-xl dark:bg-white/10 dark:text-rose-300">
            <Briefcase className="h-9 w-9" />
          </div>

          <h2 className="relative mt-6 text-2xl font-display font-black text-[var(--color-text-primary)]">
            Oferta no encontrada
          </h2>

          <p className="relative mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--color-text-secondary)]">
            No se pudo cargar la información de esta convocatoria laboral.
          </p>

          <Link
            href="/dashboard/ofertas"
            className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ofertas
          </Link>
        </section>
      </main>
    );
  }

  const daysLeft = getDaysLeft(oferta.fechaFin);
  const urgency = getUrgencyInfo(daysLeft, oferta.estado);

  const mColors = modalidadColors[oferta.modalidad] || {
    bg: 'bg-[var(--color-bg-subtle)]',
    text: 'text-[var(--color-text-secondary)]',
    ring: 'ring-[var(--color-border)]',
    glow: 'shadow-slate-500/10',
  };

  const eColors = estadoColors[oferta.estado] || {
    bg: 'bg-[var(--color-bg-subtle)]',
    text: 'text-[var(--color-text-secondary)]',
    ring: 'ring-[var(--color-border)]',
    glow: 'shadow-slate-500/10',
  };

  const isOfertaActiva = oferta.estado === 'ACTIVA';
  const isClosingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-0 text-white shadow-2xl shadow-blue-950/20 dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.35),transparent_28%)]" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute left-8 top-8 h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60" />
        <div className="absolute left-8 top-8 h-3 w-3 animate-ping rounded-full bg-emerald-400" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/ofertas"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-black text-white shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a ofertas
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge
                className={`${eColors.bg} ${eColors.text} ${eColors.ring} bg-white/10 text-white ring-white/20`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {oferta.estado}
              </StatusBadge>

              <StatusBadge
                className={`${mColors.bg} ${mColors.text} ${mColors.ring} bg-white/10 text-white ring-white/20`}
              >
                <Zap className="h-3.5 w-3.5" />
                {oferta.modalidad}
              </StatusBadge>

              {isClosingSoon && isOfertaActiva && (
                <StatusBadge className="bg-orange-500 text-white ring-orange-300/40 shadow-lg shadow-orange-500/30 animate-pulse">
                  <Flame className="h-3.5 w-3.5" />
                  Urgente
                </StatusBadge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100 shadow-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Detalle de oferta laboral
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 text-3xl font-display font-black text-white shadow-2xl backdrop-blur-xl">
                  {oferta.empresa?.nombreComercial?.[0] || 'E'}
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-4xl font-display font-black tracking-tight text-white sm:text-5xl">
                    {oferta.titulo}
                  </h1>

                  <p className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold leading-6 text-blue-100">
                    <Building2 className="h-5 w-5 text-cyan-300" />
                    {oferta.empresa?.nombreComercial || 'Empresa'} 
                    {oferta.empresa?.sector && ` · ${oferta.empresa.sector}`}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {oferta.ubicacion && (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
                        <MapPin className="h-4 w-4 text-cyan-300" />
                        {oferta.ubicacion}
                      </span>
                    )}

                    {oferta.tipoContrato && (
                      <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl">
                        <Briefcase className="h-4 w-4 text-cyan-300" />
                        {oferta.tipoContrato.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                  <BellRing className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">
                    Estado de postulación
                  </p>
                  <h3 className="text-base font-black text-white">
                    {postulada ? 'Postulación registrada' : 'Acción recomendada'}
                  </h3>
                </div>
              </div>

              <p className="mb-5 text-sm font-semibold leading-6 text-blue-100">
                {postulada
                  ? 'Ya enviaste tu postulación para esta oferta laboral.'
                  : isOfertaActiva && !isExpired
                    ? 'Revisa los requisitos y postula antes de que cierre la convocatoria.'
                    : 'Esta oferta no se encuentra disponible para postular.'}
              </p>

              {user?.role === 'EGRESADO' && (
                <button
                  onClick={handlePostular}
                  disabled={postulada || postulando || oferta.estado !== 'ACTIVA' || isExpired}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3.5 text-sm font-black shadow-xl transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                    postulada
                      ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100'
                      : oferta.estado !== 'ACTIVA' || isExpired
                        ? 'border-white/10 bg-white/10 text-white/60'
                        : 'border-white/20 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-blue-500/30 hover:shadow-2xl'
                  }`}
                >
                  {postulada ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Ya postulado
                    </>
                  ) : postulando ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : oferta.estado !== 'ACTIVA' || isExpired ? (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Oferta cerrada
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Postularme ahora
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              icon={CalendarDays}
              label="Inicio"
              value={formatShortDate(oferta.fechaInicio)}
              tone="blue"
            />

            <MetricCard
              icon={Timer}
              label="Tiempo restante"
              value={
                daysLeft === null
                  ? 'No definido'
                  : daysLeft < 0
                    ? 'Vencido'
                    : daysLeft === 0
                      ? 'Cierra hoy'
                      : `${daysLeft} días`
              }
              tone={isClosingSoon ? 'amber' : 'emerald'}
            />

            <MetricCard
              icon={Users}
              label="Postulantes"
              value={`${oferta._count?.postulaciones ?? 0} aplicaciones`}
              tone="violet"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          <AlertCard urgency={urgency} />

          <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Información principal
                </p>
                <h2 className="text-2xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
                  Descripción del cargo
                </h2>
              </div>
            </div>

            <div className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
              <p className="whitespace-pre-line text-base font-medium leading-8 text-[var(--color-text-secondary)]">
                {oferta.descripcion}
              </p>
            </div>
          </section>

          {oferta.habilidades?.length > 0 && (
            <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
                  <Star className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    Perfil esperado
                  </p>
                  <h2 className="text-2xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
                    Habilidades requeridas
                  </h2>
                </div>
              </div>

              <div className="relative flex flex-wrap gap-3">
                {oferta.habilidades.map((h: any) => (
                  <span
                    key={h.habilidadId}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-black ring-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      h.requerido
                        ? 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300'
                        : 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                    }`}
                  >
                    {h.requerido ? (
                      <BadgeCheck className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {h.habilidad?.nombre}
                    {h.requerido && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                        Requerido
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <section className="sticky top-6 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-xl">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" />
                Resumen ejecutivo
              </div>

              <h2 className="text-xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
                Detalles de la oferta
              </h2>

              <p className="mt-1 text-sm font-semibold text-[var(--color-text-secondary)]">
                Información clave para evaluar esta convocatoria.
              </p>
            </div>

            <div className="relative space-y-4">
              {oferta.ubicacion && (
                <DetailItem
                  icon={MapPin}
                  label="Ubicación"
                  value={oferta.ubicacion}
                />
              )}

              {oferta.tipoContrato && (
                <DetailItem
                  icon={Briefcase}
                  label="Tipo de contrato"
                  value={oferta.tipoContrato.replace('_', ' ')}
                />
              )}

              <DetailItem
                icon={CalendarDays}
                label="Fecha de inicio"
                value={formatDate(oferta.fechaInicio)}
              />

              <DetailItem
                icon={Calendar}
                label="Fecha de cierre"
                value={formatDate(oferta.fechaFin)}
                highlight={daysLeft !== null && daysLeft >= 0 && daysLeft <= 10}
                danger={daysLeft !== null && daysLeft < 0}
              />

              {daysLeft !== null && (
                <DetailItem
                  icon={Timer}
                  label="Tiempo restante"
                  value={
                    daysLeft < 0
                      ? 'Plazo vencido'
                      : daysLeft === 0
                        ? 'Cierra hoy'
                        : `${daysLeft} días`
                  }
                  highlight={daysLeft >= 0 && daysLeft <= 7}
                  danger={daysLeft < 0}
                />
              )}

              {(oferta.salarioMin || oferta.salarioMax) && (
                <DetailItem
                  icon={DollarSign}
                  label="Rango salarial"
                  value={`S/ ${oferta.salarioMin ?? '—'} – ${oferta.salarioMax ?? '—'}`}
                />
              )}

              <DetailItem
                icon={Calendar}
                label="Publicado"
                value={formatShortDate(oferta.createdAt)}
              />

              <DetailItem
                icon={Users}
                label="Postulantes"
                value={`${oferta._count?.postulaciones ?? 0} aplicaciones`}
              />

              <DetailItem
                icon={Clock}
                label="Estado"
                value={oferta.estado}
                highlight={oferta.estado === 'ACTIVA'}
                danger={oferta.estado !== 'ACTIVA'}
              />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
