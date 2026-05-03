import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoPostulacion, UserRole } from '@prisma/client';

@Injectable()
export class PostulacionesService {
  constructor(private prisma: PrismaService) {}

  async postular(egresadoId: string, ofertaId: string, comentario?: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({ where: { id: ofertaId } });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    if (oferta.estado !== 'ACTIVA') throw new ConflictException('La oferta no está activa');

    const existing = await this.prisma.postulacion.findUnique({
      where: { ofertaId_egresadoId: { ofertaId, egresadoId } },
    });
    if (existing) throw new ConflictException('Ya te postulaste a esta oferta');

    const postulacion = await this.prisma.postulacion.create({
      data: {
        ofertaId,
        egresadoId,
        comentario,
        historial: {
          create: { estadoAnterior: null, estadoNuevo: 'POSTULADO', usuarioCambioId: egresadoId },
        },
      },
      include: {
        oferta: { include: { empresa: true } },
        egresado: true,
        historial: true,
      },
    });
    return postulacion;
  }

  async cambiarEstado(postulacionId: string, nuevoEstado: EstadoPostulacion, usuarioId: string, motivo?: string) {
    const postulacion = await this.prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: { oferta: true },
    });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');

    const updated = await this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: {
        estado: nuevoEstado,
        historial: {
          create: {
            estadoAnterior: postulacion.estado,
            estadoNuevo: nuevoEstado,
            motivo,
            usuarioCambioId: usuarioId,
          },
        },
      },
      include: {
        oferta: { include: { empresa: true } },
        egresado: { include: { user: true } },
        historial: { orderBy: { createdAt: 'desc' } },
      },
    });
    return updated;
  }

  async getMisPostulaciones(egresadoId: string) {
    return this.prisma.postulacion.findMany({
      where: { egresadoId },
      include: {
        oferta: {
          include: { empresa: { select: { nombreComercial: true, logoUrl: true, sector: true } } },
        },
        historial: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPostulacionesPorOferta(ofertaId: string, empresaId: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({ where: { id: ofertaId } });
    if (!oferta || oferta.empresaId !== empresaId) {
      throw new ForbiddenException('Sin acceso a esta oferta');
    }
    return this.prisma.postulacion.findMany({
      where: { ofertaId },
      include: {
        egresado: {
          include: {
            user: { select: { email: true } },
            habilidades: { include: { habilidad: true } },
          },
        },
        historial: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTodasPostulaciones(filters: { estado?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (filters.estado) where.estado = filters.estado;

    const [postulaciones, total] = await Promise.all([
      this.prisma.postulacion.findMany({
        where,
        include: {
          oferta: { include: { empresa: true } },
          egresado: { include: { user: { select: { email: true } } } },
          historial: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        skip: filters.skip || 0,
        take: filters.take || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.postulacion.count({ where }),
    ]);
    return { postulaciones, total };
  }
}
