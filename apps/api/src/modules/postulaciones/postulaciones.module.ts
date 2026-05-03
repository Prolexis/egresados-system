// ─── postulaciones.module.ts ──────────────────────────────────────────────────
import { Module } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { PostulacionesController } from './postulaciones.controller';
export { PostulacionesService };
@Module({ providers: [PostulacionesService], controllers: [PostulacionesController], exports: [PostulacionesService] })
export class PostulacionesModule {}
