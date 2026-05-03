import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNoLeidas(userId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId: userId, leida: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async marcarLeida(id: string, userId: string) {
    return this.prisma.notificacion.updateMany({
      where: { id, usuarioId: userId },
      data: { leida: true },
    });
  }

  async marcarTodas(userId: string) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId: userId, leida: false },
      data: { leida: true },
    });
  }
}
