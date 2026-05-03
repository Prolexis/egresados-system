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
} from 'lucide-react';

const modalidadColors: Record<string, { bg: string; text: string; ring: string }> = {
  REMOTO: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    ring: 'ring-blue-500/20',
  },
  HIBRIDO: {
    bg: 'bg-fuchsia-500/10',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    ring: 'ring-fuchsia-500/20',
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

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)]">
        <Icon className="h-5 w-5 text-[var(--color-text-muted)]" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
          {value}
        </p>
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
      <div className="space-y-7 animate-pulse">
        <div className="h-32 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm" />

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
          <div className="mb-6 h-8 w-2/3 rounded-xl bg-[var(--color-bg-subtle)]" />
          <div className="mb-4 h-4 w-1/2 rounded-lg bg-[var(--color-bg-subtle)]" />
          <div className="h-4 w-3/4 rounded-lg bg-[var(--color-bg-subtle)]" />
        </div>
      </div>
    );
  }

  if (!oferta) {
    return (
      <main className="space-y-7 animate-fadeIn">
        <section className="rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
            <Briefcase className="h-8 w-8 text-[var(--color-text-muted)]" />
          </div>

          <h2 className="mt-5 text-xl font-display font-extrabold text-[var(--color-text-primary)]">
            Oferta no encontrada
          </h2>

          <Link
            href="/dashboard/ofertas"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ofertas
          </Link>
        </section>
      </main>
    );
  }

  const mColors =
    modalidadColors[oferta.modalidad] || {
      bg: 'bg-[var(--color-bg-subtle)]',
      text: 'text-[var(--color-text-secondary)]',
      ring: 'ring-[var(--color-border)]',
    };

  const eColors =
    estadoColors[oferta.estado] || {
      bg: 'bg-[var(--color-bg-subtle)]',
      text: 'text-[var(--color-text-secondary)]',
      ring: 'ring-[var(--color-border)]',
    };

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-6">
          <Link
            href="/dashboard/ofertas"
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 hover:shadow-lg dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a ofertas
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-white text-2xl font-display font-extrabold text-blue-700 shadow-lg dark:border-white/10 dark:bg-white/10 dark:text-blue-300">
                {oferta.empresa?.nombreComercial?.[0]}
              </div>

              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  Detalle de oferta laboral
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${eColors.bg} ${eColors.text} ${eColors.ring}`}
                  >
                    {oferta.estado}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${mColors.bg} ${mColors.text} ${mColors.ring}`}
                  >
                    {oferta.modalidad}
                  </span>
                </div>

                <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
                  {oferta.titulo}
                </h1>

                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold leading-6 text-slate-600 dark:text-white/70">
                  <Building2 className="h-5 w-5" />
                  {oferta.empresa?.nombreComercial} · {oferta.empresa?.sector}
                </p>
              </div>
            </div>

            {user?.role === 'EGRESADO' && (
              <button
                onClick={handlePostular}
                disabled={postulada || postulando || oferta.estado !== 'ACTIVA'}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
                  postulada
                    ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : oferta.estado !== 'ACTIVA'
                      ? 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
                      : 'border-blue-400/20 bg-blue-600 text-white hover:bg-blue-500'
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
                ) : oferta.estado !== 'ACTIVA' ? (
                  'Oferta cerrada'
                ) : (
                  'Postularme ahora'
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 p-8">
            <section className="mb-10">
              <h2 className="mb-4 text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Descripción del cargo
              </h2>

              <p className="leading-relaxed text-[var(--color-text-secondary)]">
                {oferta.descripcion}
              </p>
            </section>

            {oferta.habilidades?.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                  Habilidades requeridas
                </h2>

                <div className="flex flex-wrap gap-2">
                  {oferta.habilidades.map((h: any) => (
                    <span
                      key={h.habilidadId}
                      className={`rounded-2xl px-4 py-2 text-sm font-bold ring-1 ${
                        h.requerido
                          ? 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300'
                          : 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                      }`}
                    >
                      {h.habilidad?.nombre}
                      {h.requerido && ' · Requerido'}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-8 lg:border-l lg:border-t-0">
            <h2 className="mb-6 text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Detalles de la oferta
            </h2>

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
                value={new Date(oferta.createdAt).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
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
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}