'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
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

function InfoItem({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: any;
  label: string;
  value?: string | number | null;
  link?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
      <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </p>

        {link && value ? (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {value || '—'}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
      />
    </label>
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

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </main>
    );
  }

  if (!empresa) {
    return (
      <main className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <Building2 className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600" />

          <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
            Empresa no encontrada
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            La empresa que buscas no existe o no tienes permisos para verla.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {successMessage && (
        <div className="fixed right-6 top-24 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700 shadow-xl dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Edit className="h-4 w-4" />
                Editar
              </button>

              <button
                type="button"
                onClick={deleteEmpresa}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-44 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_35%)]" />
          <div className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-16 rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white text-3xl font-black text-blue-700 ring-4 ring-white shadow-lg dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-900">
                  {getInitial(empresa.nombreComercial)}
                </div>

                <div>
                  <h1 className="text-2xl font-black text-slate-950 dark:text-white md:text-3xl">
                    {empresa.nombreComercial || 'Empresa sin nombre'}
                  </h1>

                  <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {empresa.razonSocial || 'Sin razón social registrada'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                      RUC: {empresa.ruc || '—'}
                    </span>

                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                      {empresa.user?.email || 'Sin correo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Ofertas
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {empresa._count?.ofertas || empresa.ofertas?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/60">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/10">
                  <Edit className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">
                    Editar empresa
                  </h2>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Actualiza la información principal de la empresa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Correo"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateForm('email', value)}
                />

                <Field
                  label="RUC"
                  value={form.ruc}
                  onChange={(value) => updateForm('ruc', value)}
                />

                <Field
                  label="Nombre comercial"
                  value={form.nombreComercial}
                  onChange={(value) => updateForm('nombreComercial', value)}
                />

                <Field
                  label="Razón social"
                  value={form.razonSocial}
                  onChange={(value) => updateForm('razonSocial', value)}
                />

                <Field
                  label="Sector"
                  value={form.sector}
                  onChange={(value) => updateForm('sector', value)}
                />

                <Field
                  label="Ubicación"
                  value={form.ubicacion}
                  onChange={(value) => updateForm('ubicacion', value)}
                />

                <Field
                  label="Sitio web"
                  value={form.sitioWeb}
                  onChange={(value) => updateForm('sitioWeb', value)}
                />

                <Field
                  label="Logo URL"
                  value={form.logoUrl}
                  onChange={(value) => updateForm('logoUrl', value)}
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Descripción"
                    value={form.descripcion}
                    onChange={(value) => updateForm('descripcion', value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem icon={Mail} label="Correo" value={empresa.user?.email} />
              <InfoItem icon={Building2} label="RUC" value={empresa.ruc} />
              <InfoItem icon={Briefcase} label="Sector" value={empresa.sector} />
              <InfoItem icon={MapPin} label="Ubicación" value={empresa.ubicacion} />
              <InfoItem icon={Globe2} label="Sitio web" value={empresa.sitioWeb} link />
              <InfoItem icon={FileText} label="Razón social" value={empresa.razonSocial} />
            </div>
          )}

          {!editing && empresa.descripcion && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Descripción
              </p>

              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {empresa.descripcion}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-slate-400 dark:text-slate-500" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Total de ofertas
              </p>

              <p className="text-2xl font-black text-slate-950 dark:text-white">
                {empresa._count?.ofertas || empresa.ofertas?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Estado del perfil
              </p>

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Información sincronizada con PostgreSQL. Los cambios se guardan
                mediante PUT /api/empresas/:id.
              </p>
            </div>
          </div>
        </div>
      </section>

      {empresa.ofertas?.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10">
              <Briefcase className="h-6 w-6 text-rose-700 dark:text-rose-300" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Ofertas publicadas
              </h2>

              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                {empresa.ofertas.length} oferta(s) registrada(s)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {empresa.ofertas.map((oferta: any) => (
              <div
                key={oferta.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">
                    {oferta.titulo}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {oferta.modalidad} · {oferta.tipoContrato?.replace('_', ' ')}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {oferta._count?.postulaciones || 0} postulantes
                  </p>

                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-black ${
                      oferta.estado === 'ACTIVA'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {oferta.estado}
                  </span>
                </div>
              </div>
            ))}
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
        <main className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </main>
      }
    >
      <EmpresaDetailPageContent />
    </Suspense>
  );
}