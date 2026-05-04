'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
  { role: 'admin', label: 'Admin', color: '#2563EB' },
  { role: 'empresa', label: 'Empresa', color: '#4F46E5' },
  { role: 'egresado', label: 'Egresado', color: '#0F172A' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
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
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.22),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,246,255,0.88))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_30%),linear-gradient(135deg,#020617,#0f172a,#111827)]" />

      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/20" />
      <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/20" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-300/10 blur-3xl dark:bg-sky-500/10" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
          <aside className="relative hidden overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 text-white shadow-2xl shadow-blue-950/20 lg:flex lg:min-h-[680px] lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
            <div className="absolute -bottom-20 left-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.10),transparent_28%,transparent_70%,rgba(255,255,255,0.08))]" />

            <div className="relative z-10">
              <div className="mb-12 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold tracking-tight">
                      EgresadosNet
                    </p>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
                      Plataforma laboral
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-1 backdrop-blur">
                  <ThemeToggle />
                </div>
              </div>

              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/70 backdrop-blur">
                <Sparkles className="h-4 w-4 text-blue-200" />
                Gestión institucional premium
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-[1.03] tracking-tight xl:text-6xl">
                Conecta talento egresado con oportunidades reales.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/68">
                Una plataforma administrativa moderna para gestionar egresados,
                empresas, postulaciones y reportes institucionales desde un solo
                entorno profesional.
              </p>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                {statCards.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-5 w-5 text-blue-100" />
                    </div>

                    <p className="text-2xl font-black tracking-tight text-white">
                      {value}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/45">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Acceso seguro y centralizado
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Roles diferenciados para administración, empresas y
                    egresados, con experiencia optimizada para seguimiento
                    académico-laboral.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
                    <GraduationCap className="h-7 w-7 text-white" />
                  </div>

                  <div>
                    <p className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                      EgresadosNet
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/45">
                      Plataforma laboral
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/10">
                  <ThemeToggle />
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-blue-950/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.07] dark:shadow-black/30">
                <div className="border-b border-slate-200/70 bg-gradient-to-br from-white to-blue-50/70 px-6 py-6 dark:border-white/10 dark:from-white/10 dark:to-blue-500/5 sm:px-8">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Acceso autorizado
                  </div>

                  <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                    Iniciar sesión
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/55">
                    Ingresa tus credenciales para continuar al panel principal.
                  </p>
                </div>

                <div className="px-6 py-6 sm:px-8">
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-white/45">
                      Acceso rápido demo
                    </p>

                    <div className="grid grid-cols-3 gap-2.5">
                      {demoButtons.map(({ role, label, color }) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => fillDemo(role as any)}
                          className="group rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/15"
                        >
                          <span
                            className="mx-auto mb-2 block h-2 w-8 rounded-full transition-all group-hover:w-10"
                            style={{ backgroundColor: color }}
                          />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                      o ingresa manualmente
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700 dark:text-white/80">
                        Correo electrónico
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/40" />

                        <input
                          {...register('email')}
                          type="email"
                          placeholder="usuario@demo.pe"
                          className={`w-full rounded-2xl border bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:bg-white focus:ring-4 dark:bg-white/10 dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/15 ${
                            errors.email
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/30 dark:focus:ring-red-500/20'
                              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-white/10 dark:focus:border-blue-400 dark:focus:ring-blue-500/20'
                          }`}
                        />
                      </div>

                      {errors.email && (
                        <p className="mt-2 text-sm font-semibold text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-700 dark:text-white/80">
                        Contraseña
                      </label>

                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-white/40" />

                        <input
                          {...register('password')}
                          type={showPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          className={`w-full rounded-2xl border bg-slate-50 py-3.5 pl-12 pr-14 text-sm font-semibold text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:bg-white focus:ring-4 dark:bg-white/10 dark:text-white dark:placeholder:text-white/35 dark:focus:bg-white/15 ${
                            errors.password
                              ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/30 dark:focus:ring-red-500/20'
                              : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100 dark:border-white/10 dark:focus:border-blue-400 dark:focus:ring-blue-500/20'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          {showPass ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      {errors.password && (
                        <p className="mt-2 text-sm font-semibold text-red-500">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 px-5 py-4 text-base font-black text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:from-blue-600 dark:via-indigo-600 dark:to-blue-500"
                    >
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
                          Ingresando...
                        </>
                      ) : (
                        <>
                          Ingresar
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-7 text-center text-sm font-medium text-slate-500 dark:text-white/45">
                    ¿No tienes cuenta?{' '}
                    <a
                      href="/auth/register"
                      className="font-black text-blue-600 transition hover:text-indigo-600 hover:underline dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      Regístrate aquí
                    </a>
                  </p>
                </div>
              </div>

              <p className="mt-5 text-center text-xs font-semibold text-slate-400 dark:text-white/35">
                Plataforma administrativa para gestión de egresados y empleabilidad.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
