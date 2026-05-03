import { Suspense } from 'react';
import EgresadosClient from './EgresadosClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function EgresadosPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-6">
          <div className="h-40 animate-pulse rounded-[2rem] bg-slate-100 dark:bg-slate-800" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </main>
      }
    >
      <EgresadosClient />
    </Suspense>
  );
}