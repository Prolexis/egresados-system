-- ===========================================
-- EGRESADOS-SYSTEM: Script SQL completo para PostgreSQL
-- ===========================================

-- Eliminar tablas existentes (para reinicio)
DROP TABLE IF EXISTS metricas_agregadas CASCADE;
DROP TABLE IF EXISTS auditoria_logs CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS historial_estados_postulacion CASCADE;
DROP TABLE IF EXISTS postulaciones CASCADE;
DROP TABLE IF EXISTS ofertas_habilidades CASCADE;
DROP TABLE IF EXISTS ofertas_laborales CASCADE;
DROP TABLE IF EXISTS egresados_habilidades CASCADE;
DROP TABLE IF EXISTS habilidades CASCADE;
DROP TABLE IF EXISTS administradores CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;
DROP TABLE IF EXISTS egresados CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar tipos enum existentes
DROP TYPE IF EXISTS "UserRole";
DROP TYPE IF EXISTS "Modalidad";
DROP TYPE IF EXISTS "TipoContrato";
DROP TYPE IF EXISTS "EstadoOferta";
DROP TYPE IF EXISTS "EstadoPostulacion";
DROP TYPE IF EXISTS "TipoHabilidad";
DROP TYPE IF EXISTS "NivelHabilidad";
DROP TYPE IF EXISTS "EstadoReporte";

-- ===========================================
-- 1. TIPOS DE DATOS ENUM
-- ===========================================
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EGRESADO', 'EMPRESA');
CREATE TYPE "Modalidad" AS ENUM ('REMOTO', 'HIBRIDO', 'PRESENCIAL');
CREATE TYPE "TipoContrato" AS ENUM ('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'POR_PROYECTO', 'PRACTICAS');
CREATE TYPE "EstadoOferta" AS ENUM ('ACTIVA', 'CERRADA', 'EN_REVISION');
CREATE TYPE "EstadoPostulacion" AS ENUM ('POSTULADO', 'EN_REVISION', 'ENTREVISTA', 'CONTRATADO', 'RECHAZADO');
CREATE TYPE "TipoHabilidad" AS ENUM ('TECNICA', 'BLANDA');
CREATE TYPE "NivelHabilidad" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO');
CREATE TYPE "EstadoReporte" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'FALLIDO');

-- ===========================================
-- 2. TABLA PRINCIPAL: USUARIOS
-- ===========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role "UserRole" NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP(3)
);

-- ===========================================
-- 3. TABLA: EGRESADOS
-- ===========================================
CREATE TABLE egresados (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  fecha_nacimiento TIMESTAMP(3),
  telefono VARCHAR(20),
  direccion TEXT,
  carrera VARCHAR(255),
  anio_egreso INTEGER,
  cv_url VARCHAR(500),
  formacion_academica JSONB DEFAULT '[]'::jsonb,
  experiencia_laboral JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 4. TABLA: EMPRESAS
-- ===========================================
CREATE TABLE empresas (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nombre_comercial VARCHAR(255) NOT NULL,
  razon_social VARCHAR(255) NOT NULL,
  ruc VARCHAR(20) NOT NULL UNIQUE,
  sector VARCHAR(255),
  sitio_web VARCHAR(500),
  descripcion TEXT,
  logo_url VARCHAR(500),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 5. TABLA: ADMINISTRADORES
-- ===========================================
CREATE TABLE administradores (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  nombre_completo VARCHAR(255) NOT NULL,
  area VARCHAR(255)
);

-- ===========================================
-- 6. TABLA: HABILIDADES
-- ===========================================
CREATE TABLE habilidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  tipo "TipoHabilidad",
  categoria VARCHAR(255)
);

-- ===========================================
-- 7. TABLA: HABILIDADES DE EGRESADOS
-- ===========================================
CREATE TABLE egresados_habilidades (
  egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
  habilidad_id UUID NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
  nivel "NivelHabilidad",
  
  PRIMARY KEY (egresado_id, habilidad_id)
);

-- ===========================================
-- 8. TABLA: OFERTAS LABORALES
-- ===========================================
CREATE TABLE ofertas_laborales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion VARCHAR(255),
  modalidad "Modalidad",
  tipo_contrato "TipoContrato",
  salario_min DECIMAL(10, 2),
  salario_max DECIMAL(10, 2),
  fecha_publicacion TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP(3),
  estado "EstadoOferta" NOT NULL DEFAULT 'ACTIVA',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 9. TABLA: HABILIDADES DE OFERTAS
-- ===========================================
CREATE TABLE ofertas_habilidades (
  oferta_id UUID NOT NULL REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
  habilidad_id UUID NOT NULL REFERENCES habilidades(id) ON DELETE CASCADE,
  requerido BOOLEAN NOT NULL DEFAULT true,
  
  PRIMARY KEY (oferta_id, habilidad_id)
);

-- ===========================================
-- 10. TABLA: POSTULACIONES
-- ===========================================
CREATE TABLE postulaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID NOT NULL REFERENCES ofertas_laborales(id) ON DELETE CASCADE,
  egresado_id UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
  estado "EstadoPostulacion" NOT NULL DEFAULT 'POSTULADO',
  comentario TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (oferta_id, egresado_id)
);

-- ===========================================
-- 11. TABLA: HISTORIAL DE ESTADOS DE POSTULACIONES
-- ===========================================
CREATE TABLE historial_estados_postulacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  postulacion_id UUID NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  estado_anterior VARCHAR(100),
  estado_nuevo VARCHAR(100) NOT NULL,
  motivo TEXT,
  usuario_cambio_id UUID REFERENCES users(id),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 12. TABLA: NOTIFICACIONES
-- ===========================================
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 13. TABLA: REPORTES
-- ===========================================
CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  url_archivo VARCHAR(500),
  parametros JSONB,
  estado "EstadoReporte" NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP(3)
);

-- ===========================================
-- 14. TABLA: AUDITORÍA DE LOGS
-- ===========================================
CREATE TABLE auditoria_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id),
  accion VARCHAR(255) NOT NULL,
  entidad VARCHAR(255) NOT NULL,
  datos_previos JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- 15. TABLA: MÉTRICAS AGREGADAS
-- ===========================================
CREATE TABLE metricas_agregadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha TIMESTAMP(3) NOT NULL,
  tipo_metrica VARCHAR(100) NOT NULL,
  valores JSONB NOT NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE (fecha, tipo_metrica)
);

-- ===========================================
-- 16. ÍNDICES PARA OPTIMIZACIÓN
-- ===========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_egresados_dni ON egresados(dni);
CREATE INDEX idx_egresados_carrera ON egresados(carrera);
CREATE INDEX idx_empresas_ruc ON empresas(ruc);
CREATE INDEX idx_empresas_sector ON empresas(sector);
CREATE INDEX idx_habilidades_nombre ON habilidades(nombre);
CREATE INDEX idx_habilidades_tipo ON habilidades(tipo);
CREATE INDEX idx_ofertas_empresa ON ofertas_laborales(empresa_id);
CREATE INDEX idx_ofertas_estado ON ofertas_laborales(estado);
CREATE INDEX idx_ofertas_fecha_publicacion ON ofertas_laborales(fecha_publicacion);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(oferta_id);
CREATE INDEX idx_postulaciones_egresado ON postulaciones(egresado_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_historial_postulacion ON historial_estados_postulacion(postulacion_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_reportes_usuario ON reportes(usuario_id);
CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_auditoria_usuario ON auditoria_logs(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_logs(created_at);
CREATE INDEX idx_metricas_fecha_tipo ON metricas_agregadas(fecha, tipo_metrica);

-- ===========================================
-- 17. TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ofertas_updated_at BEFORE UPDATE ON ofertas_laborales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_postulaciones_updated_at BEFORE UPDATE ON postulaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metricas_updated_at BEFORE UPDATE ON metricas_agregadas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- FIN DEL SCRIPT
-- ===========================================
