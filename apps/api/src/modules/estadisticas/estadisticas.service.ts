import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard(filters?: { startDate?: string; endDate?: string }) {
    const [
      totalEgresados,
      totalEmpresas,
      ofertasActivas,
      totalPostulaciones,
      contrataciones,
      egresadosPorCarrera,
      ofertasPorMes,
      topHabilidades,
      contratacionesPorCohorte,
      distribucionEstados,
    ] = await Promise.all([
      this.prisma.egresado.count(),
      this.prisma.empresa.count(),
      this.prisma.ofertaLaboral.count({ where: { estado: 'ACTIVA' } }),
      this.prisma.postulacion.count(),
      this.prisma.postulacion.count({ where: { estado: 'CONTRATADO' } }),
      this.getEgresadosPorCarrera(),
      this.getOfertasPorMes(),
      this.getTopHabilidades(),
      this.getContratacionesPorCohorte(),
      this.getDistribucionEstados(),
    ]);

    const totalEgresadosConPostulacion = await this.prisma.postulacion.groupBy({
      by: ['egresadoId'],
      where: { estado: 'CONTRATADO' },
    });

    return {
      kpis: {
        totalEgresados,
        totalEmpresas,
        ofertasActivas,
        totalPostulaciones,
        tasaEmpleabilidad: totalEgresados > 0
          ? Math.round((totalEgresadosConPostulacion.length / totalEgresados) * 100)
          : 0,
      },
      graficas: {
        egresadosPorCarrera,
        ofertasPorMes,
        topHabilidades,
        contratacionesPorCohorte,
        distribucionEstados,
      },
    };
  }

  async getEgresadoDashboard(egresadoId: string) {
    const [stats, recomendaciones, historialPostulaciones] = await Promise.all([
      this.getStatsEgresado(egresadoId),
      this.getRecomendacionesParaEgresado(egresadoId),
      this.getHistorialPostulacionesEgresado(egresadoId),
    ]);
    return { stats, recomendaciones, historialPostulaciones };
  }

  async getEmpresaDashboard(empresaId: string) {
    const ofertas = await this.prisma.ofertaLaboral.findMany({
      where: { empresaId },
      include: { postulaciones: { select: { estado: true } } },
    });

    const totalOfertas = ofertas.length;
    const ofertasActivas = ofertas.filter((o) => o.estado === 'ACTIVA').length;
    const totalPostulaciones = ofertas.reduce((s, o) => s + o.postulaciones.length, 0);
    const contratados = ofertas.reduce((s, o) => s + o.postulaciones.filter((p) => p.estado === 'CONTRATADO').length, 0);

    const rendimientoOfertas = ofertas.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      estado: o.estado,
      postulaciones: o.postulaciones.length,
      contratados: o.postulaciones.filter((p) => p.estado === 'CONTRATADO').length,
      tasaConversion: o.postulaciones.length > 0
        ? Math.round((o.postulaciones.filter((p) => p.estado === 'CONTRATADO').length / o.postulaciones.length) * 100)
        : 0,
    }));

    return {
      kpis: { totalOfertas, ofertasActivas, totalPostulaciones, contratados },
      rendimientoOfertas,
    };
  }

  private async getEgresadosPorCarrera() {
    const result = await this.prisma.egresado.groupBy({
      by: ['carrera'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    return result
      .filter((r) => r.carrera)
      .map((r) => ({ name: r.carrera, value: r._count.id }));
  }

  private async getOfertasPorMes() {
    const meses = await this.prisma.$queryRaw<any[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "created_at"), 'Mon YYYY') as mes,
        DATE_TRUNC('month', "created_at") as fecha,
        COUNT(*) FILTER (WHERE true) as ofertas,
        0 as postulaciones
      FROM "ofertas_laborales"
      GROUP BY DATE_TRUNC('month', "created_at")
      ORDER BY fecha DESC
      LIMIT 12
    `;

    const postsPorMes = await this.prisma.$queryRaw<any[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "created_at"), 'Mon YYYY') as mes,
        COUNT(*) as postulaciones
      FROM "postulaciones"
      GROUP BY DATE_TRUNC('month', "created_at")
      ORDER BY DATE_TRUNC('month', "created_at") DESC
      LIMIT 12
    `;

    const postsMap = new Map(postsPorMes.map((p) => [p.mes, Number(p.postulaciones)]));
    return meses.reverse().map((m) => ({
      mes: m.mes,
      ofertas: Number(m.ofertas),
      postulaciones: postsMap.get(m.mes) || 0,
    }));
  }

  private async getTopHabilidades() {
    const result = await this.prisma.ofertaHabilidad.groupBy({
      by: ['habilidadId'],
      _count: { ofertaId: true },
      orderBy: { _count: { ofertaId: 'desc' } },
      take: 10,
    });

    const habilidades = await this.prisma.habilidad.findMany({
      where: { id: { in: result.map((r) => r.habilidadId) } },
    });

    return result.map((r) => {
      const hab = habilidades.find((h) => h.id === r.habilidadId);
      return { name: hab?.nombre || 'Desconocida', value: r._count.ofertaId };
    });
  }

  private async getContratacionesPorCohorte() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        e.anio_egreso as anio,
        COUNT(DISTINCT e.id) as total,
        COUNT(DISTINCT p.egresado_id) FILTER (WHERE p.estado = 'CONTRATADO') as contratados
      FROM egresados e
      LEFT JOIN postulaciones p ON e.id = p.egresado_id
      WHERE e.anio_egreso IS NOT NULL
      GROUP BY e.anio_egreso
      ORDER BY e.anio_egreso DESC
      LIMIT 8
    `;
    return result.map((r) => ({
      anio: String(r.anio),
      total: Number(r.total),
      contratados: Number(r.contratados),
      tasa: Number(r.total) > 0 ? Math.round((Number(r.contratados) / Number(r.total)) * 100) : 0,
    }));
  }

  private async getDistribucionEstados() {
    const result = await this.prisma.postulacion.groupBy({
      by: ['estado'],
      _count: { id: true },
    });
    return result.map((r) => ({ name: r.estado, value: r._count.id }));
  }

  private async getStatsEgresado(egresadoId: string) {
    const [total, enRevision, entrevistas, contratado, rechazado] = await Promise.all([
      this.prisma.postulacion.count({ where: { egresadoId } }),
      this.prisma.postulacion.count({ where: { egresadoId, estado: 'EN_REVISION' } }),
      this.prisma.postulacion.count({ where: { egresadoId, estado: 'ENTREVISTA' } }),
      this.prisma.postulacion.count({ where: { egresadoId, estado: 'CONTRATADO' } }),
      this.prisma.postulacion.count({ where: { egresadoId, estado: 'RECHAZADO' } }),
    ]);
    return { total, enRevision, entrevistas, contratado, rechazado };
  }

  private async getRecomendacionesParaEgresado(egresadoId: string) {
    const egresado = await this.prisma.egresado.findUnique({
      where: { id: egresadoId },
      include: { habilidades: true },
    });
    if (!egresado || !egresado.habilidades.length) return [];

    const habilidadesIds = egresado.habilidades.map((h) => h.habilidadId);
    return this.prisma.ofertaLaboral.findMany({
      where: {
        estado: 'ACTIVA',
        habilidades: { some: { habilidadId: { in: habilidadesIds } } },
        NOT: { postulaciones: { some: { egresadoId } } },
      },
      include: {
        empresa: { select: { nombreComercial: true, sector: true, logoUrl: true } },
        habilidades: { include: { habilidad: true } },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getHistorialPostulacionesEgresado(egresadoId: string) {
    const postulaciones = await this.prisma.postulacion.groupBy({
      by: ['estado'],
      where: { egresadoId },
      _count: { id: true },
    });
    return postulaciones.map((p) => ({ estado: p.estado, cantidad: p._count.id }));
  }
}
