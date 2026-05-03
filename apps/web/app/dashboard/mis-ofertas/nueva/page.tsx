'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ofertasApi, habilidadesApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  DollarSign,
  FileText,
  Laptop,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Tags,
} from 'lucide-react';

const ofertaSchema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres'),
  descripcion: z.string().min(20, 'Mínimo 20 caracteres'),
  modalidad: z.enum(['PRESENCIAL', 'REMOTO', 'HIBRIDO']),
  tipoContrato: z.enum(['TIEMPO_COMPLETO', 'TIEMPO_PARCIAL', 'PRACTICAS', 'FREELANCE']),
  ubicacion: z.string().optional(),
  salarioMin: z.number().min(0).optional(),
  salarioMax: z.number().min(0).optional(),
  requisitos: z.string().optional(),
});

type OfertaForm = z.infer<typeof ofertaSchema>;

const fieldClass =
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3.5 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10';

const fieldWithIconClass =
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-3.5 pl-11 pr-4 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10';

const labelClass =
  'mb-2 block text-sm font-black text-[var(--color-text-primary)]';

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-2 text-xs font-bold text-rose-500 dark:text-rose-400">{message}</p>;
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] shadow-sm">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>

      <div>
        <h2 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function NuevaOfertaPage() {
  const router = useRouter();
  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [habilidadesSeleccionadas, setHabilidadesSeleccionadas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfertaForm>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      modalidad: 'PRESENCIAL',
      tipoContrato: 'TIEMPO_COMPLETO',
    },
  });

  useEffect(() => {
    habilidadesApi.list().then(setHabilidades).catch(() => {});
  }, []);

  const onSubmit = async (data: OfertaForm) => {
    setLoading(true);
    try {
      const finalData = {
        ...data,
        habilidades: habilidadesSeleccionadas.map((id) => ({ habilidadId: id })),
      };
      await ofertasApi.create(finalData);
      router.push('/dashboard/mis-ofertas');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al crear oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Publicación de empleo
              </div>

              <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
                Nueva Oferta Laboral
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
                Crea una oportunidad laboral clara, atractiva y profesional para conectar con el mejor talento egresado.
              </p>
            </div>
          </div>

          <div className="hidden rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/10 lg:block">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white/45">
              Estado
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
              Formulario listo
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm lg:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <SectionTitle
              icon={Briefcase}
              title="Información principal"
              description="Datos generales que verán los egresados al revisar la oferta."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Título del puesto</label>
                <input
                  {...register('titulo')}
                  placeholder="Ej: Desarrollador Web Full Stack"
                  className={fieldClass}
                />
                <ErrorText message={errors.titulo?.message} />
              </div>

              <div>
                <label className={labelClass}>Modalidad</label>
                <div className="relative">
                  <Laptop className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <select
                    {...register('modalidad')}
                    className={fieldWithIconClass}
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="REMOTO">Remoto</option>
                    <option value="HIBRIDO">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tipo de contrato</label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <select
                    {...register('tipoContrato')}
                    className={fieldWithIconClass}
                  >
                    <option value="TIEMPO_COMPLETO">Tiempo Completo</option>
                    <option value="TIEMPO_PARCIAL">Tiempo Parcial</option>
                    <option value="PRACTICAS">Prácticas</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Ubicación</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    {...register('ubicacion')}
                    placeholder="Ej: Lima, Perú"
                    className={fieldWithIconClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Salario mínimo</label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      {...register('salarioMin', { valueAsNumber: true })}
                      placeholder="S/"
                      className={fieldWithIconClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Salario máximo</label>
                  <div className="relative">
                    <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      {...register('salarioMax', { valueAsNumber: true })}
                      placeholder="S/"
                      className={fieldWithIconClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-8">
            <SectionTitle
              icon={FileText}
              title="Detalle de la oferta"
              description="Describe responsabilidades, beneficios y requisitos esperados."
            />

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  {...register('descripcion')}
                  rows={6}
                  placeholder="Describe el puesto, responsabilidades, beneficios, horario, equipo de trabajo, etc."
                  className={`${fieldClass} resize-none`}
                />
                <ErrorText message={errors.descripcion?.message} />
              </div>

              <div>
                <label className={labelClass}>Requisitos</label>
                <textarea
                  {...register('requisitos')}
                  rows={4}
                  placeholder="Requisitos, experiencia necesaria, conocimientos técnicos, disponibilidad, etc."
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-8">
            <SectionTitle
              icon={Tags}
              title="Habilidades requeridas"
              description="Selecciona las habilidades clave para mejorar la coincidencia con egresados."
            />

            <div className="flex flex-wrap gap-2">
              {habilidades.map((h) => {
                const active = habilidadesSeleccionadas.includes(h.id);

                return (
                  <label
                    key={h.id}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm font-bold transition-all ${
                      active
                        ? 'border-blue-400/30 bg-blue-500/10 text-blue-700 shadow-sm ring-1 ring-blue-500/10 dark:text-blue-300'
                        : 'border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => {
                        setHabilidadesSeleccionadas((prev) =>
                          e.target.checked
                            ? [...prev, h.id]
                            : prev.filter((id) => id !== h.id),
                        );
                      }}
                      className="accent-blue-600"
                    />
                    {h.nombre}
                  </label>
                );
              })}

              {habilidades.length === 0 && (
                <div className="w-full rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-8 text-center">
                  <Tags className="mx-auto mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
                  <p className="text-sm font-bold text-[var(--color-text-muted)]">
                    No hay habilidades cargadas todavía.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-5 py-3 text-sm font-black text-[var(--color-text-secondary)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Guardando...' : 'Guardar Oferta'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}