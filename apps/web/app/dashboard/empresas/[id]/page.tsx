'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { empresasApi } from '@/lib/api';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  CheckCircle2,
  Edit,
  FileText,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Save,
  Trash2,
  X,
  ShieldCheck,
  Sparkles,
  Database,
  Activity,
  ExternalLink,
  Landmark,
  BadgeCheck,
  AlertTriangle,
  Factory,
} from 'lucide-react';

type FormState = {
  email: string;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  sector: string;
  ubicacion: string;
  sitioWeb: string;
  descripcion: string;
  logoUrl: string;
};

const emptyForm: FormState = {
  email: '',
  nombreComercial: '',
  razonSocial: '',
  ruc: '',
  sector: '',
  ubicacion: '',
  sitioWeb: '',
  descripcion: '',
  logoUrl: '',
};

function getInitial(nombre?: string) {
  return nombre?.trim()?.charAt(0)?.toUpperCase() || 'E';
}

function buildForm(data: any): FormState {
  return {
    email: data?.user?.email ?? '',
    nombreComercial: data?.nombreComercial ?? '',
    razonSocial: data?.razonSocial ?? '',
    ruc: data?.ruc ?? '',
    sector: data?.sector ?? '',
    ubicacion: data?.ubicacion ?? '',
    sitioWeb: data?.sitioWeb ?? '',
    descripcion: data?.descripcion ?? '',
    logoUrl: data?.logoUrl ?? '',
  };
}

function normalizeUrl(value?: string | null) {
  if (!value) return '';
  const url = String(value).trim();
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

function TopButton({
  children,
  onClick,
  variant = 'neutral',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'neutral' | 'primary' | 'danger';
  disabled?: boolean;
}) {
  const styles = {
    neutral:
      'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]',
    primary:
      'border-blue-600 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600',
    danger:
      'border-rose-600 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white hover:from-rose-500 hover:via-red-500 hover:to-rose-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  link = false,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
  link?: boolean;
}) {
  const href = link ? normalizeUrl(String(value || '')) : '';

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-bg-surface)] hover:shadow-lg">
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] transition duration-300 group-hover:scale-105 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
            {label}
          </p>

          {link && value ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-sm font-bold text-blue-700 hover:underline dark:text-blue-300"
            >
              <span className="truncate">{value}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <p className="mt-1 truncate text-sm font-bold text-[var(--color-text-primary)]">
              {value || '—'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition duration-300 placeholder:text-[var(--color-text-muted)] hover:border-blue-400/60 focus:border-blue-500 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </span>

      <textarea
        value={value}
        rows={5}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-text-primary)] outline-none transition duration-300 placeholder:text-[var(--color-text-muted)] hover:border-blue-400/60 focus:border-blue-500 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10"
      />
    </label>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone = 'blue',
}: {
  icon: any;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'blue' | 'indigo' | 'emerald' | 'rose' | 'slate';
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    indigo: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    rose: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
    slate:
      'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] ring-[var(--color-border)]',
  }[tone];

  return (
    <div className="mb-5 flex items-start gap-3">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClass}`}>
        <Icon className="h-6 w-6" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-display font-black tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: any;
  label: string;
  value: string | number;
  tone?: 'blue' | 'emerald' | 'indigo';
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    indigo: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300',
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-bg-surface)] hover:shadow-lg">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />

      <div className="relative flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105 ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {label}
          </p>

          <p className="mt-1 text-lg font-black text-[var(--color-text-primary)]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ oferta }: { oferta: any }) {
  const activa = oferta.estado === 'ACTIVA';

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-bg-surface)] hover:shadow-xl">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-rose-500/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />
      <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-blue-500/10 opacity-0 blur-3xl transition duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300">
            <Briefcase className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-[var(--color-text-primary)]">
              {oferta.titulo || 'Oferta sin título'}
            </h3>

            <p className="mt-1 text-sm font-semibold text-[var(--color-text-secondary)]">
              {oferta.modalidad || 'Sin modalidad'} ·{' '}
              {oferta.tipoContrato?.replace('_', ' ') || 'Sin contrato'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
                <Activity className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                {oferta._count?.postulaciones || 0} postulantes
              </span>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ring-1 ${
                  activa
                    ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                    : 'bg-slate-500/10 text-[var(--color-text-secondary)] ring-[var(--color-border)]'
                }`}
              >
                {oferta.estado || 'SIN ESTADO'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] transition group-hover:text-blue-700 dark:group-hover:text-blue-300">
          <BadgeCheck className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmpresaDetailPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [empresa, setEmpresa] = useState<any>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadEmpresa = useCallback(
    async (showLoader = true) => {
      if (!id) return;

      try {
        if (showLoader) setLoading(true);

        const data = await empresasApi.get(id as string);

        setEmpresa(data);
        setForm(buildForm(data));

        if (searchParams.get('edit') === '1') {
          setEditing(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [id, searchParams],
  );

  useEffect(() => {
    loadEmpresa();
  }, [loadEmpresa]);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const cancelEdit = () => {
    if (!empresa) return;

    setForm(buildForm(empresa));
    setEditing(false);
  };

  const saveChanges = async () => {
    if (!id) return;

    setSaving(true);

    try {
      await empresasApi.update(id as string, {
        email: form.email,
        nombreComercial: form.nombreComercial,
        razonSocial: form.razonSocial,
        ruc: form.ruc,
        sector: form.sector,
        ubicacion: form.ubicacion,
        sitioWeb: form.sitioWeb,
        descripcion: form.descripcion,
        logoUrl: form.logoUrl,
      });

      setEditing(false);
      setSuccessMessage('Datos guardados correctamente.');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      await loadEmpresa(false);
    } catch (error: any) {
      console.error(error);

      const mensaje =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'No se pudo guardar la empresa. Revisa los datos o los logs del backend.';

      alert(Array.isArray(mensaje) ? mensaje.join('\n') : mensaje);
    } finally {
      setSaving(false);
    }
  };

  const deleteEmpresa = async () => {
    if (!id) return;

    const ok = confirm(
      '¿Seguro que deseas eliminar esta empresa? Esta acción no se puede deshacer.',
    );

    if (!ok) return;

    setDeleting(true);

    try {
      await empresasApi.delete(id as string);
      router.push('/dashboard/empresas');
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar la empresa. Revisa los logs del backend.');
    } finally {
      setDeleting(false);
    }
  };

  const totalOfertas = useMemo(() => {
    return empresa?._count?.ofertas || empresa?.ofertas?.length || 0;
  }, [empresa]);

  const ofertasActivas = useMemo(() => {
    return empresa?.ofertas?.filter((oferta: any) => oferta.estado === 'ACTIVA')?.length || 0;
  }, [empresa]);

  if (loading) {
    return (
      <main className="relative space-y-6 overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="h-11 w-36 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
          <div className="h-11 w-48 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
        </div>

        <div className="relative h-[420px] animate-pulse rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)]" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
          <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
          <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
        </div>
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="space-y-6 animate-fadeIn">
        <TopButton onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </TopButton>

        <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-16 text-center shadow-sm">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <AlertTriangle className="relative mx-auto h-16 w-16 text-[var(--color-text-muted)]" />

          <h2 className="relative mt-5 text-xl font-display font-black text-[var(--color-text-primary)]">
            Empresa no encontrada
          </h2>

          <p className="relative mt-2 text-sm text-[var(--color-text-secondary)]">
            La empresa que buscas no existe o no tienes permisos para verla.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative space-y-7 pb-10 animate-fadeIn">
      <div className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 top-96 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      {successMessage && (
        <div className="fixed right-6 top-24 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-black text-emerald-700 shadow-2xl backdrop-blur-xl dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TopButton onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </TopButton>

        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <TopButton onClick={cancelEdit} disabled={saving}>
                <X className="h-4 w-4" />
                Cancelar
              </TopButton>

              <TopButton onClick={saveChanges} disabled={saving} variant="primary">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </TopButton>
            </>
          ) : (
            <>
              <TopButton onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4" />
                Editar
              </TopButton>

              <TopButton onClick={deleteEmpresa} disabled={deleting} variant="danger">
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </TopButton>
            </>
          )}
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative h-48 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_34%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]" />
          <div className="absolute -bottom-24 right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute left-6 top-6 flex flex-wrap gap-2 sm:left-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/90 backdrop-blur">
              <Building2 className="h-4 w-4" />
              Perfil empresarial
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Sincronizado
            </span>
          </div>
        </div>

        <div className="relative px-6 pb-8 sm:px-8">
          <div className="-mt-20 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)]/95 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent text-4xl font-black text-blue-700 shadow-sm ring-1 ring-blue-500/10 dark:text-blue-300">
                    {empresa.logoUrl ? (
                      <img
                        src={empresa.logoUrl}
                        alt={empresa.nombreComercial || 'Logo empresa'}
                        className="h-full w-full rounded-[2rem] object-cover"
                      />
                    ) : (
                      getInitial(empresa.nombreComercial)
                    )}
                  </div>

                  <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white ring-4 ring-[var(--color-bg-surface)]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Empresa registrada
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-500/20 dark:text-indigo-300">
                      <Landmark className="h-3.5 w-3.5" />
                      RUC {empresa.ruc || '—'}
                    </span>
                  </div>

                  <h1 className="text-3xl font-display font-black tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                    {empresa.nombreComercial || 'Empresa sin nombre'}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                    {empresa.razonSocial || 'Sin razón social registrada'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] shadow-sm">
                      <Briefcase className="h-4 w-4 text-[var(--color-text-muted)]" />
                      {empresa.sector || 'Sin sector'}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] shadow-sm">
                      <MapPin className="h-4 w-4 text-[var(--color-text-muted)]" />
                      {empresa.ubicacion || 'Sin ubicación'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[560px]">
                <StatCard icon={Briefcase} label="Ofertas" value={totalOfertas} tone="blue" />
                <StatCard icon={Activity} label="Activas" value={ofertasActivas} tone="emerald" />
                <StatCard icon={Database} label="Estado" value="Activo" tone="indigo" />
              </div>
            </div>
          </div>

          {editing ? (
            <div className="mt-8 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
              <SectionHeader
                icon={Edit}
                eyebrow="Modo edición"
                title="Editar empresa"
                description="Actualiza la información principal de la empresa. Al guardar, se aplicarán los cambios en el backend."
                tone="blue"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Correo"
                  type="email"
                  value={form.email}
                  placeholder="empresa@correo.com"
                  onChange={(value) => updateForm('email', value)}
                />

                <Field
                  label="RUC"
                  value={form.ruc}
                  placeholder="Ingrese RUC"
                  onChange={(value) => updateForm('ruc', value)}
                />

                <Field
                  label="Nombre comercial"
                  value={form.nombreComercial}
                  placeholder="Nombre comercial"
                  onChange={(value) => updateForm('nombreComercial', value)}
                />

                <Field
                  label="Razón social"
                  value={form.razonSocial}
                  placeholder="Razón social"
                  onChange={(value) => updateForm('razonSocial', value)}
                />

                <Field
                  label="Sector"
                  value={form.sector}
                  placeholder="Sector empresarial"
                  onChange={(value) => updateForm('sector', value)}
                />

                <Field
                  label="Ubicación"
                  value={form.ubicacion}
                  placeholder="Ubicación"
                  onChange={(value) => updateForm('ubicacion', value)}
                />

                <Field
                  label="Sitio web"
                  value={form.sitioWeb}
                  placeholder="https://..."
                  onChange={(value) => updateForm('sitioWeb', value)}
                />

                <Field
                  label="Logo URL"
                  value={form.logoUrl}
                  placeholder="https://..."
                  onChange={(value) => updateForm('logoUrl', value)}
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Descripción"
                    value={form.descripcion}
                    placeholder="Describe brevemente la empresa..."
                    onChange={(value) => updateForm('descripcion', value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-8">
                <SectionHeader
                  icon={FileText}
                  eyebrow="Información empresarial"
                  title="Datos de la empresa"
                  description="Información principal registrada en el sistema."
                  tone="blue"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoItem icon={Mail} label="Correo" value={empresa.user?.email} />
                  <InfoItem icon={Building2} label="RUC" value={empresa.ruc} />
                  <InfoItem icon={Briefcase} label="Sector" value={empresa.sector} />
                  <InfoItem icon={MapPin} label="Ubicación" value={empresa.ubicacion} />
                  <InfoItem icon={Globe2} label="Sitio web" value={empresa.sitioWeb} link />
                  <InfoItem icon={FileText} label="Razón social" value={empresa.razonSocial} />
                </div>
              </div>

              {empresa.descripcion && (
                <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 shadow-sm">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                  <div className="relative">
                    <p className="mb-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                      Descripción
                    </p>

                    <p className="text-sm font-medium leading-7 text-[var(--color-text-secondary)]">
                      {empresa.descripcion}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
              <Factory className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Total de ofertas
              </p>

              <p className="text-2xl font-black text-[var(--color-text-primary)]">
                {totalOfertas}
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm lg:col-span-2">
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
              <Database className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                Estado del perfil
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                Información sincronizada con PostgreSQL. Los cambios se guardan mediante PUT /api/empresas/:id.
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sincronizado
              </div>
            </div>
          </div>
        </div>
      </section>

      {empresa.ofertas?.length > 0 && (
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

          <div className="relative">
            <SectionHeader
              icon={Briefcase}
              eyebrow="Gestión laboral"
              title="Ofertas publicadas"
              description={`${empresa.ofertas.length} oferta(s) registrada(s) por esta empresa.`}
              tone="rose"
            />

            <div className="grid grid-cols-1 gap-4">
              {empresa.ofertas.map((oferta: any) => (
                <OfferCard key={oferta.id} oferta={oferta} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default function EmpresaDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="relative space-y-6 overflow-hidden">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <div className="h-11 w-36 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
            <div className="h-11 w-48 animate-pulse rounded-2xl bg-[var(--color-bg-subtle)]" />
          </div>

          <div className="relative h-[420px] animate-pulse rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)]" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
            <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
            <div className="h-28 animate-pulse rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" />
          </div>
        </main>
      }
    >
      <EmpresaDetailPageContent />
    </Suspense>
  );
}
