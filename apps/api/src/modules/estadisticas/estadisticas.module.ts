// ─── estadisticas.module.ts ───────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';
export { EstadisticasService };
@Module({ providers: [EstadisticasService], controllers: [EstadisticasController], exports: [EstadisticasService] })
export class EstadisticasModule {}
