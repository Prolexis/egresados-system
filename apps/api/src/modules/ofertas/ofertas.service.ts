import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EstadoOferta,
  Modalidad,
  TipoContrato,
  UserRole,
} from '@prisma/client';

@Injectable()
export class OfertasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(empresaId: string, data: any) {
    /*
      IMPORTANTE:
      Separamos "requisitos" porque tu tabla ofertas_laborales NO tiene esa columna.
      Si el frontend lo envía, Prisma revienta con:
      Unknown argument `requisitos`.
    */
    const {
      habilidades,
      requisitos,
      empresa,
      postulaciones,
      _count,
      id,
      createdAt,
      updatedAt,
      fechaPublicacion,
      ...ofertaData
    } = data;

    return this.prisma.ofertaLaboral.create({
      data: {
        ...ofertaData,
        empresaId,
        habilidades: Array.isArray(habilidades) && habilidades.length > 0
          ? {
              create: habilidades.map((h: any) => ({
                habilidadId: h.id || h.habilidadId,
                requerido: h.requerido ?? true,
              })),
            }
          : undefined,
      },
      include: {
        empresa: true,
        habilidades: {
          include: {
            habilidad: true,
          },
        },
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
    });
  }

  async findAll(filters: {
    estado?: EstadoOferta;
    modalidad?: Modalidad;
    tipoContrato?: TipoContrato;
    empresaId?: string;
    search?: string;
    salarioMin?: number;
    salarioMax?: number;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.modalidad) {
      where.modalidad = filters.modalidad;
    }

    if (filters.tipoContrato) {
      where.tipoContrato = filters.tipoContrato;
    }

    if (filters.empresaId) {
      where.empresaId = filters.empresaId;
    }

    if (filters.search) {
      where.OR = [
        {
          titulo: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          descripcion: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          ubicacion: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (filters.salarioMin !== undefined && !Number.isNaN(filters.salarioMin)) {
      where.salarioMin = {
        gte: filters.salarioMin,
      };
    }

    if (filters.salarioMax !== undefined && !Number.isNaN(filters.salarioMax)) {
      where.salarioMax = {
        lte: filters.salarioMax,
      };
    }

    const skip = filters.skip ?? 0;
    const take = filters.take ?? 10;

    const [ofertas, total] = await Promise.all([
      this.prisma.ofertaLaboral.findMany({
        where,
        include: {
          empresa: {
            select: {
              id: true,
              nombreComercial: true,
              razonSocial: true,
              sector: true,
              logoUrl: true,
            },
          },
          habilidades: {
            include: {
              habilidad: true,
            },
          },
          _count: {
            select: {
              postulaciones: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.ofertaLaboral.count({
        where,
      }),
    ]);

    return {
      ofertas,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const oferta = await this.prisma.ofertaLaboral.findUnique({
      where: {
        id,
      },
      include: {
        empresa: true,
        habilidades: {
          include: {
            habilidad: true,
          },
        },
        postulaciones: {
          include: {
            egresado: {
              include: {
                habilidades: {
                  include: {
                    habilidad: true,
                  },
                },
              },
            },
            historial: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
    });

    if (!oferta) {
      throw new NotFoundException(`Oferta con ID ${id} no encontrada`);
    }

    return oferta;
  }

  async update(id: string, data: any, currentUser: any) {
    const oferta = await this.findOne(id);

    if (currentUser.role !== UserRole.ADMIN && oferta.empresaId !== currentUser.sub) {
      throw new ForbiddenException('Sin permisos para modificar esta oferta');
    }

    /*
      Separamos campos que Prisma no debe recibir directamente.
      "requisitos" se ignora porque no existe en la tabla.
    */
    const {
      habilidades,
      requisitos,
      empresa,
      postulaciones,
      _count,
      id: bodyId,
      empresaId,
      createdAt,
      updatedAt,
      fechaPublicacion,
      ...ofertaData
    } = data;

    // Si llegan habilidades, reemplazamos las anteriores por las nuevas.
    if (Array.isArray(habilidades)) {
      await this.prisma.ofertaHabilidad.deleteMany({
        where: {
          ofertaId: id,
        },
      });

      if (habilidades.length > 0) {
        await this.prisma.ofertaHabilidad.createMany({
          data: habilidades.map((h: any) => ({
            ofertaId: id,
            habilidadId: h.id || h.habilidadId,
            requerido: h.requerido ?? true,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.ofertaLaboral.update({
      where: {
        id,
      },
      data: ofertaData,
      include: {
        empresa: true,
        habilidades: {
          include: {
            habilidad: true,
          },
        },
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
    });
  }

  async delete(id: string, currentUser: any) {
    const oferta = await this.findOne(id);

    if (currentUser.role !== UserRole.ADMIN && oferta.empresaId !== currentUser.sub) {
      throw new ForbiddenException('Sin permisos para eliminar esta oferta');
    }

    return this.prisma.ofertaLaboral.delete({
      where: {
        id,
      },
    });
  }

  async getMisOfertas(empresaId: string) {
    return this.prisma.ofertaLaboral.findMany({
      where: {
        empresaId,
      },
      include: {
        habilidades: {
          include: {
            habilidad: true,
          },
        },
        postulaciones: {
          select: {
            id: true,
            estado: true,
            createdAt: true,
            egresado: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                carrera: true,
                anioEgreso: true,
              },
            },
          },
        },
        _count: {
          select: {
            postulaciones: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}