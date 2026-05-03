import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  findAll(@CurrentUser() user: any) {
    return this.notificacionesService.findAll(user.sub);
  }

  @Get('no-leidas')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  findNoLeidas(@CurrentUser() user: any) {
    return this.notificacionesService.findNoLeidas(user.sub);
  }

  @Put(':id/leer')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  marcarLeida(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificacionesService.marcarLeida(id, user.sub);
  }

  @Put('marcar-todas')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  marcarTodas(@CurrentUser() user: any) {
    return this.notificacionesService.marcarTodas(user.sub);
  }
}
