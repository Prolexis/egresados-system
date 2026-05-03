# 🎓 EgresadosNet — Sistema Web de Egresados y Oferta Laboral

Sistema web empresarial para la gestión integral de egresados universitarios y oportunidades laborales, con dashboards analíticos, estadísticas descriptivas y generación de reportes PDF profesionales.

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Local](#instalación-local)
- [Ejecución con Docker](#ejecución-con-docker)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Módulos del Sistema](#módulos-del-sistema)
- [Endpoints Principales](#endpoints-principales)
- [Subir a GitHub](#subir-a-github)

---

## 📖 Descripción

**EgresadosNet** conecta egresados universitarios con empresas empleadoras a través de una plataforma moderna que incluye:

- Gestión completa de perfiles de egresados con habilidades y CV
- Portal de ofertas laborales con postulación en un clic
- Dashboards analíticos diferenciados por rol (Admin, Empresa, Egresado)
- Generación asíncrona de reportes PDF con cola de trabajos
- Sistema de notificaciones internas
- Control de acceso basado en roles (RBAC)

---

## 🛠 Tecnologías

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | NestJS 10, TypeScript, tRPC |
| **ORM / DB** | Prisma ORM + PostgreSQL 15 |
| **Cola de trabajos** | Bull + Redis 7 |
| **PDF** | Puppeteer (Chromium headless) |
| **Autenticación** | JWT + Passport.js |
| **Gráficas** | Recharts |
| **Contenedores** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🏗 Arquitectura

```
egresados-system/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modelo de datos
│   │   │   └── seed.ts         # Datos iniciales
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # Autenticación JWT
│   │       │   ├── egresados/  # CRUD egresados
│   │       │   ├── empresas/   # CRUD empresas
│   │       │   ├── ofertas/    # Ofertas laborales
│   │       │   ├── postulaciones/
│   │       │   ├── estadisticas/ # Dashboards
│   │       │   ├── reportes/   # PDF + Bull queue
│   │       │   └── notificaciones/
│   │       └── trpc/           # Router tRPC
│   └── web/                    # Frontend Next.js
│       ├── app/
│       │   ├── auth/           # Login / Register
│       │   └── dashboard/      # Páginas por rol
│       ├── components/
│       │   └── dashboard/      # AdminDashboard, etc.
│       └── lib/
│           ├── api.ts          # Cliente HTTP Axios
│           └── auth-store.ts   # Zustand auth state
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

---

## ✅ Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** + **Docker Compose** (para ejecución en contenedores)
- **PostgreSQL** 15 (solo para ejecución local sin Docker)
- **Redis** 7 (solo para ejecución local sin Docker)

---

## 🚀 Instalación Local (sin Docker)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/egresados-system.git
cd egresados-system
```

### 2. Configurar variables de entorno del backend

```bash
cd apps/api
cp .env.example .env
# Edita .env con tus credenciales locales de PostgreSQL y Redis
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/egresados_system?schema=public"
PORT=3001
JWT_SECRET="mi_secreto_local"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Configurar variables del frontend

```bash
cd apps/web
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Instalar dependencias

```bash
# Desde la raíz del proyecto
cd apps/api && npm install
cd ../web && npm install
```

### 5. Migrar y sembrar la base de datos

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Ejecutar el proyecto

```bash
# Terminal 1 — Backend
cd apps/api && npm run start:dev

# Terminal 2 — Frontend
cd apps/web && npm run dev
```

Accede a `http://localhost:3000`

---

## 🐳 Ejecución con Docker

### Levantar todo el stack

```bash
docker compose up --build
```

Servicios que se levantan:
| Servicio | Puerto |
|----------|--------|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS) | http://localhost:3001 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Ejecutar migraciones y seed (primera vez)

```bash
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npx prisma db seed
```

### Reiniciar desde cero

```bash
docker compose down -v          # Elimina contenedores y volúmenes
docker compose up --build       # Reconstruye todo
docker compose exec api npx prisma migrate dev --name init
docker compose exec api npx prisma db seed
```

### Ver logs

```bash
docker compose logs -f api      # Logs del backend
docker compose logs -f web      # Logs del frontend
docker compose logs -f db       # Logs de PostgreSQL
```

---

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 🛡 Administrador | `admin@demo.edu.pe` | `Admin123*` |
| 🏢 Empresa | `empresa@demo.pe` | `Empresa123*` |
| 🎓 Egresado | `egresado@demo.pe` | `Egresado123*` |

> Los datos de prueba incluyen: 8 egresados, 3 empresas, 7 ofertas laborales, 12 postulaciones con historial de estados, y 15 habilidades catalogadas.

---

## 📦 Módulos del Sistema

### Módulos Operacionales

| Módulo | Descripción | Roles |
|--------|-------------|-------|
| **Autenticación** | Login, registro y JWT | Todos |
| **Egresados** | Perfil, habilidades, CV | Admin, Egresado |
| **Empresas** | Perfil, sector, logo | Admin, Empresa |
| **Ofertas Laborales** | CRUD, filtros, modalidad | Admin, Empresa, Egresado |
| **Postulaciones** | Postular, cambiar estado, historial | Todos |
| **Notificaciones** | Internas en sistema | Todos |
| **Habilidades** | Catálogo técnicas/blandas | Admin |

### Módulos de Gestión y Analítica

| Módulo | Descripción |
|--------|-------------|
| **Dashboard Admin** | KPIs, gráficas interactivas, evolución mensual |
| **Dashboard Egresado** | Estadísticas personales, ofertas recomendadas |
| **Dashboard Empresa** | Rendimiento de ofertas, tasa de conversión |
| **Reportes PDF** | Generación asíncrona via Bull + Puppeteer |

### Tipos de Reportes

| Tipo | Categoría |
|------|-----------|
| Egresados por Carrera | Operacional |
| Ofertas Activas | Operacional |
| Reporte de Postulaciones | Operacional |
| Empleabilidad por Carrera | Gestión |
| Demanda Laboral | Gestión |
| Comparativo por Cohortes | Gestión |

---

## 🔌 Endpoints Principales

```
POST   /api/auth/login                    Iniciar sesión
POST   /api/auth/register/egresado        Registrar egresado
POST   /api/auth/register/empresa         Registrar empresa
GET    /api/auth/me                       Perfil del usuario autenticado

GET    /api/egresados                     Listar egresados (ADMIN, EMPRESA)
GET    /api/egresados/me                  Mi perfil (EGRESADO)
PUT    /api/egresados/:id                 Actualizar perfil

GET    /api/ofertas                       Listar ofertas (todos)
POST   /api/ofertas                       Crear oferta (EMPRESA)
PUT    /api/ofertas/:id                   Editar oferta
DELETE /api/ofertas/:id                   Eliminar oferta

POST   /api/postulaciones                 Postularse a oferta (EGRESADO)
GET    /api/postulaciones/mis-postulaciones  Mis postulaciones
PUT    /api/postulaciones/:id/estado      Cambiar estado (EMPRESA)

GET    /api/estadisticas/admin            Dashboard administrador
GET    /api/estadisticas/egresado         Dashboard egresado
GET    /api/estadisticas/empresa          Dashboard empresa

POST   /api/reportes                      Solicitar reporte PDF
GET    /api/reportes/:id/estado           Estado del reporte
GET    /api/reportes/descargar/:file      Descargar PDF

GET    /api/notificaciones                Mis notificaciones
PUT    /api/notificaciones/:id/leer       Marcar como leída
GET    /api/habilidades                   Catálogo de habilidades
```

---

## 📤 Subir a GitHub

```bash
# 1. Inicializar repositorio
git init
git add .
git commit -m "feat: proyecto inicial sistema egresados"

# 2. Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/egresados-system.git
git branch -M main
git push -u origin main
```

**Archivos que SÍ se suben:**
- `package.json`, `package-lock.json`
- `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`
- `Dockerfile`, `docker-compose.yml`
- `.env.example`
- `README.md`
- `src/`, `app/`, `components/`
- `.github/workflows/`

**Archivos que NO se suben (en .gitignore):**
- `.env` (contiene credenciales reales)
- `node_modules/`
- `dist/`, `.next/`
- `uploads/` (archivos generados)

---

## ⚠️ Errores Frecuentes

| Error | Solución |
|-------|----------|
| `Connection refused` en PostgreSQL | Asegúrate que el contenedor `db` esté corriendo: `docker compose ps` |
| `Prisma Client not generated` | Ejecutar `npx prisma generate` |
| `JWT Secret undefined` | Verificar que `.env` tenga `JWT_SECRET` configurado |
| `Redis connection failed` | Verificar que Redis esté corriendo en puerto 6379 |
| `Puppeteer error` en Docker | El Dockerfile ya incluye Chromium para Alpine; verificar variables de entorno `PUPPETEER_*` |
| Puerto 3000/3001 en uso | Cambiar en `docker-compose.yml` o detener el proceso: `lsof -ti:3001 | xargs kill` |

---

## 🔧 Comandos Útiles de Prisma

```bash
# Generar cliente después de cambiar el schema
npx prisma generate

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡elimina todos los datos!)
npx prisma migrate reset

# Abrir Prisma Studio (GUI de la base de datos)
npx prisma studio

# Ejecutar seed manualmente
npx prisma db seed
```

---

## 📊 Decisiones Técnicas

- **NestJS** para el backend: módulos, inyección de dependencias y decoradores facilitan escalar el proyecto por equipos.
- **tRPC** como capa de API: type-safety de extremo a extremo entre Next.js y NestJS sin generar código adicional.
- **Bull + Redis** para reportes: la generación de PDF con Puppeteer puede tomar varios segundos; procesarla en background mejora la experiencia.
- **Puppeteer con Chromium** en Alpine: configurado con `--no-sandbox` para entornos Docker.
- **Zustand** para estado de auth: alternativa lightweight a Redux, con `persist` para mantener sesión en localStorage.
- **Recharts** para gráficas: librería React-native, responsive y altamente personalizable sin dependencias adicionales.

---

*Sistema desarrollado como proyecto académico — Sistema Web de Egresados y Oferta Laboral*
