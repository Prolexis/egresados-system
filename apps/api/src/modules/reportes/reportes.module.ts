// ─── reportes.module.ts ───────────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PdfGeneratorService } from './pdf-generator.service';
import { ReportesProcessor } from './reportes.processor';
export { ReportesService };
@Module({
  imports: [BullModule.registerQueue({ name: 'reports' })],
  providers: [ReportesService, PdfGeneratorService, ReportesProcessor],
  controllers: [ReportesController],
  exports: [ReportesService],
})
export class ReportesModule {}
