'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const statCards = [
  { icon: GraduationCap, label: 'Egresados', value: '1,200+' },
  { icon: Building2, label: 'Empresas', value: '85+' },
  { icon: ShieldCheck, label: 'Empleados', value: '340+' },
];

const demoButtons = [
  { role: 'admin', label: '🛡 Admin', color: '#1a1a2e' },
  { role: 'empresa', label: '🏢 Empresa', color: '#16213e' },
  { role: 'egresado', label: '🎓 Egresado', color: '#e94560' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const fillDemo = (role: 'admin' | 'empresa' | 'egresado') => {
    const creds = {
      admin: { email: 'admin@demo.edu.pe', password: 'Admin123*' },
      empresa: { email: 'empresa@demo.pe', password: 'Empresa123*' },
      egresado: { email: 'egresado@demo.pe', password: 'Egresado123*' },
    };
    setValue('email', creds[role].email);
    setValue('password', creds[role].password);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg-base)] transition-colors duration-300 overflow-hidden relative">
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: 'var(--color-brand-primary)', animationDelay: '0s' }} />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl animate-pulse" style={{ background: 'var(--color-brand-secondary)', animationDelay: '1.5s' }} />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 z-10 relative">
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 rounded-3xl bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#7C3AED] text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-white" />
            <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-display font-extrabold">EgresadosNet</span>
              </div>
              <ThemeToggle />
            </div>

            <h1 className="text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
              Conecta tu <br />talento con <br />
              <span className="text-white/90">oportunidades</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              La plataforma universitaria que une a egresados con las mejores empresas del país.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 relative z-10 mt-8">
            {statCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl p-5 text-center bg-white/10 backdrop-blur border border-white/15 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1">
                <Icon className="w-7 h-7 text-white/60 mx-auto mb-3" />
                <div className="text-3xl font-display font-extrabold text-white">{value}</div>
                <div className="text-sm text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-[var(--color-bg-surface)] rounded-3xl p-10 border border-[var(--color-border)] shadow-md">
              <div className="flex lg:hidden items-center justify-between gap-3 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] flex items-center justify-center">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <span className="font-display font-extrabold text-2xl text-[var(--color-brand-primary)]">EgresadosNet</span>
                </div>
                <ThemeToggle />
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-display font-extrabold text-[var(--color-text-primary)]">Iniciar sesión</h2>
                <p className="text-[var(--color-text-muted)] mt-2 text-lg">Accede a tu cuenta para continuar</p>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4 text-[var(--color-text-muted)]">Acceso rápido demo</p>
                <div className="grid grid-cols-3 gap-3">
                  {demoButtons.map(({ role, label, color }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => fillDemo(role as any)}
                      className="text-sm py-3 px-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 text-white shadow-lg"
                      style={{ background: color }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[var(--color-border)]" />
                <span className="text-sm text-[var(--color-text-muted)] font-semibold">o ingresa manualmente</span>
                <div className="flex-1 h-px bg-[var(--color-border)]" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-3 text-[var(--color-text-primary)]">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="usuario@demo.pe"
                      className={`w-full pl-14 pr-6 py-4 rounded-2xl text-base outline-none transition-all duration-300 border-2 bg-[var(--color-bg-subtle)] ${
                        errors.email
                          ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-[var(--color-danger)]/10'
                          : 'border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-[var(--color-brand-primary)]/10'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-sm mt-2 text-[var(--color-danger)] font-semibold">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3 text-[var(--color-text-primary)]">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full pl-14 pr-16 py-4 rounded-2xl text-base outline-none transition-all duration-300 border-2 bg-[var(--color-bg-subtle)] ${
                        errors.password
                          ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-[var(--color-danger)]/10'
                          : 'border-[var(--color-border)] focus:border-[var(--color-brand-primary)] focus:bg-[var(--color-bg-surface)] focus:ring-4 focus:ring-[var(--color-brand-primary)]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm mt-2 text-[var(--color-danger)] font-semibold">{errors.password.message}</p>}
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)]">
                    <span className="text-xl">⚠</span>
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                  style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>Ingresar <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-sm mt-8 text-[var(--color-text-muted)]">
                ¿No tienes cuenta?{' '}
                <a href="/auth/register" className="font-extrabold text-[var(--color-brand-primary)] hover:text-[var(--color-brand-secondary)] transition-colors hover:underline">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
