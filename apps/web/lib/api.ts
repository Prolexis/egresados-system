import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── CLIENTE REST ─────────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── FUNCIÓN PARA OBTENER TOKEN ───────────────────────────────────────────────
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  let token: string | null = null;

  token = localStorage.getItem('access_token');

  if (!token) {
    try {
      const stored = localStorage.getItem('egresados-auth');

      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.token ?? null;
      }
    } catch {
      token = null;
    }
  }

  if (!token) {
    const cookie = document.cookie
      .split(';')
      .find((item) => item.trim().startsWith('access_token='));

    if (cookie) {
      token = cookie.split('=')[1]?.trim() ?? null;
    }
  }

  return token;
}

// ─── INTERCEPTOR: AGREGAR TOKEN JWT ──────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

// ─── INTERCEPTOR: MANEJAR 401 ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.includes('/auth/login')
    ) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('egresados-auth');
      document.cookie = 'access_token=; path=/; max-age=0';
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  },
);

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((response) => response.data),

  me: () =>
    api.get('/auth/me').then((response) => response.data),

  registerEgresado: (data: any) =>
    api.post('/auth/register/egresado', data).then((response) => response.data),

  registerEmpresa: (data: any) =>
    api.post('/auth/register/empresa', data).then((response) => response.data),
};

// ─── EGRESADOS ───────────────────────────────────────────────────────────────
export const egresadosApi = {
  list: (params?: {
    search?: string;
    carrera?: string;
    anioEgreso?: number | string;
    habilidades?: string;
    skip?: number;
    take?: number;
  }) =>
    api.get('/egresados', { params }).then((response) => response.data),

  get: (id: string) =>
    api.get(`/egresados/${id}`).then((response) => response.data),

  me: () =>
    api.get('/egresados/me').then((response) => response.data),

  create: (data: any) =>
    api.post('/egresados', data).then((response) => response.data),

  update: (id: string, data: any) =>
    api.put(`/egresados/${id}`, data).then((response) => response.data),

  delete: (id: string) =>
    api.delete(`/egresados/${id}`).then((response) => response.data),

  misEstadisticas: () =>
    api.get('/egresados/me/estadisticas').then((response) => response.data),

  agregarHabilidad: (id: string, data: any) =>
    api.post(`/egresados/${id}/habilidades`, data).then((response) => response.data),

  eliminarHabilidad: (id: string, habilidadId: string) =>
    api
      .delete(`/egresados/${id}/habilidades/${habilidadId}`)
      .then((response) => response.data),

  carreras: () =>
    api.get('/egresados/carreras').then((response) => response.data),
};

// ─── EMPRESAS ────────────────────────────────────────────────────────────────
export const empresasApi = {
  list: (params?: {
    search?: string;
    sector?: string;
    skip?: number;
    take?: number;
  }) =>
    api.get('/empresas', { params }).then((response) => response.data),

  get: (id: string) =>
    api.get(`/empresas/${id}`).then((response) => response.data),

  me: () =>
    api.get('/empresas/me').then((response) => response.data),

  create: (data: any) =>
    api.post('/empresas', data).then((response) => response.data),

  update: (id: string, data: any) =>
    api.put(`/empresas/${id}`, data).then((response) => response.data),

  delete: (id: string) =>
    api.delete(`/empresas/${id}`).then((response) => response.data),

  sectores: () =>
    api.get('/empresas/sectores').then((response) => response.data),
};

// ─── OFERTAS LABORALES ───────────────────────────────────────────────────────
export const ofertasApi = {
  list: (params?: any) =>
    api.get('/ofertas', { params }).then((response) => response.data),

  get: (id: string) =>
    api.get(`/ofertas/${id}`).then((response) => response.data),

  create: (data: any) =>
    api.post('/ofertas', data).then((response) => response.data),

  update: (id: string, data: any) =>
    api.put(`/ofertas/${id}`, data).then((response) => response.data),

  delete: (id: string) =>
    api.delete(`/ofertas/${id}`).then((response) => response.data),

  misOfertas: () =>
    api.get('/ofertas/mis-ofertas').then((response) => response.data),
};

// ─── POSTULACIONES ──────────────────────────────────────────────────────────
export const postulacionesApi = {
  postular: (ofertaId: string, comentario?: string) =>
    api
      .post('/postulaciones', { ofertaId, comentario })
      .then((response) => response.data),

  misPostulaciones: () =>
    api.get('/postulaciones/mis-postulaciones').then((response) => response.data),

  getAll: (params?: any) =>
    api.get('/postulaciones', { params }).then((response) => response.data),

  cambiarEstado: (id: string, estado: string, motivo?: string) =>
    api
      .put(`/postulaciones/${id}/estado`, { estado, motivo })
      .then((response) => response.data),

  porOferta: (ofertaId: string) =>
    api.get(`/postulaciones/oferta/${ofertaId}`).then((response) => response.data),
};

// ─── ESTADÍSTICAS ───────────────────────────────────────────────────────────
export const estadisticasApi = {
  admin: (params?: any) =>
    api.get('/estadisticas/admin', { params }).then((response) => response.data),

  egresado: () =>
    api.get('/estadisticas/egresado').then((response) => response.data),

  empresa: () =>
    api.get('/estadisticas/empresa').then((response) => response.data),
};

// ─── REPORTES ───────────────────────────────────────────────────────────────
export const reportesApi = {
  solicitar: (tipo: string, parametros?: any) =>
    api.post('/reportes', { tipo, parametros }).then((response) => response.data),

  estado: (id: string) =>
    api.get(`/reportes/${id}/estado`).then((response) => response.data),

  misReportes: () =>
    api.get('/reportes/mis-reportes').then((response) => response.data),
};

// ─── NOTIFICACIONES ─────────────────────────────────────────────────────────
export const notificacionesApi = {
  list: () =>
    api.get('/notificaciones').then((response) => response.data),

  noLeidas: () =>
    api.get('/notificaciones/no-leidas').then((response) => response.data),

  marcarLeida: (id: string) =>
    api.put(`/notificaciones/${id}/leer`).then((response) => response.data),

  marcarTodas: () =>
    api.put('/notificaciones/marcar-todas').then((response) => response.data),
};

// ─── HABILIDADES ────────────────────────────────────────────────────────────
export const habilidadesApi = {
  list: (tipo?: string) =>
    api.get('/habilidades', { params: { tipo } }).then((response) => response.data),

  create: (data: any) =>
    api.post('/habilidades', data).then((response) => response.data),

  delete: (id: string) =>
    api.delete(`/habilidades/${id}`).then((response) => response.data),
};