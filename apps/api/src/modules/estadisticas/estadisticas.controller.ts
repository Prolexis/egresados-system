import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminDashboard(@Query() query: any) {
    return this.estadisticasService.getAdminDashboard({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('egresado')
  @Roles(UserRole.EGRESADO)
  getEgresadoDashboard(@CurrentUser() user: any) {
    return this.estadisticasService.getEgresadoDashboard(user.sub);
  }

  @Get('empresa')
  @Roles(UserRole.EMPRESA)
  getEmpresaDashboard(@CurrentUser() user: any) {
    return this.estadisticasService.getEmpresaDashboard(user.sub);
  }
}
