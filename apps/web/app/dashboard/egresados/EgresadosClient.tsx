'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { egresadosApi } from '@/lib/api';
import {
  Award,
  BookOpen,
  Briefcase,
  ChevronDown,
  Eye,
  Filter,
  GraduationCap,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

type HabilidadRelacion = {
  habilidadId?: string | number;
  habilidad?: {
    nombre?: string;
  };
};

type Egresado = {
  id: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  carrera?: string;
  anioEgreso?: string | number;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  habilidades?: HabilidadRelacion[];
  user?: {
    email?: string;
  };
  _count?: {
    postulaciones?: number;
  };
};

type CarreraItem = {
  carrera: string;
  total: number;
};

type EgresadosData = {
  egresados: Egresado[];
  total: number;
};

type CreateForm = {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  carrera: string;
  anioEgreso: string;
  habilidades: string;
};

const emptyCreateForm: CreateForm = {
  email: '',
  password: '',
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  direccion: '',
  carrera: '',
  anioEgreso: '',
  habilidades: '',
};

function normalizeEgresadosData(response: unknown): EgresadosData {
  if (
    response &&
    typeof response === 'object' &&
    'egresados' in response &&
    Array.isArray((response as { egresados?: unknown }).egresados)
  ) {
    const data = response as EgresadosData;

    return {
      egresados: data.egresados ?? [],
      total: data.total ?? data.egresados?.length ?? 0,
    };
  }

  if (Array.isArray(response)) {
    return {
      egresados: response as Egresado[],
      total: response.length,
    };
  }

  return {
    egresados: [],
    total: 0,
  };
}

function getInitials(nombre?: string, apellido?: string) {
  const first = nombre?.trim()?.charAt(0) ?? '';
  const second = apellido?.trim()?.charAt(0) ?? '';

  return `${first}${second}`.toUpperCase() || 'EG';
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl transition group-hover:scale-110"
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

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/45">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
      />
    </label>
  );
}

function SelectWrapper({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 dark:text-white/45">
          {icon}
        </div>
      )}

      {children}

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => (
        <tr key={index}>
          <td colSpan={6} className="px-5 py-4">
            <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function EgresadosClient() {
  const router = useRouter();

  const [data, setData] = useState<EgresadosData>({
    egresados: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [carrera, setCarrera] = useState('');
  const [carreras, setCarreras] = useState<CarreraItem[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);

  useEffect(() => {
    egresadosApi
      .carreras()
      .then((response: CarreraItem[]) => {
        setCarreras(Array.isArray(response) ? response : []);
      })
      .catch(console.error);
  }, []);

  const loadEgresados = useCallback(() => {
    setLoading(true);

    egresadosApi
      .list({ search, carrera })
      .then((response: unknown) => {
        setData(normalizeEgresadosData(response));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, carrera]);

  useEffect(() => {
    loadEgresados();
  }, [loadEgresados]);

  const totalPostulaciones = useMemo(() => {
    return data.egresados.reduce(
      (acc, egresado) => acc + (egresado._count?.postulaciones ?? 0),
      0,
    );
  }, [data.egresados]);

  const egresadosConHabilidades = useMemo(() => {
    return data.egresados.filter(
      (egresado) => (egresado.habilidades?.length ?? 0) > 0,
    ).length;
  }, [data.egresados]);

  const limpiarFiltros = () => {
    setSearch('');
    setCarrera('');
  };

  const updateCreateForm = (key: keyof CreateForm, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const createEgresado = async () => {
    if (
      !createForm.email ||
      !createForm.nombre ||
      !createForm.apellido ||
      !createForm.dni
    ) {
      alert('Completa correo, nombre, apellido y DNI.');
      return;
    }

    setSaving(true);

    try {
      await egresadosApi.create({
        ...createForm,
        password: createForm.password || undefined,
        fechaNacimiento: createForm.fechaNacimiento || null,
        anioEgreso: createForm.anioEgreso
          ? Number(createForm.anioEgreso)
          : null,
      });

      setShowCreate(false);
      setCreateForm(emptyCreateForm);
      loadEgresados();
    } catch (error) {
      console.error(error);
      alert(
        'No se pudo crear el egresado. Revisa que el correo o DNI no estén repetidos.',
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteEgresado = async (egresado: Egresado) => {
    const ok = confirm(
      `¿Seguro que deseas eliminar a ${egresado.nombre ?? ''} ${
        egresado.apellido ?? ''
      }? Esta acción no se puede deshacer.`,
    );

    if (!ok) return;

    setDeletingId(egresado.id);

    try {
      await egresadosApi.delete(egresado.id);
      loadEgresados();
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el egresado. Revisa los logs del backend.');
    } finally {
      setDeletingId(null);
    }
  };

  const tieneFiltros = search.trim() !== '' || carrera !== '';

  return (
    <main className="space-y-5 animate-fadeIn">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 px-6 py-5 shadow-md shadow-blue-100/50 dark:border-slate-700 dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:shadow-none">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_35%)] dark:bg-none" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
              Gestión académica
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl dark:text-white">
              Egresados
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Consulta, crea, edita y administra la información académica y
              laboral de los egresados registrados en la plataforma.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg dark:shadow-none"
            >
              <Plus className="h-4 w-4" />
              Nuevo Egresado
            </button>

            <button
              type="button"
              onClick={loadEgresados}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-white/10 dark:bg-white/10 dark:text-white dark:shadow-none dark:hover:bg-white/15"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Egresados"
          value={data.total}
          icon={Users}
          color="#2563eb"
          subtitle="Registrados en el sistema"
        />

        <StatCard
          title="Carreras"
          value={carreras.length}
          icon={GraduationCap}
          color="#7c3aed"
          subtitle="Programas académicos"
        />

        <StatCard
          title="Postulaciones"
          value={totalPostulaciones}
          icon={Briefcase}
          color="#f43f5e"
          subtitle="Total acumulado"
        />

        <StatCard
          title="Con habilidades"
          value={egresadosConHabilidades}
          icon={Award}
          color="#10b981"
          subtitle="Perfiles enriquecidos"
        />
      </section>

      <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/45" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, DNI, correo o carrera..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-white/40 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            />
          </div>

          <SelectWrapper>
            <select
              value={carrera}
              onChange={(event) => setCarrera(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm font-bold text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
            >
              <option value="">Todas las carreras</option>

              {carreras.map((item) => (
                <option key={item.carrera} value={item.carrera}>
                  {item.carrera} ({item.total})
                </option>
              ))}
            </select>
          </SelectWrapper>

          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!tieneFiltros}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm shadow-blue-100/40 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Directorio de egresados
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
              {loading
                ? 'Cargando egresados...'
                : `${data.total} egresado(s) encontrado(s)`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
            <Filter className="h-3.5 w-3.5" />
            Base académica
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Egresado
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Carrera
                </th>

                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Contacto
                </th>

                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Habilidades
                </th>

                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Postulaciones
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-white/45">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <TableSkeleton />
              ) : data.egresados.length > 0 ? (
                data.egresados.map((egresado) => (
                  <tr
                    key={egresado.id}
                    className="transition-colors hover:bg-blue-50/40 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                          {getInitials(egresado.nombre, egresado.apellido)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {egresado.nombre || 'Sin nombre'}{' '}
                            {egresado.apellido || ''}
                          </p>

                          <p className="truncate text-xs font-semibold text-slate-400 dark:text-white/45">
                            DNI: {egresado.dni || '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="inline-flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-white/75">
                        <BookOpen className="h-4 w-4 text-slate-400 dark:text-white/45" />
                        {egresado.carrera || 'Sin carrera'}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400 dark:text-white/45">
                        Cohorte {egresado.anioEgreso || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-white/55">
                          <Mail className="h-4 w-4 text-slate-400 dark:text-white/45" />
                          {egresado.user?.email || '—'}
                        </p>

                        {egresado.telefono && (
                          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-white/55">
                            <Phone className="h-4 w-4 text-slate-400 dark:text-white/45" />
                            {egresado.telefono}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {(egresado.habilidades || [])
                          .slice(0, 3)
                          .map((item, index) => (
                            <span
                              key={item.habilidadId ?? index}
                              className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20"
                            >
                              {item.habilidad?.nombre || 'Habilidad'}
                            </span>
                          ))}

                        {(egresado.habilidades?.length ?? 0) > 3 && (
                          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white/60 dark:ring-white/10">
                            +{(egresado.habilidades?.length ?? 0) - 3}
                          </span>
                        )}

                        {(egresado.habilidades?.length ?? 0) === 0 && (
                          <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-400 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white/45 dark:ring-white/10">
                            Sin habilidades
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-slate-50 px-3 py-1.5 text-sm font-black text-slate-900 ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                        {egresado._count?.postulaciones ?? 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/egresados/${egresado.id}`)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-300"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/egresados/${egresado.id}?edit=1`,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteEgresado(egresado)}
                          disabled={deletingId === egresado.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                          title="Eliminar"
                        >
                          {deletingId === egresado.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/10">
                      <GraduationCap className="h-7 w-7 text-slate-300 dark:text-white/35" />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
                      No se encontraron egresados
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/55">
                      Intenta cambiar el término de búsqueda o seleccionar otra
                      carrera profesional.
                    </p>

                    {tieneFiltros && (
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-blue-700"
                      >
                        <X className="h-4 w-4" />
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-blue-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  Nuevo registro
                </div>

                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  Crear egresado
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/55">
                  La contraseña es opcional. Si la dejas vacía, se usará la
                  contraseña por defecto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-2xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-white/60 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Correo"
                type="email"
                value={createForm.email}
                required
                onChange={(value) => updateCreateForm('email', value)}
              />

              <Field
                label="Contraseña"
                type="password"
                value={createForm.password}
                placeholder="Opcional"
                onChange={(value) => updateCreateForm('password', value)}
              />

              <Field
                label="Nombre"
                value={createForm.nombre}
                required
                onChange={(value) => updateCreateForm('nombre', value)}
              />

              <Field
                label="Apellido"
                value={createForm.apellido}
                required
                onChange={(value) => updateCreateForm('apellido', value)}
              />

              <Field
                label="DNI"
                value={createForm.dni}
                required
                onChange={(value) => updateCreateForm('dni', value)}
              />

              <Field
                label="Teléfono"
                value={createForm.telefono}
                onChange={(value) => updateCreateForm('telefono', value)}
              />

              <Field
                label="Fecha de nacimiento"
                type="date"
                value={createForm.fechaNacimiento}
                onChange={(value) => updateCreateForm('fechaNacimiento', value)}
              />

              <Field
                label="Año de egreso"
                type="number"
                value={createForm.anioEgreso}
                onChange={(value) => updateCreateForm('anioEgreso', value)}
              />

              <Field
                label="Carrera"
                value={createForm.carrera}
                onChange={(value) => updateCreateForm('carrera', value)}
              />

              <Field
                label="Dirección"
                value={createForm.direccion}
                onChange={(value) => updateCreateForm('direccion', value)}
              />
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={createEgresado}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving ? 'Guardando...' : 'Crear egresado'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
