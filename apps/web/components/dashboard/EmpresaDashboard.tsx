'use client';

import { useEffect, useState } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Briefcase,
  Users,
  UserCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Building2,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

function KpiCard({ label, value, icon: Icon, color }: any) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:scale-125"
        style={{ background: color }}
      />

      <div
        className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-110"
        style={{ background: `${color}15` }}
      >
        <Icon className="h-7 w-7" style={{ color }} />
      </div>

      <div className="relative text-3xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
        {value ?? (
          <div className="h-10 w-16 animate-pulse rounded-xl bg-[var(--color-bg-subtle)]" />
        )}
      </div>

      <p className="relative mt-2 text-sm font-semibold text-[var(--color-text-secondary)]">
        {label}
      </p>
    </article>
  );
}

export default function EmpresaDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    estadisticasApi.empresa().then(setData).catch(console.error);
  }, []);

  return (
    <main className="space-y-7 animate-fadeIn">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-8 text-slate-950 shadow-xl dark:from-[#0B1220] dark:via-[#111827] dark:to-[#020617] dark:text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-white/10" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl dark:bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white/75">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              Panel empresa
            </div>

            <h1 className="text-4xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
              Dashboard Empresa
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/70">
              Gestiona tus ofertas laborales, monitorea postulantes y mide el rendimiento de tus procesos.
            </p>
          </div>

          <Link
            href="/dashboard/mis-ofertas/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-400/20 bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <KpiCard
          label="Total Ofertas"
          value={data?.kpis?.totalOfertas}
          icon={Briefcase}
          color="#2563EB"
        />

        <KpiCard
          label="Ofertas Activas"
          value={data?.kpis?.ofertasActivas}
          icon={TrendingUp}
          color="#10B981"
        />

        <KpiCard
          label="Postulaciones"
          value={data?.kpis?.totalPostulaciones}
          icon={Users}
          color="#EF4444"
        />

        <KpiCard
          label="Contratados"
          value={data?.kpis?.contratados}
          icon={UserCheck}
          color="#F59E0B"
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 shadow-sm">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h3 className="text-xl font-display font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Rendimiento de Ofertas
              </h3>

              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Postulaciones y tasa de conversión por oferta
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/mis-ofertas"
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-2 text-xs font-extrabold text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-[var(--color-bg-subtle)]">
              <tr>
                <th className="px-7 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Oferta
                </th>

                <th className="px-7 py-4 text-left text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Estado
                </th>

                <th className="px-7 py-4 text-center text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Postulantes
                </th>

                <th className="px-7 py-4 text-center text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Contratados
                </th>

                <th className="px-7 py-4 text-center text-xs font-black uppercase tracking-wider text-[var(--color-text-muted)]">
                  Conversión
                </th>

                <th className="px-7 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {(data?.rendimientoOfertas || []).map((oferta: any) => (
                <tr
                  key={oferta.id}
                  className="transition-colors hover:bg-[var(--color-bg-subtle)]/70"
                >
                  <td className="px-7 py-4">
                    <p className="text-sm font-extrabold text-[var(--color-text-primary)]">
                      {oferta.titulo}
                    </p>
                  </td>

                  <td className="px-7 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${
                        oferta.estado === 'ACTIVA'
                          ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] ring-[var(--color-border)]'
                      }`}
                    >
                      {oferta.estado}
                    </span>
                  </td>

                  <td className="px-7 py-4 text-center text-sm font-extrabold text-[var(--color-text-primary)]">
                    {oferta.postulaciones}
                  </td>

                  <td className="px-7 py-4 text-center text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {oferta.contratados}
                  </td>

                  <td className="px-7 py-4 text-center">
                    <div className="mx-auto flex max-w-32 items-center justify-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-700"
                          style={{ width: `${oferta.tasaConversion}%` }}
                        />
                      </div>

                      <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                        {oferta.tasaConversion}%
                      </span>
                    </div>
                  </td>

                  <td className="px-7 py-4 text-right">
                    <Link
                      href={`/dashboard/candidatos?oferta=${oferta.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-2 text-xs font-extrabold text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                    >
                      Ver candidatos
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}

              {!data && (
                <tr>
                  <td colSpan={6} className="px-7 py-12 text-center">
                    <div className="mx-auto h-5 w-48 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
                    <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
                      Cargando datos...
                    </p>
                  </td>
                </tr>
              )}

              {data?.rendimientoOfertas?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-7 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <Briefcase className="h-7 w-7 text-[var(--color-text-muted)]" />
                    </div>

                    <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
                      No hay ofertas aún.
                    </p>

                    <Link
                      href="/dashboard/mis-ofertas/nueva"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-2 text-sm font-extrabold text-blue-700 ring-1 ring-blue-500/20 transition hover:bg-blue-500/15 dark:text-blue-300"
                    >
                      Crear la primera
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
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