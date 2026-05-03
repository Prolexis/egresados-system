// ─── reportes.processor.ts ────────────────────────────────────────────────────
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('reports')
export class ReportesProcessor {
  private readonly logger = new Logger(ReportesProcessor.name);

  constructor(
    private reportesService: ReportesService,
    private prisma: PrismaService,
  ) {}

  @Process('generate-pdf')
  async handleGeneratePdf(job: Job<{ reporteId: string; tipo: string; parametros: any }>) {
    const { reporteId, tipo, parametros } = job.data;
    this.logger.log(`Procesando reporte ${reporteId} tipo ${tipo}`);

    try {
      const url = await this.reportesService.generarYGuardar(reporteId, tipo, parametros);
      this.logger.log(`Reporte ${reporteId} completado: ${url}`);
      return { success: true, url };
    } catch (error) {
      this.logger.error(`Error en reporte ${reporteId}:`, error);
      await this.prisma.reporte.update({
        where: { id: reporteId },
        data: { estado: 'FALLIDO' },
      });
      throw error;
    }
  }
}
