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
        'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
      POSTULADO:
        'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
      REVISADO:
        'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
      EN_REVISION:
        'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20',
      ENTREVISTA:
        'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
      ACEPTADO:
        'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
      CONTRATADO:
        'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
      RECHAZADO:
        'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20',
    };

    return (
      styles[estadoActual] ||
      'bg-slate-50 text-slate-600 ring-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
    );
  };

  const getEstadoIcon = (estadoActual: string) => {
    if (estadoActual === 'ACEPTADO' || estadoActual === 'CONTRATADO') {
      return <CheckCircle className="h-3.5 w-3.5" />;
    }

    if (estadoActual === 'RECHAZADO') {
      return <XCircle className="h-3.5 w-3.5" />;
    }

    return <Clock className="h-3.5 w-3.5" />;
  };

  useEffect(() => {
    setLoading(true);

    postulacionesApi
      .getAll({ estado })
      .then(setData)
      .finally(() => setLoading(false));
  }, [estado]);

  return (
    <main className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 text-white shadow-xl dark:border-slate-700">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-24 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/75">
              <Briefcase className="h-4 w-4 text-blue-300" />
              Seguimiento laboral
            </div>

            <h1 className="text-4xl font-black tracking-tight">
              Postulaciones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Revisa las postulaciones registradas por los egresados, el estado
              de cada proceso y las empresas asociadas.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-widest text-white/45">
              Total registrado
            </p>

            <p className="mt-1 text-3xl font-black text-white">
              {data.total ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por egresado o oferta..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-bold text-slate-600 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500 dark:focus:bg-slate-800 dark:focus:ring-blue-500/20"
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-950 dark:text-white">
              Directorio de postulaciones
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">
              {loading
                ? 'Cargando postulaciones...'
                : `${data.total ?? 0} postulación(es) en el sistema`}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
            <Briefcase className="h-3.5 w-3.5" />
            Procesos laborales
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-slate-50 dark:bg-slate-950/70">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Egresado
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Oferta
                </th>

                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                  Empresa
                </th>

                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                  Estado
                </th>

                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">
                  Fecha
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    </td>
                  </tr>
                ))
              ) : data.postulaciones?.length > 0 ? (
                data.postulaciones.map((post: any) => (
                  <tr
                    key={post.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 text-sm font-black text-blue-700 ring-1 ring-slate-200 dark:from-blue-500/10 dark:to-slate-800 dark:text-blue-300 dark:ring-slate-700">
                          {(post.egresado?.nombre?.[0] || 'E').toUpperCase()}
                          {(post.egresado?.apellido?.[0] || 'G').toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {post.egresado?.nombre || 'Sin nombre'}{' '}
                            {post.egresado?.apellido || ''}
                          </p>

                          <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                            {post.egresado?.carrera || 'Sin carrera registrada'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="max-w-xs truncate text-sm font-black text-slate-900 dark:text-slate-100">
                        {post.oferta?.titulo || 'Sin oferta'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {post.oferta?.empresa?.nombreComercial || '—'}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getEstadoClasses(
                            post.estado,
                          )}`}
                        >
                          {getEstadoIcon(post.estado)}
                          {String(post.estado || 'PENDIENTE').replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString('es-PE')
                          : '—'}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-800">
                      <UserRound className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                      No se encontraron postulaciones
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
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
