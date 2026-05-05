'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
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
  UserRound,
  Loader2,
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
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
      <Icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value || '—'}
        </p>
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

function EgresadoDetailPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [egresado, setEgresado] = useState<any>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;

    setLoading(true);

    egresadosApi
      .get(id as string)
      .then((data: any) => {
        setEgresado(data);

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

        if (searchParams.get('edit') === '1') {
          setEditing(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const cancelEdit = () => {
    if (!egresado) return;

    setForm({
      email: egresado?.user?.email ?? '',
      nombre: egresado?.nombre ?? '',
      apellido: egresado?.apellido ?? '',
      dni: egresado?.dni ?? '',
      fechaNacimiento: toInputDate(egresado?.fechaNacimiento),
      telefono: egresado?.telefono ?? '',
      direccion: egresado?.direccion ?? '',
      carrera: egresado?.carrera ?? '',
      anioEgreso: egresado?.anioEgreso ? String(egresado.anioEgreso) : '',
    });

    setEditing(false);
  };

  const saveChanges = async () => {
    if (!id) return;

    setSaving(true);

    try {
      await egresadosApi.update(id as string, {
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
      load();
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar el egresado. Revisa los datos o los logs del backend.');
    } finally {
      setSaving(false);
    }
  };

  const deleteEgresado = async () => {
    if (!id) return;

    const ok = confirm(
      '¿Seguro que deseas eliminar este egresado? Esta acción no se puede deshacer.',
    );

    if (!ok) return;

    setDeleting(true);

    try {
      await egresadosApi.delete(id as string);
      router.push('/dashboard/egresados');
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el egresado. Revisa los logs del backend.');
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

  if (!egresado) {
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
          <GraduationCap className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600" />

          <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
            Egresado no encontrado
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            El egresado que buscas no existe o no tienes permisos para verlo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
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
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
                onClick={deleteEgresado}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-3xl font-black text-blue-700 ring-4 ring-white shadow-lg dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-900">
                {getInitials(egresado.nombre, egresado.apellido)}
              </div>

              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-950 dark:text-white">
                  {egresado.nombre} {egresado.apellido}
                </h1>

                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {egresado.carrera || 'Sin carrera'} · Cohorte {egresado.anioEgreso || '—'}
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
                    Editar información
                  </h2>

                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Actualiza los datos principales del egresado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Correo" type="email" value={form.email} onChange={(value) => updateForm('email', value)} />
                <Field label="DNI" value={form.dni} onChange={(value) => updateForm('dni', value)} />
                <Field label="Nombre" value={form.nombre} onChange={(value) => updateForm('nombre', value)} />
                <Field label="Apellido" value={form.apellido} onChange={(value) => updateForm('apellido', value)} />
                <Field label="Teléfono" value={form.telefono} onChange={(value) => updateForm('telefono', value)} />
                <Field label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={(value) => updateForm('fechaNacimiento', value)} />
                <Field label="Carrera" value={form.carrera} onChange={(value) => updateForm('carrera', value)} />
                <Field label="Año de egreso" type="number" value={form.anioEgreso} onChange={(value) => updateForm('anioEgreso', value)} />

                <div className="md:col-span-2">
                  <Field label="Dirección" value={form.direccion} onChange={(value) => updateForm('direccion', value)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          )}
        </div>
      </section>

      {egresado.habilidades?.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
              <Award className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                Habilidades
              </h2>

              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                Competencias registradas en el perfil
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {egresado.habilidades.map((h: any) => (
              <span
                key={h.habilidadId}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200"
              >
                {h.habilidad?.nombre}

                {h.nivel && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                    {h.nivel}
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-slate-400 dark:text-slate-500" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Postulaciones
              </p>

              <p className="text-2xl font-black text-slate-950 dark:text-white">
                {egresado._count?.postulaciones || egresado.postulaciones?.length || 0}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Empresas postuladas
            </p>

            {egresado.postulaciones?.length > 0 ? (
              egresado.postulaciones.map((postulacion: any, index: number) => (
                <div
                  key={postulacion.id || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {postulacion.oferta?.empresa?.nombre ||
                      postulacion.ofertaLaboral?.empresa?.nombre ||
                      postulacion.empresa?.nombre ||
                      'Empresa no registrada'}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {postulacion.oferta?.titulo ||
                      postulacion.ofertaLaboral?.titulo ||
                      postulacion.titulo ||
                      'Oferta laboral no registrada'}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                    {postulacion.estado || 'Postulado'}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
                Solo se está mostrando el conteo. Falta que el backend envíe el detalle de empresas postuladas.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center gap-3">
            <UserRound className="h-6 w-6 text-slate-400 dark:text-slate-500" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Estado del perfil
              </p>

              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Información sincronizada con PostgreSQL. Los cambios se guardan
                mediante PUT /api/egresados/:id.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function EgresadoDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-6">
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </main>
      }
    >
      <EgresadoDetailPageContent />
    </Suspense>
  );
}
