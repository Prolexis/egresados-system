'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import EgresadoDashboard from '@/components/dashboard/EgresadoDashboard';
import EmpresaDashboard from '@/components/dashboard/EmpresaDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  if (user.role === 'ADMIN') return <AdminDashboard />;
  if (user.role === 'EGRESADO') return <EgresadoDashboard />;
  if (user.role === 'EMPRESA') return <EmpresaDashboard />;
  return null;
}
