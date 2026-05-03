// ─── egresados.module.ts ──────────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { EgresadosService } from './egresados.service';
import { EgresadosController } from './egresados.controller';

export { EgresadosService };

@Module({
  providers: [EgresadosService],
  controllers: [EgresadosController],
  exports: [EgresadosService],
})
export class EgresadosModule {}
