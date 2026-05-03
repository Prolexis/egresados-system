'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { egresadosApi, empresasApi, habilidadesApi } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Save,
  Loader2,
  GraduationCap,
  Building2,
  Briefcase,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

type FormacionItem = {
  institucion?: string;
  titulo?: string;
  fechaInicio?: string;
  fechaFin?: string;
};

type ExperienciaItem = {
  empresa?: string;
  cargo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  descripcion?: string;
};

const inputClass =
  'w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-blue-500/10';

const smallInputClass =
  'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition-all placeholder:text-[var(--color-text-muted)] focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10';

const labelClass =
  'mb-2 block text-sm font-semibold text-[var(--color-text-secondary)]';

const smallLabelClass =
  'mb-1 block text-xs font-semibold text-[var(--color-text-muted)]';

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: any;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-subtle)] shadow-sm">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="text-lg font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h3>
      </div>

      {action}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  strong,
}: {
  icon: any;
  label: string;
  value?: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
      <Icon className="mt-0.5 h-5 w-5 text-[var(--color-text-muted)]" />

      <div>
        <p className="mb-1 text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          {label}
        </p>
        <p
          className={`text-sm ${
            strong
              ? 'font-bold text-[var(--color-text-primary)]'
              : 'font-medium text-[var(--color-text-secondary)]'
          }`}
        >
          {value || '—'}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-6 py-8 text-center">
      <Icon className="mx-auto mb-2 h-8 w-8 text-[var(--color-text-muted)] opacity-60" />
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        {text}
      </p>
    </div>
  );
}

export default function MiPerfilPage() {
  const { user } = useAuthStore();
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [habilidades, setHabilidades] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let data;
        if (user?.role === 'EGRESADO') data = await egresadosApi.me();
        else if (user?.role === 'EMPRESA') data = await empresasApi.me();
        setPerfil(data);
        setFormData(data);

        if (user?.role === 'EGRESADO') {
          const habs = await habilidadesApi.list();
          setHabilidades(habs);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'EGRESADO') await egresadosApi.update(perfil.id, formData);
      else if (user?.role === 'EMPRESA') await empresasApi.update(perfil.id, formData);
      setPerfil(formData);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const agregarFormacion = () => {
    setFormData({
      ...formData,
      formacionAcademica: [...(formData.formacionAcademica || []), {}],
    });
  };

  const actualizarFormacion = (index: number, field: string, value: string) => {
    const newFormacion = [...(formData.formacionAcademica || [])];
    newFormacion[index] = { ...newFormacion[index], [field]: value };
    setFormData({ ...formData, formacionAcademica: newFormacion });
  };

  const eliminarFormacion = (index: number) => {
    const newFormacion = (formData.formacionAcademica || []).filter(
      (_: any, i: number) => i !== index,
    );
    setFormData({ ...formData, formacionAcademica: newFormacion });
  };

  const agregarExperiencia = () => {
    setFormData({
      ...formData,
      experienciaLaboral: [...(formData.experienciaLaboral || []), {}],
    });
  };

  const actualizarExperiencia = (index: number, field: string, value: string) => {
    const newExperiencia = [...(formData.experienciaLaboral || [])];
    newExperiencia[index] = { ...newExperiencia[index], [field]: value };
    setFormData({ ...formData, experienciaLaboral: newExperiencia });
  };

  const eliminarExperiencia = (index: number) => {
    const newExperiencia = (formData.experienciaLaboral || []).filter(
      (_: any, i: number) => i !== index,
    );
    setFormData({ ...formData, experienciaLaboral: newExperiencia });
  };

  const handleAgregarHabilidad = async (habilidadId: string) => {
    if (!perfil?.id) return;
    try {
      const newHab = await egresadosApi.agregarHabilidad(perfil.id, {
        habilidadId,
        nivel: 'BASICO',
      });
      setPerfil({ ...perfil, habilidades: [...(perfil.habilidades || []), newHab] });
      setFormData({
        ...formData,
        habilidades: [...(formData.habilidades || []), newHab],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleEliminarHabilidad = async (habilidadId: string) => {
    if (!perfil?.id) return;
    try {
      await egresadosApi.eliminarHabilidad(perfil.id, habilidadId);
      const newHabs = (perfil.habilidades || []).filter(
        (h: any) => h.habilidadId !== habilidadId,
      );
      setPerfil({ ...perfil, habilidades: newHabs });
      setFormData({ ...formData, habilidades: newHabs });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCambiarNivelHabilidad = async (habilidadId: string, nivel: string) => {
    if (!perfil?.id) return;
    try {
      const updated = await egresadosApi.agregarHabilidad(perfil.id, {
        habilidadId,
        nivel,
      });
      const newHabs = (perfil.habilidades || []).map((h: any) =>
        h.habilidadId === habilidadId ? updated : h,
      );
      setPerfil({ ...perfil, habilidades: newHabs });
      setFormData({ ...formData, habilidades: newHabs });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <main className="space-y-7 animate-pulse">
        <section className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
          <div className="mb-3 h-8 w-64 rounded-xl bg-[var(--color-bg-subtle)]" />
          <div className="h-4 w-48 rounded-lg bg-[var(--color-bg-subtle)]" />
        </section>

        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
          <div className="h-48 rounded-2xl bg-[var(--color-bg-subtle)]" />
        </section>
      </main>
    );

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Gestión de perfil
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Mi Perfil
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Configura tus datos personales, información profesional, CV,
              formación, experiencia y habilidades.
            </p>
          </div>

          <button
            onClick={() => setEditMode(!editMode)}
            className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-extrabold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${
              editMode
                ? 'border-[var(--color-border)] bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-950'
                : 'border-blue-400/20 bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {editMode ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 text-3xl font-display font-extrabold text-blue-700 shadow-sm dark:text-blue-300">
                {user?.role === 'EGRESADO' ? (
                  perfil?.nombre?.[0] || perfil?.apellido?.[0] ? (
                    perfil.nombre[0] + (perfil.apellido?.[0] || '')
                  ) : (
                    <GraduationCap className="h-12 w-12" />
                  )
                ) : (
                  perfil?.nombreComercial?.[0] || <Building2 className="h-12 w-12" />
                )}
              </div>

              <h3 className="text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                {user?.role === 'EGRESADO'
                  ? `${perfil?.nombre} ${perfil?.apellido}`
                  : perfil?.nombreComercial}
              </h3>

              <p className="mt-1 text-sm font-medium text-[var(--color-text-muted)]">
                {user?.email}
              </p>

              <span className="mt-3 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-300">
                {user?.role}
              </span>
            </div>
          </div>

          {user?.role === 'EGRESADO' && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-sm">
              <SectionHeader icon={FileText} title="Mi CV" />

              {perfil?.cvUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                        CV cargado
                      </p>
                    </div>

                    <a
                      href={perfil.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                    >
                      Ver <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {editMode && (
                    <div className="space-y-2">
                      <label className={smallLabelClass}>Actualizar CV</label>
                      <input
                        type="text"
                        placeholder="URL del CV en PDF"
                        value={formData.cvUrl || ''}
                        onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                        className={smallInputClass}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <EmptyState icon={FileText} text="Sin CV" />

                  {editMode && (
                    <div className="space-y-2">
                      <label className={smallLabelClass}>Agregar CV (URL PDF)</label>
                      <input
                        type="text"
                        placeholder="https://ejemplo.com/mi-cv.pdf"
                        value={formData.cvUrl || ''}
                        onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                        className={smallInputClass}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        <section className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
            <SectionHeader icon={User} title="Datos personales" />

            {editMode ? (
              <div className="space-y-4">
                {user?.role === 'EGRESADO' ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Nombre</label>
                      <input
                        value={formData?.nombre || ''}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Apellido</label>
                      <input
                        value={formData?.apellido || ''}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>DNI</label>
                      <input
                        value={formData?.dni || ''}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Fecha de nacimiento</label>
                      <input
                        type="date"
                        value={
                          formData?.fechaNacimiento
                            ? new Date(formData.fechaNacimiento).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          setFormData({ ...formData, fechaNacimiento: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Teléfono</label>
                      <input
                        value={formData?.telefono || ''}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Dirección</label>
                      <input
                        value={formData?.direccion || ''}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Carrera</label>
                      <input
                        value={formData?.carrera || ''}
                        onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Año de egreso</label>
                      <input
                        type="number"
                        value={formData?.anioEgreso || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, anioEgreso: parseInt(e.target.value) })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Nombre comercial</label>
                      <input
                        value={formData?.nombreComercial || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, nombreComercial: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Sector</label>
                      <input
                        value={formData?.sector || ''}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Ubicación</label>
                      <input
                        value={formData?.ubicacion || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, ubicacion: e.target.value })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {user?.role === 'EGRESADO' ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      icon={User}
                      label="Nombre completo"
                      value={`${perfil?.nombre} ${perfil?.apellido}`}
                      strong
                    />
                    <InfoItem icon={Mail} label="Correo" value={user?.email} />
                    <InfoItem icon={BookOpen} label="DNI" value={perfil?.dni} />
                    <InfoItem icon={GraduationCap} label="Carrera" value={perfil?.carrera} />
                    <InfoItem icon={BookOpen} label="Año de egreso" value={perfil?.anioEgreso} />

                    {perfil?.telefono && (
                      <InfoItem icon={Phone} label="Teléfono" value={perfil?.telefono} />
                    )}

                    {perfil?.direccion && (
                      <div className="md:col-span-2">
                        <InfoItem icon={MapPin} label="Dirección" value={perfil?.direccion} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoItem
                      icon={Building2}
                      label="Nombre comercial"
                      value={perfil?.nombreComercial}
                      strong
                    />
                    <InfoItem
                      icon={Building2}
                      label="Razón social"
                      value={perfil?.razonSocial}
                    />
                    <InfoItem icon={BookOpen} label="Sector" value={perfil?.sector} />

                    {perfil?.ubicacion && (
                      <InfoItem icon={MapPin} label="Ubicación" value={perfil?.ubicacion} />
                    )}
                  </div>
                )}
              </>
            )}

            {editMode && (
              <div className="mt-6 flex justify-end border-t border-[var(--color-border)] pt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            )}
          </div>

          {user?.role === 'EGRESADO' && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <SectionHeader
                icon={GraduationCap}
                title="Formación académica"
                action={
                  editMode && (
                    <button
                      onClick={agregarFormacion}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar
                    </button>
                  )
                }
              />

              <div className="space-y-4">
                {(formData.formacionAcademica || []).map(
                  (item: FormacionItem, index: number) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
                    >
                      {editMode ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className={smallLabelClass}>Institución</label>
                              <input
                                value={item.institucion || ''}
                                onChange={(e) =>
                                  actualizarFormacion(index, 'institucion', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Título</label>
                              <input
                                value={item.titulo || ''}
                                onChange={(e) =>
                                  actualizarFormacion(index, 'titulo', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Fecha inicio</label>
                              <input
                                type="date"
                                value={item.fechaInicio || ''}
                                onChange={(e) =>
                                  actualizarFormacion(index, 'fechaInicio', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Fecha fin</label>
                              <input
                                type="date"
                                value={item.fechaFin || ''}
                                onChange={(e) =>
                                  actualizarFormacion(index, 'fechaFin', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => eliminarFormacion(index)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-500/20 transition hover:bg-rose-500/15 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-bold text-[var(--color-text-primary)]">
                            {item.titulo}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {item.institucion}
                          </p>
                          {(item.fechaInicio || item.fechaFin) && (
                            <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                              {item.fechaInicio && new Date(item.fechaInicio).getFullYear()}
                              {item.fechaFin
                                ? ` - ${new Date(item.fechaFin).getFullYear()}`
                                : ' - Presente'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}

                {(!formData.formacionAcademica || formData.formacionAcademica.length === 0) &&
                  !editMode && (
                    <EmptyState
                      icon={GraduationCap}
                      text="Sin formación registrada"
                    />
                  )}
              </div>
            </div>
          )}

          {user?.role === 'EGRESADO' && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <SectionHeader
                icon={Briefcase}
                title="Experiencia laboral"
                action={
                  editMode && (
                    <button
                      onClick={agregarExperiencia}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                    >
                      <Plus className="h-3.5 w-3.5" /> Agregar
                    </button>
                  )
                }
              />

              <div className="space-y-4">
                {(formData.experienciaLaboral || []).map(
                  (item: ExperienciaItem, index: number) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-5"
                    >
                      {editMode ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className={smallLabelClass}>Empresa</label>
                              <input
                                value={item.empresa || ''}
                                onChange={(e) =>
                                  actualizarExperiencia(index, 'empresa', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Cargo</label>
                              <input
                                value={item.cargo || ''}
                                onChange={(e) =>
                                  actualizarExperiencia(index, 'cargo', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Fecha inicio</label>
                              <input
                                type="date"
                                value={item.fechaInicio || ''}
                                onChange={(e) =>
                                  actualizarExperiencia(index, 'fechaInicio', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>

                            <div>
                              <label className={smallLabelClass}>Fecha fin</label>
                              <input
                                type="date"
                                value={item.fechaFin || ''}
                                onChange={(e) =>
                                  actualizarExperiencia(index, 'fechaFin', e.target.value)
                                }
                                className={smallInputClass}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={smallLabelClass}>Descripción</label>
                            <textarea
                              value={item.descripcion || ''}
                              onChange={(e) =>
                                actualizarExperiencia(index, 'descripcion', e.target.value)
                              }
                              rows={3}
                              className={`${smallInputClass} resize-none`}
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => eliminarExperiencia(index)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-500/20 transition hover:bg-rose-500/15 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-bold text-[var(--color-text-primary)]">
                            {item.cargo}
                          </p>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {item.empresa}
                          </p>
                          {(item.fechaInicio || item.fechaFin) && (
                            <p className="text-xs font-semibold text-[var(--color-text-muted)]">
                              {item.fechaInicio && new Date(item.fechaInicio).getFullYear()}
                              {item.fechaFin
                                ? ` - ${new Date(item.fechaFin).getFullYear()}`
                                : ' - Presente'}
                            </p>
                          )}
                          {item.descripcion && (
                            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                              {item.descripcion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}

                {(!formData.experienciaLaboral ||
                  formData.experienciaLaboral.length === 0) &&
                  !editMode && (
                    <EmptyState
                      icon={Briefcase}
                      text="Sin experiencia laboral registrada"
                    />
                  )}
              </div>
            </div>
          )}

          {user?.role === 'EGRESADO' && (
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-sm">
              <SectionHeader icon={CheckCircle2} title="Habilidades" />

              <div className="mb-6">
                <h4 className="mb-3 text-sm font-bold text-[var(--color-text-secondary)]">
                  Mis habilidades
                </h4>

                <div className="flex flex-wrap gap-2">
                  {(perfil?.habilidades || []).map((hab: any) => (
                    <div
                      key={hab.habilidadId}
                      className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-4 py-2"
                    >
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {hab.habilidad?.nombre}
                      </span>

                      <select
                        value={hab.nivel || 'BASICO'}
                        onChange={(e) =>
                          handleCambiarNivelHabilidad(hab.habilidadId, e.target.value)
                        }
                        className="bg-transparent text-xs font-bold text-[var(--color-text-secondary)] outline-none"
                      >
                        <option value="BASICO">Básico</option>
                        <option value="INTERMEDIO">Intermedio</option>
                        <option value="AVANZADO">Avanzado</option>
                        <option value="EXPERTO">Experto</option>
                      </select>

                      {editMode && (
                        <button
                          onClick={() => handleEliminarHabilidad(hab.habilidadId)}
                          className="text-rose-500 transition hover:text-rose-700 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {(!perfil?.habilidades || perfil.habilidades.length === 0) && (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No hay habilidades registradas
                    </p>
                  )}
                </div>
              </div>

              {editMode && (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-[var(--color-text-secondary)]">
                    Agregar habilidad
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {habilidades
                      .filter(
                        (h) =>
                          !(perfil?.habilidades || []).some(
                            (eh: any) => eh.habilidadId === h.id,
                          ),
                      )
                      .map((hab) => (
                        <button
                          key={hab.id}
                          onClick={() => handleAgregarHabilidad(hab.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                        >
                          <Plus className="h-3 w-3" /> {hab.nombre}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}