'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';

type AccountType = 'egresado' | 'empresa';

type RegisterForm = {
  nombres: string;
  apellidos: string;
  carrera: string;
  anioEgreso: string;
  empresaNombre: string;
  ruc: string;
  sector: string;
  contacto: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
};

type FormErrors = Partial<Record<keyof RegisterForm, string>>;

const initialForm: RegisterForm = {
  nombres: '',
  apellidos: '',
  carrera: '',
  anioEgreso: '',
  empresaNombre: '',
  ruc: '',
  sector: '',
  contacto: '',
  telefono: '',
  email: '',
  password: '',
  confirmPassword: '',
  aceptaTerminos: false,
};

const carreras = [
  'Administración',
  'Contabilidad',
  'Computación e Informática',
  'Ingeniería de Sistemas',
  'Marketing',
  'Negocios Internacionales',
];

const sectores = [
  'Tecnología',
  'Educación',
  'Finanzas',
  'Comercio',
  'Industria',
  'Servicios',
  'Salud',
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(form: RegisterForm, tipo: AccountType): FormErrors {
  const errors: FormErrors = {};

  if (tipo === 'egresado') {
    if (!form.nombres.trim()) errors.nombres = 'Ingresa tus nombres.';
    if (!form.apellidos.trim()) errors.apellidos = 'Ingresa tus apellidos.';
    if (!form.carrera) errors.carrera = 'Selecciona tu carrera.';
    if (!form.anioEgreso) errors.anioEgreso = 'Ingresa tu año de egreso.';
  }

  if (tipo === 'empresa') {
    if (!form.empresaNombre.trim()) {
      errors.empresaNombre = 'Ingresa el nombre de la empresa.';
    }

    if (!/^\d{11}$/.test(form.ruc)) {
      errors.ruc = 'El RUC debe tener 11 dígitos.';
    }

    if (!form.sector) errors.sector = 'Selecciona el sector.';
    if (!form.contacto.trim()) errors.contacto = 'Ingresa el contacto responsable.';
  }

  if (!form.telefono.trim()) {
    errors.telefono = 'Ingresa un teléfono de contacto.';
  }

  if (!validateEmail(form.email)) {
    errors.email = 'Ingresa un correo válido.';
  }

  if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener mínimo 6 caracteres.';
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if (!form.aceptaTerminos) {
    errors.aceptaTerminos = 'Debes aceptar los términos para continuar.';
  }

  return errors;
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
      <Icon className="mx-auto mb-3 h-6 w-6 text-white/70" />
      <p className="text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/55">{label}</p>
    </div>
  );
}

function AccountButton({
  active,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-3xl border-2 p-5 text-left transition-all duration-300',
        active
          ? 'border-rose-500 bg-rose-50 shadow-lg shadow-rose-500/10'
          : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white',
      )}
    >
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl transition-all',
          active
            ? 'bg-gradient-to-br from-rose-500 to-blue-700 text-white'
            : 'bg-white text-slate-500 group-hover:text-blue-700',
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-base font-black text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>

      {active && (
        <div className="absolute right-4 top-4 rounded-full bg-rose-500 p-1 text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}

function InputField({
  label,
  icon: Icon,
  error,
  type = 'text',
  value,
  placeholder,
  onChange,
  rightElement,
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
  type?: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'w-full rounded-2xl border-2 bg-slate-50 py-4 pl-12 pr-5 text-sm font-semibold text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:bg-white focus:ring-4',
            rightElement && 'pr-14',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
          )}
        />

        {rightElement}
      </div>

      {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  icon: Icon,
  error,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-800">
        {label}
      </label>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'w-full appearance-none rounded-2xl border-2 bg-slate-50 py-4 pl-12 pr-5 text-sm font-semibold text-slate-800 outline-none transition-all duration-300 focus:bg-white focus:ring-4',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100',
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<AccountType>('egresado');
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const accountInfo = useMemo(() => {
    if (tipo === 'egresado') {
      return {
        badge: 'Registro de egresado',
        title: 'Crea tu perfil profesional',
        description:
          'Postula a ofertas, muestra tus habilidades y conecta con empresas aliadas.',
      };
    }

    return {
      badge: 'Registro de empresa',
      title: 'Registra tu empresa',
      description:
        'Publica oportunidades laborales y encuentra talento universitario calificado.',
    };
  }, [tipo]);

  const updateForm = <K extends keyof RegisterForm>(
    key: K,
    value: RegisterForm[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm(form, tipo);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const payload =
        tipo === 'egresado'
          ? {
              tipo,
              nombres: form.nombres,
              apellidos: form.apellidos,
              carrera: form.carrera,
              anioEgreso: form.anioEgreso,
              telefono: form.telefono,
              email: form.email,
              password: form.password,
            }
          : {
              tipo,
              empresaNombre: form.empresaNombre,
              ruc: form.ruc,
              sector: form.sector,
              contacto: form.contacto,
              telefono: form.telefono,
              email: form.email,
              password: form.password,
            };

      console.log('Registro enviado:', payload);

      await new Promise((resolve) => setTimeout(resolve, 900));

      setSuccess(true);

      setTimeout(() => {
        router.push('/auth/login');
      }, 1100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.35),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.35),transparent_35%)]" />
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden rounded-[2rem] border border-white/10 bg-white/10 p-10 shadow-2xl backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-14 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-blue-700 shadow-lg shadow-rose-500/20">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-white">
                  EgresadosNet
                </h1>
                <p className="text-sm font-medium text-white/50">
                  Talento universitario conectado
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/80">
              <Sparkles className="h-4 w-4 text-rose-300" />
              Plataforma académica y laboral
            </div>

            <h2 className="mt-8 max-w-xl text-6xl font-black leading-tight tracking-tight text-white">
              Diseña tu futuro con una cuenta profesional.
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-white/65">
              Una experiencia moderna para egresados y empresas: perfiles,
              postulaciones, ofertas laborales y seguimiento del talento.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={GraduationCap} value="1,200+" label="Egresados" />
            <StatCard icon={Building2} value="85+" label="Empresas" />
            <StatCard icon={ShieldCheck} value="340+" label="Contratados" />
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10">
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </button>

            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
                <BadgeCheck className="h-4 w-4" />
                {accountInfo.badge}
              </div>

              <h2 className="text-4xl font-black tracking-tight text-slate-950">
                {accountInfo.title}
              </h2>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                {accountInfo.description}
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AccountButton
                active={tipo === 'egresado'}
                title="Soy egresado"
                description="Crear perfil, explorar ofertas y postular."
                icon={GraduationCap}
                onClick={() => setTipo('egresado')}
              />

              <AccountButton
                active={tipo === 'empresa'}
                title="Soy empresa"
                description="Publicar ofertas y gestionar candidatos."
                icon={Building2}
                onClick={() => setTipo('empresa')}
              />
            </div>

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                Cuenta creada correctamente. Redirigiendo al login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {tipo === 'egresado' ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputField
                    label="Nombres"
                    icon={User}
                    value={form.nombres}
                    placeholder="Ej. Luis Alberto"
                    error={errors.nombres}
                    onChange={(value) => updateForm('nombres', value)}
                  />

                  <InputField
                    label="Apellidos"
                    icon={User}
                    value={form.apellidos}
                    placeholder="Ej. Ramírez Soto"
                    error={errors.apellidos}
                    onChange={(value) => updateForm('apellidos', value)}
                  />

                  <SelectField
                    label="Carrera profesional"
                    icon={GraduationCap}
                    value={form.carrera}
                    placeholder="Selecciona tu carrera"
                    options={carreras}
                    error={errors.carrera}
                    onChange={(value) => updateForm('carrera', value)}
                  />

                  <InputField
                    label="Año de egreso"
                    icon={BriefcaseBusiness}
                    value={form.anioEgreso}
                    placeholder="Ej. 2025"
                    error={errors.anioEgreso}
                    onChange={(value) => updateForm('anioEgreso', value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <InputField
                    label="Nombre de empresa"
                    icon={Building2}
                    value={form.empresaNombre}
                    placeholder="Ej. Innovatech Perú SAC"
                    error={errors.empresaNombre}
                    onChange={(value) => updateForm('empresaNombre', value)}
                  />

                  <InputField
                    label="RUC"
                    icon={BadgeCheck}
                    value={form.ruc}
                    placeholder="11 dígitos"
                    error={errors.ruc}
                    onChange={(value) => updateForm('ruc', value.replace(/\D/g, '').slice(0, 11))}
                  />

                  <SelectField
                    label="Sector empresarial"
                    icon={BriefcaseBusiness}
                    value={form.sector}
                    placeholder="Selecciona el sector"
                    options={sectores}
                    error={errors.sector}
                    onChange={(value) => updateForm('sector', value)}
                  />

                  <InputField
                    label="Contacto responsable"
                    icon={User}
                    value={form.contacto}
                    placeholder="Ej. Ana Torres"
                    error={errors.contacto}
                    onChange={(value) => updateForm('contacto', value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <InputField
                  label="Teléfono"
                  icon={Phone}
                  value={form.telefono}
                  placeholder="Ej. 987654321"
                  error={errors.telefono}
                  onChange={(value) => updateForm('telefono', value)}
                />

                <InputField
                  label="Correo electrónico"
                  icon={Mail}
                  type="email"
                  value={form.email}
                  placeholder="usuario@correo.com"
                  error={errors.email}
                  onChange={(value) => updateForm('email', value)}
                />

                <InputField
                  label="Contraseña"
                  icon={Lock}
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  placeholder="Mínimo 6 caracteres"
                  error={errors.password}
                  onChange={(value) => updateForm('password', value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPass((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPass ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />

                <InputField
                  label="Confirmar contraseña"
                  icon={Lock}
                  type={showConfirmPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  placeholder="Repite tu contraseña"
                  error={errors.confirmPassword}
                  onChange={(value) => updateForm('confirmPassword', value)}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showConfirmPass ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">
                  <input
                    type="checkbox"
                    checked={form.aceptaTerminos}
                    onChange={(event) =>
                      updateForm('aceptaTerminos', event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm leading-6 text-slate-600">
                    Acepto los términos, condiciones y el uso responsable de mis
                    datos para la gestión de oportunidades laborales.
                  </span>
                </label>

                {errors.aceptaTerminos && (
                  <p className="mt-2 text-xs font-bold text-rose-600">
                    {errors.aceptaTerminos}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-800 via-blue-700 to-rose-500 px-6 py-4 text-lg font-black text-white shadow-xl shadow-blue-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="font-black text-blue-700 transition hover:text-rose-500 hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}