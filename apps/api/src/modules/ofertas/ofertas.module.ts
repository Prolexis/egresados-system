// ─── ofertas.module.ts ────────────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { OfertasController } from './ofertas.controller';

export { OfertasService };

@Module({
  providers: [OfertasService],
  controllers: [OfertasController],
  exports: [OfertasService],
})
export class OfertasModule {}
