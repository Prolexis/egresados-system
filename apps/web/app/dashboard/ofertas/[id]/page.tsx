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
  Info,
  ShieldCheck,
  BadgeCheck,
  FileText,
  Target,
} from 'lucide-react';

const modalidadColors: Record<string, { bg: string; text: string; ring: string }> = {
  REMOTO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
  },
  HIBRIDO: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-300',
    ring: 'ring-indigo-500/20',
  },
  PRESENCIAL: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
  },
};

const estadoColors: Record<string, { bg: string; text: string; ring: string }> = {
  ACTIVA: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-500/20',
  },
  CERRADA: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
    ring: 'ring-rose-500/20',
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

function getDeadlineText(daysLeft: number | null) {
  if (daysLeft === null) return 'No definido';
  if (daysLeft < 0) return 'Plazo vencido';
  if (daysLeft === 0) return 'Cierra hoy';
  if (daysLeft === 1) return 'Cierra mañana';
  return `${daysLeft} días`;
}

function getAlertConfig(daysLeft: number | null, estado?: string) {
  if (estado !== 'ACTIVA') {
    return {
      icon: ShieldCheck,
      title: 'Oferta cerrada',
      message: 'Esta convocatoria ya no se encuentra disponible para nuevas postulaciones.',
      className:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      iconClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    };
  }

  if (daysLeft === null) {
    return {
      icon: Info,
      title: 'Convocatoria activa',
      message: 'La oferta se encuentra disponible. Revisa la descripción, fechas y requisitos antes de postular.',
      className:
        'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
      iconClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    };
  }

  if (daysLeft < 0) {
    return {
      icon: AlertTriangle,
      title: 'Plazo vencido',
      message: 'La fecha límite de postulación ya finalizó.',
      className:
        'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      iconClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    };
  }

  if (daysLeft === 0) {
    return {
      icon: AlertTriangle,
      title: 'Último día para postular',
      message: 'La convocatoria cierra hoy. Se recomienda enviar la postulación cuanto antes.',
      className:
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
  }

  if (daysLeft <= 7) {
    return {
      icon: AlertTriangle,
      title: 'Cierre próximo',
      message: `Quedan ${daysLeft} días para postular. Aún estás a tiempo de participar.`,
      className:
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    };
  }

  return {
    icon: Info,
    title: 'Convocatoria activa',
    message: `Quedan ${daysLeft} días disponibles para enviar la postulación.`,
    className:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  };
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: any;
  label: string;
  value: string | number;
  tone?: 'default' | 'blue' | 'emerald' | 'amber';
}) {
  const toneClass = {
    default: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }[tone];

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-sm font-black text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>
      </div>
    </div>
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
      className={`group flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        danger
          ? 'border-rose-500/20 bg-rose-500/10'
          : highlight
            ? 'border-amber-500/20 bg-amber-500/10'
            : 'border-[var(--color-border)] bg-[var(--color-bg-surface)]'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105 ${
          danger
            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
            : highlight
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </p>
        <p
          className={`mt-1 text-sm font-semibold leading-6 ${
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
  );
}

function AlertBox({
  daysLeft,
  estado,
}: {
  daysLeft: number | null;
  estado?: string;
}) {
  const alert = getAlertConfig(daysLeft, estado);
  const Icon = alert.icon;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${alert.className}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${alert.iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-black">{alert.title}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  tone = 'blue',
}: {
  icon: any;
  eyebrow: string;
  title: string;
  tone?: 'blue' | 'indigo' | 'emerald';
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    indigo: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  }[tone];

  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          {eyebrow}
        </p>
        <h2 className="text-xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>
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
        <section className="h-52 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm" />

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
        <section className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <Briefcase className="h-8 w-8 text-[var(--color-text-muted)]" />
          </div>

          <h2 className="mt-5 text-xl font-display font-black text-[var(--color-text-primary)]">
            Oferta no encontrada
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[var(--color-text-secondary)]">
            No se pudo cargar la información de esta convocatoria.
          </p>

          <Link
            href="/dashboard/ofertas"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ofertas
          </Link>
        </section>
      </main>
    );
  }

  const daysLeft = getDaysLeft(oferta.fechaFin);
  const isExpired = daysLeft !== null && daysLeft < 0;
  const isClosingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const canApply = oferta.estado === 'ACTIVA' && !isExpired;

  const mColors = modalidadColors[oferta.modalidad] || {
    bg: 'bg-[var(--color-bg-subtle)]',
    text: 'text-[var(--color-text-secondary)]',
    ring: 'ring-[var(--color-border)]',
  };

  const eColors = estadoColors[oferta.estado] || {
    bg: 'bg-[var(--color-bg-subtle)]',
    text: 'text-[var(--color-text-secondary)]',
    ring: 'ring-[var(--color-border)]',
  };

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/dashboard/ofertas"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:text-[var(--color-text-primary)] hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a ofertas
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${eColors.bg} ${eColors.text} ${eColors.ring}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {oferta.estado}
              </Badge>

              <Badge className={`${mColors.bg} ${mColors.text} ${mColors.ring}`}>
                <Briefcase className="h-3.5 w-3.5" />
                {oferta.modalidad}
              </Badge>

              {isClosingSoon && canApply && (
                <Badge className="bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Cierre próximo
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_300px] lg:items-start">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-2xl font-display font-black text-blue-700 shadow-sm dark:text-blue-300">
                {oferta.empresa?.nombreComercial?.[0] || 'E'}
              </div>

              <div className="min-w-0">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Detalle de oferta laboral
                </div>

                <h1 className="max-w-4xl text-3xl font-display font-black tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                  {oferta.titulo}
                </h1>

                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                  <Building2 className="h-5 w-5" />
                  {oferta.empresa?.nombreComercial || 'Empresa'}
                  {oferta.empresa?.sector && ` · ${oferta.empresa.sector}`}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {oferta.ubicacion && (
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                      <MapPin className="h-4 w-4" />
                      {oferta.ubicacion}
                    </span>
                  )}

                  {oferta.tipoContrato && (
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                      <Briefcase className="h-4 w-4" />
                      {oferta.tipoContrato.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Acción disponible
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                {postulada
                  ? 'Tu postulación ya fue registrada para esta oferta.'
                  : canApply
                    ? 'Revisa los detalles y envía tu postulación cuando estés listo.'
                    : 'La oferta no se encuentra disponible para postular.'}
              </p>

              {user?.role === 'EGRESADO' && (
                <button
                  onClick={handlePostular}
                  disabled={postulada || postulando || !canApply}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                    postulada
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : !canApply
                        ? 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)]'
                        : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-500'
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
                  ) : !canApply ? (
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

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            <HeroMetric
              icon={CalendarDays}
              label="Fecha de inicio"
              value={formatShortDate(oferta.fechaInicio)}
              tone="blue"
            />

            <HeroMetric
              icon={Timer}
              label="Tiempo restante"
              value={getDeadlineText(daysLeft)}
              tone={
                daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
                  ? 'amber'
                  : daysLeft !== null && daysLeft < 0
                    ? 'default'
                    : 'emerald'
              }
            />

            <HeroMetric
              icon={Users}
              label="Postulantes"
              value={`${oferta._count?.postulaciones ?? 0} aplicaciones`}
              tone="default"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        <div className="space-y-7 lg:col-span-2">
          <AlertBox daysLeft={daysLeft} estado={oferta.estado} />

          <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
            <SectionHeader
              icon={FileText}
              eyebrow="Información principal"
              title="Descripción del cargo"
              tone="blue"
            />

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5">
              <p className="whitespace-pre-line text-sm font-medium leading-7 text-[var(--color-text-secondary)]">
                {oferta.descripcion}
              </p>
            </div>
          </section>

          {oferta.habilidades?.length > 0 && (
            <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
              <SectionHeader
                icon={Target}
                eyebrow="Perfil esperado"
                title="Habilidades requeridas"
                tone="indigo"
              />

              <div className="flex flex-wrap gap-2">
                {oferta.habilidades.map((h: any) => (
                  <span
                    key={h.habilidadId}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ring-1 transition hover:-translate-y-0.5 hover:shadow-sm ${
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
          <section className="sticky top-6 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                <Info className="h-3.5 w-3.5" />
                Resumen
              </div>

              <h2 className="text-xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
                Detalles de la oferta
              </h2>

              <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">
                Datos clave de la convocatoria laboral.
              </p>
            </div>

            <div className="space-y-4">
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
                  value={getDeadlineText(daysLeft)}
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
