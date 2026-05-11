'use client';

import { useEffect, useState } from 'react';
import { estadisticasApi } from '@/lib/api';
import {
  Briefcase, Users, UserCheck, TrendingUp,
  Plus, ArrowRight, BarChart3, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

/* ─── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color }: any) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[.08] blur-2xl transition group-hover:scale-125"
        style={{ background: color }}
      />

      {/* Left accent */}
      <div
        className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl opacity-70"
        style={{ background: color }}
      />

      <div
        className="relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: `${color}12` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <div className="relative text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
        {value ?? (
          <div className="h-8 w-14 animate-pulse rounded-lg bg-[var(--color-bg-subtle)]" />
        )}
      </div>

      <p className="relative mt-1 text-[13px] font-medium text-[var(--color-text-secondary)]">
        {label}
      </p>
    </article>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────── */
export default function EmpresaDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    estadisticasApi.empresa().then(setData).catch(console.error);
  }, []);

  return (
    <main className="space-y-5">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl dark:bg-indigo-500/8" />
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-l-2xl bg-blue-500/50" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Panel empresa
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Dashboard Empresa
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-[var(--color-text-secondary)]">
              Gestiona tus ofertas laborales, monitorea postulantes y mide el rendimiento de tus procesos.
            </p>
          </div>

          <Link
            href="/dashboard/mis-ofertas/nueva"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Link>
        </div>
      </section>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label="Total Ofertas"   value={data?.kpis?.totalOfertas}       icon={Briefcase}  color="#2563EB" />
        <KpiCard label="Ofertas Activas" value={data?.kpis?.ofertasActivas}     icon={TrendingUp} color="#10B981" />
        <KpiCard label="Postulaciones"   value={data?.kpis?.totalPostulaciones} icon={Users}      color="#EF4444" />
        <KpiCard label="Contratados"     value={data?.kpis?.contratados}        icon={UserCheck}  color="#F59E0B" />
      </section>

      {/* ── Tabla rendimiento ────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">

        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">
                Rendimiento de Ofertas
              </h3>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Postulaciones y tasa de conversión por oferta
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/mis-ofertas"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                {['Oferta', 'Estado', 'Postulantes', 'Contratados', 'Conversión', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] ${
                      i === 0 ? 'text-left' : i === 5 ? '' : i === 1 ? 'text-left' : 'text-center'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {(data?.rendimientoOfertas || []).map((oferta: any) => (
                <tr
                  key={oferta.id}
                  className="transition-colors hover:bg-[var(--color-bg-subtle)]/60"
                >
                  {/* Título */}
                  <td className="px-6 py-3.5">
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                      {oferta.titulo}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                        oferta.estado === 'ACTIVA'
                          ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] ring-[var(--color-border)]'
                      }`}
                    >
                      {oferta.estado}
                    </span>
                  </td>

                  {/* Postulantes */}
                  <td className="px-6 py-3.5 text-center text-[13px] font-bold text-[var(--color-text-primary)]">
                    {oferta.postulaciones}
                  </td>

                  {/* Contratados */}
                  <td className="px-6 py-3.5 text-center text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                    {oferta.contratados}
                  </td>

                  {/* Conversión */}
                  <td className="px-6 py-3.5">
                    <div className="mx-auto flex max-w-[120px] items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-700"
                          style={{ width: `${oferta.tasaConversion}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        {oferta.tasaConversion}%
                      </span>
                    </div>
                  </td>

                  {/* Acción */}
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      href={`/dashboard/candidatos?oferta=${oferta.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-[11px] font-semibold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
                    >
                      Ver candidatos
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {/* Loading */}
              {!data && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto h-4 w-44 animate-pulse rounded-full bg-[var(--color-bg-subtle)]" />
                    <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">Cargando datos...</p>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {data?.rendimientoOfertas?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                      <Briefcase className="h-6 w-6 text-[var(--color-text-muted)]" />
                    </div>
                    <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                      No hay ofertas aún.
                    </p>
                    <Link
                      href="/dashboard/mis-ofertas/nueva"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3.5 py-1.5 text-[12px] font-semibold text-blue-600 transition hover:bg-blue-500/10 dark:text-blue-400"
                    >
                      Crear la primera
                      <ArrowRight className="h-3 w-3" />
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
