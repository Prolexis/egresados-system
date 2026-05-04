'use client';

import { useEffect, useState } from 'react';
import { postulacionesApi } from '@/lib/api';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Filter,
  Search,
  UserRound,
  XCircle,
} from 'lucide-react';

export default function PostulacionesPage() {
  const [data, setData] = useState<any>({ postulaciones: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');

  const estados = [
    'PENDIENTE',
    'POSTULADO',
    'REVISADO',
    'EN_REVISION',
    'ENTREVISTA',
    'ACEPTADO',
    'CONTRATADO',
    'RECHAZADO',
  ];

  const getEstadoClasses = (estadoActual: string) => {
    const styles: Record<string, string> = {
      PENDIENTE:
        'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-600/15 dark:text-amber-400 dark:ring-amber-600/30',
      POSTULADO:
        'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-600/15 dark:text-amber-400 dark:ring-amber-600/30',
      REVISADO:
        'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:ring-blue-600/30',
      EN_REVISION:
        'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:ring-blue-600/30',
      ENTREVISTA:
        'bg-indigo-100 text-indigo-800 ring-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400:ring-indigo-600/30',
      ACEPTADO:
        'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-400 dark:ring-emerald-600/30',
      CONTRATADO:
        'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-400 dark:ring-emerald-600/30',
      RECHAZADO:
        'bg-red-100 text-red-800 ring-red-200 dark:bg-red-600/15 dark:text-red-400 dark:ring-red-600/30',
    };

    return (
      styles[estadoActual] ||
      'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700'
    );
  };

  const getEstadoIcon = (estadoActual: string) => {
    if (estadoActual === 'ACEPTADO' || estadoActual === 'CONTRATADO') {
      return <CheckCircle className="h-4 w-4" />;
    }

    if (estadoActual === 'RECHAZADO') {
      return <XCircle className="h-4 w-4" />;
    }

    return <Clock className="h-4 w-4 animate-pulse" />;
  };

  useEffect(() => {
    setLoading(true);

    postulacionesApi
      .getAll({ estado })
      .then(setData)
      .finally(() => setLoading(false));
  }, [estado]);

  return (
    <main className="space-y-8 px-4 md:px-8 lg:px-16 py-8 max-w-7xl mx-auto select-none">
      <section className="relative overflow-hidden rounded-3xl border border-slate-300 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-9 text-white shadow-2xl dark:border-slate-700">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-28 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/15 px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-white/80 shadow-[0_0_10px_rgba(255,255,255,0.12)]">
              <Briefcase className="h-5 w-5 text-blue-400" />
              Seguimiento Laboral
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">
              Postulaciones
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-white/70">
              Revisa las postulaciones registradas por los egresados, el estado
              de cada proceso y las empresas asociadas.
            </p>
          </div>

          <div className="rounded-4xl border border-white/15 bg-white/15 px-8 py-6 backdrop-blur-2xl shadow-xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-widest text-white/50">
              Total Registrado
            </p>

            <p className="mt-2 text-4xl font-extrabold leading-none text-white drop-shadow-md">
              {data.total ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-slate-300 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-4 sm:grid-cols-[1fr_320px] sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por egresado o oferta..."
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 py-4 pl-14 pr-5 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-600 dark:focus:bg-slate-900 dark:focus:ring-blue-600/30"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 dark:text-slate-400" />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full cursor-pointer rounded-3xl border border-slate-300 bg-slate-50 py-4 pl-14 pr-5 text-sm font-bold text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-600 dark:focus:bg-slate-900 dark:focus:ring-blue-600/30"
            >
              <option value="">Todos los estados</option>

              {estados.map((item) => (
                <option key={item} value={item}>
                  {item.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-4xl border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-8 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Directorio de postulaciones
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {loading
                ? 'Cargando postulaciones...'
                : `${data.total ?? 0} postulación(es) en el sistema`}
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-full bg-blue-100 px-4 py-2 text-sm font-extrabold text-blue-800 ring-1 ring-blue-200 dark:bg-blue-600/20 dark:text-blue-300 dark:ring-blue-600/30 shadow-md">
            <Briefcase className="h-5 w-5" />
            Procesos Laborales
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] table-auto border-separate border-spacing-y-3">
            <thead className="bg-slate-100 dark:bg-slate-950/80">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Egresado
                </th>

                <th className="px-8 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Oferta
                </th>

                <th className="px-8 py-5 text-left text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Empresa
                </th>

                <th className="px-8 py-5 text-center text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Estado
                </th>

                <th className="px-8 py-5 text-right text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800">
                    <td colSpan={5} className="px-8 py-5" />
                  </tr>
                ))
              ) : data.postulaciones?.length > 0 ? (
                data.postulaciones.map((post: any) => (
                  <tr
                    key={post.id}
                    className="rounded-xl transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/40"
                  >
                    <td className="px-8 py-5 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-slate-100 text-lg font-extrabold text-blue-800 ring-1 ring-slate-300 dark:from-blue-700/20 dark:to-slate-800 dark:text-blue-400 dark:ring-slate-700">
                          {(post.egresado?.nombre?.[0] || 'E').toUpperCase()}
                          {(post.egresado?.apellido?.[0] || 'G').toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-extrabold text-slate-900 dark:text-white">
                            {post.egresado?.nombre || 'Sin nombre'}{' '}
                            {post.egresado?.apellido || ''}
                          </p>

                          <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
                            {post.egresado?.carrera || 'Sin carrera registrada'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5 align-middle">
                      <p className="max-w-xs truncate text-base font-extrabold text-slate-900 dark:text-white">
                        {post.oferta?.titulo || 'Sin oferta'}
                      </p>
                    </td>

                    <td className="px-8 py-5 align-middle">
                      <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
                        {post.oferta?.empresa?.nombreComercial || '—'}
                      </p>
                    </td>

                    <td className="px-8 py-5 align-middle">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-2 rounded-3xl px-4 py-2 text-sm font-extrabold ring-1 ${getEstadoClasses(
                            post.estado,
                          )}`}
                        >
                          {getEstadoIcon(post.estado)}
                          {String(post.estado || 'PENDIENTE').replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right align-middle">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-4xl bg-slate-100 dark:bg-slate-800">
                      <UserRound className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      No se encontraron postulaciones
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-500 dark:text-slate-400">
                      Intenta seleccionar otro estado o verifica si ya existen
                      postulaciones registradas en el sistema.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
