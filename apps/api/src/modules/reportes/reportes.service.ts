import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfGeneratorService } from './pdf-generator.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportesService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads', 'reportes');

  constructor(
    private prisma: PrismaService,
    @InjectQueue('reports') private reportQueue: Queue,
    private pdfGenerator: PdfGeneratorService,
  ) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async solicitarReporte(usuarioId: string, tipo: string, parametros: any) {
    const reporte = await this.prisma.reporte.create({
      data: {
        usuarioId,
        tipo,
        nombreArchivo: `${tipo}_${Date.now()}.pdf`,
        parametros,
        estado: 'PENDIENTE',
      },
    });

    await this.reportQueue.add('generate-pdf', { reporteId: reporte.id, tipo, parametros });
    return reporte;
  }

  async getEstado(reporteId: string) {
    const reporte = await this.prisma.reporte.findUnique({ where: { id: reporteId } });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    return reporte;
  }

  async getMisReportes(usuarioId: string) {
    return this.prisma.reporte.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async generarYGuardar(reporteId: string, tipo: string, parametros: any): Promise<string> {
    await this.prisma.reporte.update({ where: { id: reporteId }, data: { estado: 'PROCESANDO' } });

    let html: string;
    switch (tipo) {
      case 'empleabilidad': html = await this.buildEmpleabilidadHtml(parametros); break;
      case 'egresados_carrera': html = await this.buildEgresadosPorCarreraHtml(parametros); break;
      case 'ofertas_activas': html = await this.buildOfertasActivasHtml(parametros); break;
      case 'postulaciones_oferta': html = await this.buildPostulacionesHtml(parametros); break;
      case 'demanda_laboral': html = await this.buildDemandaLaboralHtml(parametros); break;
      case 'comparativo_cohortes': html = await this.buildComparativoCohorteHtml(parametros); break;
      default: throw new Error(`Tipo de reporte no soportado: ${tipo}`);
    }

    const buffer = await this.pdfGenerator.generateFromHtml(html);
    const filename = `${tipo}_${reporteId}.pdf`;
    const filepath = path.join(this.uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    const url = `/api/reportes/descargar/${filename}`;

    await this.prisma.reporte.update({
      where: { id: reporteId },
      data: { estado: 'COMPLETADO', urlArchivo: url, completedAt: new Date() },
    });
    return url;
  }

  private async buildEmpleabilidadHtml(params: any): Promise<string> {
    const where: any = {};
    if (params.anioEgreso) where.anioEgreso = parseInt(params.anioEgreso);

    const egresados = await this.prisma.egresado.findMany({
      where,
      include: {
        user: { select: { email: true } },
        postulaciones: { where: { estado: 'CONTRATADO' } },
      },
    });

    const total = egresados.length;
    const empleados = egresados.filter((e) => e.postulaciones.length > 0).length;
    const tasa = total > 0 ? ((empleados / total) * 100).toFixed(1) : '0.0';

    const porCarrera = egresados.reduce((acc: any, e) => {
      const k = e.carrera || 'Sin carrera';
      if (!acc[k]) acc[k] = { total: 0, empleados: 0 };
      acc[k].total++;
      if (e.postulaciones.length > 0) acc[k].empleados++;
      return acc;
    }, {});

    const content = `
      <div class="kpis">
        <div class="kpi-card"><div class="kpi-value">${total}</div><div class="kpi-label">Total Egresados</div></div>
        <div class="kpi-card"><div class="kpi-value">${empleados}</div><div class="kpi-label">Empleados</div></div>
        <div class="kpi-card"><div class="kpi-value">${tasa}%</div><div class="kpi-label">Tasa Empleabilidad</div></div>
        <div class="kpi-card"><div class="kpi-value">${total - empleados}</div><div class="kpi-label">En Búsqueda</div></div>
      </div>
      <div class="section-title">Por Carrera</div>
      <table>
        <thead><tr><th>Carrera</th><th>Total</th><th>Empleados</th><th>En Búsqueda</th><th>Tasa</th></tr></thead>
        <tbody>
          ${Object.entries(porCarrera).map(([carrera, d]: [string, any]) => `
            <tr>
              <td>${carrera}</td><td>${d.total}</td><td>${d.empleados}</td>
              <td>${d.total - d.empleados}</td>
              <td>${d.total > 0 ? ((d.empleados / d.total) * 100).toFixed(1) : 0}%</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div class="section-title">Detalle de Egresados</div>
      <table>
        <thead><tr><th>Nombre</th><th>Carrera</th><th>Año Egreso</th><th>Email</th><th>Estado</th></tr></thead>
        <tbody>
          ${egresados.slice(0, 50).map((e) => `
            <tr>
              <td>${e.nombre} ${e.apellido}</td>
              <td>${e.carrera || '-'}</td>
              <td>${e.anioEgreso || '-'}</td>
              <td>${e.user.email}</td>
              <td><span class="badge badge-${e.postulaciones.length > 0 ? 'contratado' : 'postulado'}">${e.postulaciones.length > 0 ? 'Empleado' : 'En búsqueda'}</span></td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Reporte de Empleabilidad', content, params);
  }

  private async buildEgresadosPorCarreraHtml(params: any): Promise<string> {
    const egresados = await this.prisma.egresado.findMany({
      where: params.carrera && params.carrera !== 'todas' ? { carrera: params.carrera } : {},
      include: {
        user: { select: { email: true } },
        habilidades: { include: { habilidad: true } },
      },
      orderBy: [{ carrera: 'asc' }, { apellido: 'asc' }],
    });

    const content = `
      <div class="kpis">
        <div class="kpi-card"><div class="kpi-value">${egresados.length}</div><div class="kpi-label">Total Registros</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Nombre Completo</th><th>Carrera</th><th>Año Egreso</th><th>DNI</th><th>Teléfono</th><th>Email</th></tr></thead>
        <tbody>
          ${egresados.map((e, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${e.nombre} ${e.apellido}</td>
              <td>${e.carrera || '-'}</td>
              <td>${e.anioEgreso || '-'}</td>
              <td>${e.dni}</td>
              <td>${e.telefono || '-'}</td>
              <td>${e.user.email}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Listado de Egresados por Carrera', content, params);
  }

  private async buildOfertasActivasHtml(params: any): Promise<string> {
    const ofertas = await this.prisma.ofertaLaboral.findMany({
      where: { estado: 'ACTIVA' },
      include: {
        empresa: { select: { nombreComercial: true, sector: true } },
        habilidades: { include: { habilidad: true } },
        _count: { select: { postulaciones: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const content = `
      <div class="kpis">
        <div class="kpi-card"><div class="kpi-value">${ofertas.length}</div><div class="kpi-label">Ofertas Activas</div></div>
      </div>
      <table>
        <thead><tr><th>Título</th><th>Empresa</th><th>Sector</th><th>Modalidad</th><th>Contrato</th><th>Salario</th><th>Postulantes</th></tr></thead>
        <tbody>
          ${ofertas.map((o) => `
            <tr>
              <td>${o.titulo}</td>
              <td>${o.empresa.nombreComercial}</td>
              <td>${o.empresa.sector || '-'}</td>
              <td>${o.modalidad || '-'}</td>
              <td>${o.tipoContrato || '-'}</td>
              <td>${o.salarioMin ? `S/ ${o.salarioMin} - ${o.salarioMax}` : 'A convenir'}</td>
              <td>${o._count.postulaciones}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Ofertas Laborales Activas', content, params);
  }

  private async buildPostulacionesHtml(params: any): Promise<string> {
    const postulaciones = await this.prisma.postulacion.findMany({
      include: {
        oferta: { include: { empresa: true } },
        egresado: { include: { user: { select: { email: true } } } },
        historial: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const content = `
      <div class="kpis">
        <div class="kpi-card"><div class="kpi-value">${postulaciones.length}</div><div class="kpi-label">Total Postulaciones</div></div>
        <div class="kpi-card"><div class="kpi-value">${postulaciones.filter(p => p.estado === 'CONTRATADO').length}</div><div class="kpi-label">Contratados</div></div>
      </div>
      <table>
        <thead><tr><th>Egresado</th><th>Oferta</th><th>Empresa</th><th>Estado</th><th>Fecha</th></tr></thead>
        <tbody>
          ${postulaciones.map((p) => `
            <tr>
              <td>${p.egresado.nombre} ${p.egresado.apellido}</td>
              <td>${p.oferta.titulo}</td>
              <td>${p.oferta.empresa.nombreComercial}</td>
              <td><span class="badge badge-${p.estado.toLowerCase()}">${p.estado}</span></td>
              <td>${new Date(p.createdAt).toLocaleDateString('es-PE')}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Reporte de Postulaciones', content, params);
  }

  private async buildDemandaLaboralHtml(params: any): Promise<string> {
    const habilidades = await this.prisma.ofertaHabilidad.groupBy({
      by: ['habilidadId'],
      _count: { ofertaId: true },
      orderBy: { _count: { ofertaId: 'desc' } },
      take: 20,
    });

    const habs = await this.prisma.habilidad.findMany({
      where: { id: { in: habilidades.map((h) => h.habilidadId) } },
    });

    const content = `
      <div class="section-title">Top Habilidades Más Demandadas</div>
      <table>
        <thead><tr><th>Ranking</th><th>Habilidad</th><th>Tipo</th><th>Ofertas que la Requieren</th></tr></thead>
        <tbody>
          ${habilidades.map((h, i) => {
            const hab = habs.find((hb) => hb.id === h.habilidadId);
            return `<tr>
              <td><strong>#${i + 1}</strong></td>
              <td>${hab?.nombre || '-'}</td>
              <td>${hab?.tipo || '-'}</td>
              <td>${h._count.ofertaId}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Reporte de Demanda Laboral', content, params);
  }

  private async buildComparativoCohorteHtml(params: any): Promise<string> {
    const cohortes = await this.prisma.$queryRaw<any[]>`
      SELECT e.anio_egreso as anio,
        COUNT(DISTINCT e.id) as total,
        COUNT(DISTINCT p.egresado_id) FILTER (WHERE p.estado = 'CONTRATADO') as contratados,
        COUNT(DISTINCT p.egresado_id) FILTER (WHERE p.estado = 'EN_REVISION') as en_revision
      FROM egresados e
      LEFT JOIN postulaciones p ON e.id = p.egresado_id
      WHERE e.anio_egreso IS NOT NULL
      GROUP BY e.anio_egreso ORDER BY e.anio_egreso DESC
    `;

    const content = `
      <table>
        <thead><tr><th>Cohorte</th><th>Total Egresados</th><th>Contratados</th><th>Tasa Empleo</th></tr></thead>
        <tbody>
          ${cohortes.map((c) => `
            <tr>
              <td><strong>${c.anio}</strong></td>
              <td>${Number(c.total)}</td>
              <td>${Number(c.contratados)}</td>
              <td>${Number(c.total) > 0 ? ((Number(c.contratados) / Number(c.total)) * 100).toFixed(1) : 0}%</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    return this.pdfGenerator.buildReportHtml('Comparativo por Cohortes', content, params);
  }
}
