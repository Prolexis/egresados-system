import { Controller, Get, Post, Body, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private reportesService: ReportesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  solicitarReporte(@Body() body: { tipo: string; parametros: any }, @CurrentUser() user: any) {
    return this.reportesService.solicitarReporte(user.sub, body.tipo, body.parametros);
  }

  @Get('mis-reportes')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  getMisReportes(@CurrentUser() user: any) {
    return this.reportesService.getMisReportes(user.sub);
  }

  @Get(':id/estado')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  getEstado(@Param('id') id: string) {
    return this.reportesService.getEstado(id);
  }

  @Get('descargar/:filename')
  async descargar(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = path.join(process.cwd(), 'uploads', 'reportes', filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    fs.createReadStream(filepath).pipe(res);
  }
}
