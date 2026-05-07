'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { egresadosApi } from '@/lib/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Award,
  Briefcase,
  GraduationCap,
  CalendarDays,
  Edit,
  Save,
  X,
  Trash2,
  MapPin,
  Loader2,
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  Database,
  Activity,
  FileText,
  Clock,
  UserRound,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type FormState = {
  email: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  carrera: string;
  anioEgreso: string;
};

type PageMode = 'view' | 'edit' | 'delete';

const emptyForm: FormState = {
  email: '',
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  carrera: '',
  anioEgreso: '',
};

function toInputDate(value?: string | Date | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function getInitials(nombre?: string, apellido?: string) {
  const first = nombre?.trim()?.charAt(0) ?? '';
  const second = apellido?.trim()?.charAt(0) ?? '';
  return `${first}${second}`.toUpperCase() || 'EG';
}

function normalizeParamId(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0];
  return id;
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-bg-surface)] hover:shadow-lg">
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] transition duration-300 group-hover:scale-105 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-[var(--color-text-primary)]">
            {value || '—'}
          </p>
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
    <label className="group block">
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
      'border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500',
    danger:
      'border-rose-600 bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500',
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

function ModePill({
  mode,
  deleting,
}: {
  mode: PageMode;
  deleting?: boolean;
}) {
  if (mode === 'edit') {
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700 shadow-sm dark:text-blue-300">
        <Edit className="h-4 w-4" />
        Modo edición
      </span>
    );
  }

  if (mode === 'delete' || deleting) {
    return (
      <span className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-rose-700 shadow-sm dark:text-rose-300">
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {deleting ? 'Eliminando' : 'Modo eliminar'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-sm dark:text-emerald-300">
      <CheckCircle2 className="h-4 w-4" />
      Vista detalle
    </span>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: any;
  label: string;
  value: string | number;
  tone?: 'blue' | 'emerald' | 'indigo' | 'slate';
}) {
  const toneClass = {
    blue: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    indigo: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300',
    slate:
      'bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] ring-[var(--color-border)]',
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-bg-surface)] hover:shadow-lg">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 transition group-hover:scale-105 ${toneClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
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

function SkillBadge({ habilidad }: { habilidad: any }) {
  return (
    <span className="group inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md dark:text-blue-200">
      <BadgeCheck className="h-4 w-4" />
      {habilidad.habilidad?.nombre || 'Habilidad'}

      {habilidad.nivel && (
        <span className="rounded-full bg-[var(--color-bg-surface)] px-2 py-0.5 text-xs font-black uppercase tracking-wider text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
          {habilidad.nivel}
        </span>
      )}
    </span>
  );
}

function ApplicationCard({
  postulacion,
  index,
}: {
  postulacion: any;
  index: number;
}) {
  const oferta = postulacion.oferta || postulacion.ofertaLaboral || {};
  const empresa = oferta.empresa || postulacion.empresa || {};

  const nombreEmpresa =
    empresa.nombre ||
    empresa.razonSocial ||
    empresa.nombreComercial ||
    empresa.user?.email ||
    oferta.empresaNombre ||
    oferta.nombreEmpresa ||
    'Empresa no registrada';

  const tituloOferta =
    oferta.titulo ||
    oferta.nombre ||
    oferta.cargo ||
    postulacion.titulo ||
    'Oferta laboral no registrada';

  return (
    <div
      key={postulacion.id || index}
      className="group relative min-w-[280px] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-[var(--color-bg-surface)] hover:shadow-xl sm:min-w-[340px]"
    >
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />
      <div className="absolute -bottom-16 -left-16 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 transition group-hover:scale-105 dark:text-blue-300">
            <Briefcase className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[var(--color-text-primary)]">
              {nombreEmpresa}
            </p>

            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text-secondary)]">
              {tituloOferta}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {oferta.ubicacion && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1 text-xs font-bold text-[var(--color-text-secondary)]">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              {oferta.ubicacion}
            </span>
          )}

          <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
            {postulacion.estado || 'POSTULADO'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileStatusCard() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
          <Database className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
            Estado del perfil
          </p>

          <h2 className="mt-1 text-lg font-display font-black text-[var(--color-text-primary)]">
            Información sincronizada
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
            Los datos del egresado se encuentran conectados con PostgreSQL. Los cambios se guardan mediante PUT /api/egresados/:id.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sincronizado
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
              <Clock className="h-3.5 w-3.5" />
              Actualización segura
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteModeCard({ deleting }: { deleting: boolean }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-6 shadow-sm">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300">
          {deleting ? <Loader2 className="h-6 w-6 animate-spin" /> : <AlertTriangle className="h-6 w-6" />}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">
            Modo eliminar
          </p>

          <h2 className="mt-1 text-xl font-display font-black text-[var(--color-text-primary)]">
            {deleting ? 'Eliminando egresado...' : 'Confirmación requerida'}
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
            El sistema solicitará confirmación antes de eliminar el registro. Si confirmas, se eliminará al egresado y volverás al listado principal.
          </p>
        </div>
      </div>
    </section>
  );
}

function EgresadoDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteRequestedRef = useRef(false);

  const id = normalizeParamId(params?.id);

  const pageMode: PageMode = useMemo(() => {
    const mode = searchParams.get('mode') || searchParams.get('modo');

    if (searchParams.get('edit') === '1' || mode === 'edit' || mode === 'editar') {
      return 'edit';
    }

    if (searchParams.get('delete') === '1' || mode === 'delete' || mode === 'eliminar') {
      return 'delete';
    }

    return 'view';
  }, [searchParams]);

  const detailHref = useMemo(() => {
    return id ? `/dashboard/egresados/${id}` : '/dashboard/egresados';
  }, [id]);

  const [egresado, setEgresado] = useState<any>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fillForm = useCallback((data: any) => {
    setForm({
      email: data?.user?.email ?? '',
      nombre: data?.nombre ?? '',
      apellido: data?.apellido ?? '',
      dni: data?.dni ?? '',
      fechaNacimiento: toInputDate(data?.fechaNacimiento),
      telefono: data?.telefono ?? '',
      direccion: data?.direccion ?? '',
      carrera: data?.carrera ?? '',
      anioEgreso: data?.anioEgreso ? String(data.anioEgreso) : '',
    });
  }, []);

  const load = useCallback(() => {
    if (!id) return;

    setLoading(true);

    egresadosApi
      .get(id)
      .then((data: any) => {
        setEgresado(data);
        fillForm(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, fillForm]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setEditing(pageMode === 'edit');
  }, [pageMode]);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const cancelEdit = () => {
    if (egresado) {
      fillForm(egresado);
    }

    setEditing(false);
    router.replace(detailHref);
  };

  const saveChanges = async () => {
    if (!id) return;

    setSaving(true);

    try {
      await egresadosApi.update(id, {
        email: form.email,
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        fechaNacimiento: form.fechaNacimiento || null,
        telefono: form.telefono,
        direccion: form.direccion,
        carrera: form.carrera,
        anioEgreso: form.anioEgreso ? Number(form.anioEgreso) : null,
      });

      setEditing(false);
      router.replace(detailHref);
      load();
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar el egresado. Revisa los datos o los logs del backend.');
    } finally {
      setSaving(false);
    }
  };

  const deleteEgresado = useCallback(
    async (withConfirm = true) => {
      if (!id) return;

      if (withConfirm) {
        const ok = confirm(
          '¿Seguro que deseas eliminar este egresado? Esta acción no se puede deshacer.',
        );

        if (!ok) return;
      }

      setDeleting(true);

      try {
        await egresadosApi.delete(id);
        router.push('/dashboard/egresados');
      } catch (error) {
        console.error(error);
        alert('No se pudo eliminar el egresado. Revisa los logs del backend.');
        router.replace(detailHref);
      } finally {
        setDeleting(false);
      }
    },
    [id, router, detailHref],
  );

  useEffect(() => {
    if (pageMode !== 'delete') return;
    if (!egresado) return;
    if (deleteRequestedRef.current) return;

    deleteRequestedRef.current = true;

    const ok = confirm(
      '¿Seguro que deseas eliminar este egresado? Esta acción no se puede deshacer.',
    );

    if (!ok) {
      router.replace(detailHref);
      return;
    }

    deleteEgresado(false);
  }, [pageMode, egresado, deleteEgresado, router, detailHref]);

  const totalPostulaciones = useMemo(() => {
    return egresado?._count?.postulaciones || egresado?.postulaciones?.length || 0;
  }, [egresado]);

  const totalHabilidades = useMemo(() => {
    return egresado?.habilidades?.length || 0;
  }, [egresado]);

  if (loading) {
    return (
      <main className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-12 w-40 rounded-2xl bg-[var(--color-bg-subtle)]" />
          <div className="h-10 w-36 rounded-2xl bg-[var(--color-bg-subtle)]" />
        </div>

        <div className="h-96 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-32 rounded-[2rem] bg-[var(--color-bg-subtle)]" />
          <div className="h-32 rounded-[2rem] bg-[var(--color-bg-subtle)]" />
          <div className="h-32 rounded-[2rem] bg-[var(--color-bg-subtle)]" />
        </div>
      </main>
    );
  }

  if (!egresado) {
    return (
      <main className="space-y-6 animate-fadeIn">
        <TopButton onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </TopButton>

        <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-16 text-center shadow-sm">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <GraduationCap className="relative mx-auto h-16 w-16 text-[var(--color-text-muted)]" />

          <h2 className="relative mt-5 text-xl font-display font-black text-[var(--color-text-primary)]">
            Egresado no encontrado
          </h2>

          <p className="relative mt-2 text-sm text-[var(--color-text-secondary)]">
            El egresado que buscas no existe o no tienes permisos para verlo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative space-y-7 pb-10 animate-fadeIn">
      <div className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 top-96 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TopButton onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </TopButton>

        <div className="flex flex-wrap items-center gap-2">
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
            <ModePill mode={pageMode} deleting={deleting} />
          )}
        </div>
      </div>

      {pageMode === 'delete' && <DeleteModeCard deleting={deleting} />}

      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/10" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:22px_22px]" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="relative">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent text-3xl font-black text-blue-700 shadow-sm ring-1 ring-blue-500/10 dark:text-blue-300">
                  {getInitials(egresado.nombre, egresado.apellido)}
                </div>

                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-white ring-4 ring-[var(--color-bg-surface)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] shadow-sm">
                    <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    Perfil de egresado
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sincronizado
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-700 ring-1 ring-indigo-500/20 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Perfil activo
                  </span>
                </div>

                <h1 className="text-3xl font-display font-black tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                  {egresado.nombre} {egresado.apellido}
                </h1>

                <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--color-text-secondary)]">
                  Perfil académico y laboral del egresado. Desde esta vista puedes revisar sus datos personales, habilidades, postulaciones y estado general del registro.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] shadow-sm">
                    <BookOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
                    {egresado.carrera || 'Sin carrera'}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] shadow-sm">
                    <CalendarDays className="h-4 w-4 text-[var(--color-text-muted)]" />
                    Cohorte {egresado.anioEgreso || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[560px]">
              <HeroStat
                icon={Briefcase}
                label="Postulaciones"
                value={totalPostulaciones}
                tone="blue"
              />

              <HeroStat
                icon={Award}
                label="Habilidades"
                value={totalHabilidades}
                tone="indigo"
              />

              <HeroStat
                icon={Activity}
                label="Estado"
                value="Activo"
                tone="emerald"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative px-6 py-7 sm:px-8">
          {editing ? (
            <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
              <SectionHeader
                icon={Edit}
                eyebrow="Modo edición"
                title="Editar información"
                description="Actualiza los datos principales del egresado. Al guardar, se aplicarán los cambios en el backend."
                tone="blue"
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Correo"
                  type="email"
                  value={form.email}
                  placeholder="correo@ejemplo.com"
                  onChange={(value) => updateForm('email', value)}
                />

                <Field
                  label="DNI"
                  value={form.dni}
                  placeholder="Ingrese DNI"
                  onChange={(value) => updateForm('dni', value)}
                />

                <Field
                  label="Nombre"
                  value={form.nombre}
                  placeholder="Ingrese nombre"
                  onChange={(value) => updateForm('nombre', value)}
                />

                <Field
                  label="Apellido"
                  value={form.apellido}
                  placeholder="Ingrese apellido"
                  onChange={(value) => updateForm('apellido', value)}
                />

                <Field
                  label="Teléfono"
                  value={form.telefono}
                  placeholder="Ingrese teléfono"
                  onChange={(value) => updateForm('telefono', value)}
                />

                <Field
                  label="Fecha de nacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(value) => updateForm('fechaNacimiento', value)}
                />

                <Field
                  label="Carrera"
                  value={form.carrera}
                  placeholder="Ingrese carrera"
                  onChange={(value) => updateForm('carrera', value)}
                />

                <Field
                  label="Año de egreso"
                  type="number"
                  value={form.anioEgreso}
                  placeholder="Ej. 2025"
                  onChange={(value) => updateForm('anioEgreso', value)}
                />

                <div className="md:col-span-2">
                  <Field
                    label="Dirección"
                    value={form.direccion}
                    placeholder="Ingrese dirección"
                    onChange={(value) => updateForm('direccion', value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <SectionHeader
                icon={FileText}
                eyebrow="Información personal"
                title="Datos del egresado"
                description="Información principal registrada en el sistema."
                tone="blue"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem icon={Mail} label="Correo" value={egresado.user?.email} />
                <InfoItem icon={Phone} label="Teléfono" value={egresado.telefono} />
                <InfoItem icon={BookOpen} label="DNI" value={egresado.dni} />
                <InfoItem
                  icon={CalendarDays}
                  label="Nacimiento"
                  value={
                    egresado.fechaNacimiento
                      ? new Date(egresado.fechaNacimiento).toLocaleDateString('es-PE')
                      : '—'
                  }
                />
                <InfoItem icon={GraduationCap} label="Carrera" value={egresado.carrera} />
                <InfoItem icon={MapPin} label="Dirección" value={egresado.direccion} />
              </div>
            </>
          )}
        </div>
      </section>

      {egresado.habilidades?.length > 0 && (
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <SectionHeader
              icon={Award}
              eyebrow="Perfil técnico"
              title="Habilidades"
              description="Competencias registradas en el perfil del egresado."
              tone="indigo"
            />

            <div className="flex flex-wrap gap-3">
              {egresado.habilidades.map((h: any) => (
                <SkillBadge key={h.habilidadId} habilidad={h} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm lg:col-span-2">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative">
            <SectionHeader
              icon={Briefcase}
              eyebrow="Seguimiento"
              title="Postulaciones"
              description="Empresas y ofertas donde el egresado ha participado."
              tone="blue"
            />

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Total
                </p>

                <p className="mt-1 text-3xl font-black text-[var(--color-text-primary)]">
                  {totalPostulaciones}
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 shadow-sm sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                  Empresas postuladas
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                  Visualización horizontal para revisar más postulaciones sin saturar la pantalla.
                </p>
              </div>
            </div>

            {egresado.postulaciones?.length > 0 ? (
              <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
                {egresado.postulaciones.map((postulacion: any, index: number) => (
                  <ApplicationCard
                    key={postulacion.id || index}
                    postulacion={postulacion}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-6 text-center">
                <UserRound className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />

                <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  Este egresado aún no registra postulaciones.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <ProfileStatusCard />
        </div>
      </section>
    </main>
  );
}

export default function EgresadoDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-6 animate-pulse">
          <div className="h-12 w-64 rounded-2xl bg-[var(--color-bg-subtle)]" />
          <div className="h-96 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)]" />
        </main>
      }
    >
      <EgresadoDetailPageContent />
    </Suspense>
  );
}
