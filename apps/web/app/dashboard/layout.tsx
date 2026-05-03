'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { notificacionesApi } from '@/lib/api';
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText,
  Bell, LogOut, GraduationCap, Menu, X, ChevronRight,
  Settings, BookOpen
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navByRole = {
  ADMIN: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/egresados', icon: GraduationCap, label: 'Egresados' },
    { href: '/dashboard/empresas', icon: Building2, label: 'Empresas' },
    { href: '/dashboard/ofertas', icon: Briefcase, label: 'Ofertas Laborales' },
    { href: '/dashboard/postulaciones', icon: BookOpen, label: 'Postulaciones' },
    { href: '/dashboard/reportes', icon: FileText, label: 'Reportes' },
  ],
  EGRESADO: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Mi Dashboard' },
    { href: '/dashboard/ofertas', icon: Briefcase, label: 'Ofertas Disponibles' },
    { href: '/dashboard/mis-postulaciones', icon: BookOpen, label: 'Mis Postulaciones' },
    { href: '/dashboard/notificaciones', icon: Bell, label: 'Notificaciones' },
    { href: '/dashboard/mi-perfil', icon: Settings, label: 'Mi Perfil' },
  ],
  EMPRESA: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/mis-ofertas', icon: Briefcase, label: 'Mis Ofertas' },
    { href: '/dashboard/candidatos', icon: Users, label: 'Candidatos' },
    { href: '/dashboard/notificaciones', icon: Bell, label: 'Notificaciones' },
    { href: '/dashboard/reportes', icon: FileText, label: 'Reportes' },
    { href: '/dashboard/mi-perfil', icon: Settings, label: 'Mi Perfil' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/auth/login'); return; }
    notificacionesApi.noLeidas().then(setNoLeidas).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const navItems = navByRole[user?.role || 'EGRESADO'] || [];

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? 'w-full' : 'w-[260px]'} flex flex-col h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]`}>
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}>
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-[var(--color-text-primary)] font-display font-extrabold text-lg leading-none">EgresadosNet</div>
          <div className="text-xs mt-1 text-[var(--color-text-muted)]">
            {user?.role === 'ADMIN' ? 'Administración' : user?.role === 'EMPRESA' ? 'Portal Empresa' : 'Portal Egresado'}
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-2 rounded-xl hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group"
              style={{
                color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                borderLeft: active ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-5 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[var(--color-text-primary)] text-sm font-semibold truncate">{user?.email}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)]">
      <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: 260 }}>
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-80 flex flex-col">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-7 py-5 bg-[var(--color-bg-surface)]/80 backdrop-blur-lg border-b border-[var(--color-border)] z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 rounded-2xl hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard/notificaciones" className="relative p-2.5 rounded-2xl hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
              <Bell className="w-6 h-6" />
              {noLeidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-extrabold animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', fontSize: '10px' }}>
                  {noLeidas > 9 ? '9+' : noLeidas}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
