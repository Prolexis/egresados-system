// ─────────────────────────────────────────────────────────────────────────────
// HABILIDADES MODULE
// ─────────────────────────────────────────────────────────────────────────────
// habilidades.module.ts
import { Module } from '@nestjs/common';

// Service
import { Injectable } from '@nestjs/common';
import { PrismaService as PS } from '../../prisma/prisma.service';

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable()
class HabilidadesService {
  constructor(private prisma: PS) {}
  findAll(tipo?: string) {
    return this.prisma.habilidad.findMany({
      where: tipo ? { tipo: tipo as any } : undefined,
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });
  }
  create(data: { nombre: string; tipo?: string; categoria?: string }) {
    return this.prisma.habilidad.create({ data: data as any });
  }
  delete(id: string) {
    return this.prisma.habilidad.delete({ where: { id } });
  }
}
export { HabilidadesService };

// ─── Controller ──────────────────────────────────────────────────────────────
import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('habilidades')
@UseGuards(JwtAuthGuard, RolesGuard)
class HabilidadesController {
  constructor(private habilidadesService: HabilidadesService) {}
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  findAll(@Query('tipo') tipo?: string) { return this.habilidadesService.findAll(tipo); }
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) { return this.habilidadesService.create(body); }
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) { return this.habilidadesService.delete(id); }
}

@Module({ providers: [HabilidadesService], controllers: [HabilidadesController], exports: [HabilidadesService] })
export class HabilidadesModule {}
