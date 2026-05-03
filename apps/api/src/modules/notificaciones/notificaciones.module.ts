import { Module, Injectable, Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async getMisNotificaciones(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async marcarLeida(id: string, usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida: true },
    });
  }

  async marcarTodasLeidas(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });
  }

  async crear(usuarioId: string, tipo: string, titulo: string, contenido: string, metadata?: any) {
    return this.prisma.notificacion.create({
      data: { usuarioId, tipo, titulo, contenido, metadata },
    });
  }

  async getNoLeidas(usuarioId: string) {
    return this.prisma.notificacion.count({ where: { usuarioId, leida: false } });
  }
}

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  getMis(@CurrentUser() user: any) { return this.notificacionesService.getMisNotificaciones(user.sub); }

  @Get('no-leidas')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  getNoLeidas(@CurrentUser() user: any) { return this.notificacionesService.getNoLeidas(user.sub); }

  @Put(':id/leer')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  marcarLeida(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificacionesService.marcarLeida(id, user.sub);
  }

  @Put('marcar-todas')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  marcarTodas(@CurrentUser() user: any) {
    return this.notificacionesService.marcarTodasLeidas(user.sub);
  }
}

@Module({ providers: [NotificacionesService], controllers: [NotificacionesController], exports: [NotificacionesService] })
export class NotificacionesModule {}
