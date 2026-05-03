import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EgresadosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    const email = String(data.email || '').trim().toLowerCase();
    const dni = String(data.dni || '').trim();
    const passwordPlano = data.password || 'password';

    if (!email) {
      throw new BadRequestException('El correo es obligatorio');
    }

    if (!data.nombre || !data.apellido || !dni) {
      throw new BadRequestException('Nombre, apellido y DNI son obligatorios');
    }

    const existeEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existeEmail) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const existeDni = await this.prisma.egresado.findUnique({
      where: { dni },
    });

    if (existeDni) {
      throw new ConflictException('Ya existe un egresado con ese DNI');
    }

    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const creado = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.EGRESADO,
        },
      });

      await tx.egresado.create({
        data: {
          id: user.id,
          nombre: String(data.nombre).trim(),
          apellido: String(data.apellido).trim(),
          dni,
          fechaNacimiento: data.fechaNacimiento
            ? new Date(data.fechaNacimiento)
            : null,
          telefono: data.telefono ? String(data.telefono).trim() : null,
          direccion: data.direccion ? String(data.direccion).trim() : null,
          carrera: data.carrera ? String(data.carrera).trim() : null,
          anioEgreso: data.anioEgreso ? Number(data.anioEgreso) : null,
          cvUrl: data.cvUrl || null,
          formacionAcademica: data.formacionAcademica ?? [],
          experienciaLaboral: data.experienciaLaboral ?? [],
        },
      });

      return user;
    });

    return this.findOne(creado.id);
  }

  async findAll(filters: {
    carrera?: string;
    anioEgreso?: number;
    habilidades?: string[];
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters.carrera) {
      where.carrera = filters.carrera;
    }

    if (filters.anioEgreso) {
      where.anioEgreso = filters.anioEgreso;
    }

    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { apellido: { contains: filters.search, mode: 'insensitive' } },
        { carrera: { contains: filters.search, mode: 'insensitive' } },
        { dni: { contains: filters.search, mode: 'insensitive' } },
        {
          user: {
            email: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (filters.habilidades?.length) {
      where.habilidades = {
        some: {
          habilidadId: {
            in: filters.habilidades,
          },
        },
      };
    }

    const skip = filters.skip ?? 0;
    const take = filters.take ?? 12;

    const [egresados, total] = await Promise.all([
      this.prisma.egresado.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
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
      this.prisma.egresado.count({ where }),
    ]);

    return {
      egresados,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const egresado = await this.prisma.egresado.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
            lastLogin: true,
          },
        },
        habilidades: {
          include: {
            habilidad: true,
          },
        },
        postulaciones: {
          include: {
            oferta: {
              include: {
                empresa: true,
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

    if (!egresado) {
      throw new NotFoundException(`Egresado con ID ${id} no encontrado`);
    }

    return egresado;
  }

  async update(id: string, data: any, currentUser: any) {
    const egresado = await this.prisma.egresado.findUnique({
      where: { id },
    });

    if (!egresado) {
      throw new NotFoundException(`Egresado con ID ${id} no encontrado`);
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== id) {
      throw new ForbiddenException('Sin permisos para modificar este perfil');
    }

    const egresadoData: any = {};

    if (data.nombre !== undefined) {
      egresadoData.nombre = data.nombre ? String(data.nombre).trim() : null;
    }

    if (data.apellido !== undefined) {
      egresadoData.apellido = data.apellido ? String(data.apellido).trim() : null;
    }

    if (data.dni !== undefined) {
      const nuevoDni = String(data.dni).trim();

      const dniUsado = await this.prisma.egresado.findFirst({
        where: {
          dni: nuevoDni,
          id: {
            not: id,
          },
        },
      });

      if (dniUsado) {
        throw new ConflictException('Ya existe otro egresado con ese DNI');
      }

      egresadoData.dni = nuevoDni;
    }

    if (data.fechaNacimiento !== undefined) {
      egresadoData.fechaNacimiento = data.fechaNacimiento
        ? new Date(data.fechaNacimiento)
        : null;
    }

    if (data.telefono !== undefined) {
      egresadoData.telefono = data.telefono
        ? String(data.telefono).trim()
        : null;
    }

    if (data.direccion !== undefined) {
      egresadoData.direccion = data.direccion
        ? String(data.direccion).trim()
        : null;
    }

    if (data.carrera !== undefined) {
      egresadoData.carrera = data.carrera
        ? String(data.carrera).trim()
        : null;
    }

    if (data.anioEgreso !== undefined) {
      egresadoData.anioEgreso = data.anioEgreso
        ? Number(data.anioEgreso)
        : null;
    }

    if (data.cvUrl !== undefined) {
      egresadoData.cvUrl = data.cvUrl || null;
    }

    if (data.formacionAcademica !== undefined) {
      egresadoData.formacionAcademica = data.formacionAcademica ?? [];
    }

    if (data.experienciaLaboral !== undefined) {
      egresadoData.experienciaLaboral = data.experienciaLaboral ?? [];
    }

    const email = data.email || data.user?.email;

    await this.prisma.$transaction(async (tx) => {
      if (email !== undefined) {
        const nuevoEmail = String(email || '').trim().toLowerCase();

        if (nuevoEmail) {
          const emailUsado = await tx.user.findFirst({
            where: {
              email: nuevoEmail,
              id: {
                not: id,
              },
            },
          });

          if (emailUsado) {
            throw new ConflictException('Ya existe otro usuario con ese correo');
          }

          await tx.user.update({
            where: { id },
            data: {
              email: nuevoEmail,
            },
          });
        }
      }

      await tx.egresado.update({
        where: { id },
        data: egresadoData,
      });
    });

    return this.findOne(id);
  }

  async delete(id: string, currentUser: any) {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el administrador puede eliminar egresados');
    }

    const egresado = await this.prisma.egresado.findUnique({
      where: { id },
    });

    if (!egresado) {
      throw new NotFoundException(`Egresado con ID ${id} no encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.egresadoHabilidad.deleteMany({
        where: {
          egresadoId: id,
        },
      });

      await tx.historialEstadoPostulacion.deleteMany({
        where: {
          postulacion: {
            egresadoId: id,
          },
        },
      });

      await tx.postulacion.deleteMany({
        where: {
          egresadoId: id,
        },
      });

      await tx.egresado.delete({
        where: {
          id,
        },
      });

      await tx.user.delete({
        where: {
          id,
        },
      });
    });

    return {
      ok: true,
      message: 'Egresado eliminado correctamente',
      id,
    };
  }

  async agregarHabilidad(
    egresadoId: string,
    habilidadId: string,
    nivel: string,
    currentUser: any,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== egresadoId) {
      throw new ForbiddenException('Sin permisos para modificar habilidades');
    }

    await this.findOne(egresadoId);

    return this.prisma.egresadoHabilidad.upsert({
      where: {
        egresadoId_habilidadId: {
          egresadoId,
          habilidadId,
        },
      },
      update: {
        nivel: nivel as any,
      },
      create: {
        egresadoId,
        habilidadId,
        nivel: nivel as any,
      },
      include: {
        habilidad: true,
      },
    });
  }

  async eliminarHabilidad(
    egresadoId: string,
    habilidadId: string,
    currentUser: any,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== egresadoId) {
      throw new ForbiddenException('Sin permisos para eliminar habilidades');
    }

    await this.findOne(egresadoId);

    return this.prisma.egresadoHabilidad.delete({
      where: {
        egresadoId_habilidadId: {
          egresadoId,
          habilidadId,
        },
      },
    });
  }

  async getEstadisticas(id: string) {
    const [
      totalPostulaciones,
      enRevision,
      entrevistas,
      contrataciones,
      rechazadas,
    ] = await Promise.all([
      this.prisma.postulacion.count({
        where: { egresadoId: id },
      }),
      this.prisma.postulacion.count({
        where: { egresadoId: id, estado: 'EN_REVISION' },
      }),
      this.prisma.postulacion.count({
        where: { egresadoId: id, estado: 'ENTREVISTA' },
      }),
      this.prisma.postulacion.count({
        where: { egresadoId: id, estado: 'CONTRATADO' },
      }),
      this.prisma.postulacion.count({
        where: { egresadoId: id, estado: 'RECHAZADO' },
      }),
    ]);

    return {
      totalPostulaciones,
      enRevision,
      entrevistas,
      contrataciones,
      rechazadas,
      tasaRespuesta:
        totalPostulaciones > 0
          ? Math.round(
              ((totalPostulaciones - rechazadas) / totalPostulaciones) * 100,
            )
          : 0,
    };
  }

  async getCarrerasDisponibles() {
    const result = await this.prisma.egresado.groupBy({
      by: ['carrera'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return result
      .filter((item) => item.carrera)
      .map((item) => ({
        carrera: item.carrera,
        total: item._count.id,
      }));
  }
}