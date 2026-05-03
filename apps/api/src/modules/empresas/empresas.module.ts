import {
  Module,
  Injectable,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  CurrentUser,
} from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    if (!data.email) {
      throw new BadRequestException('El correo es obligatorio');
    }

    if (!data.nombreComercial || !data.razonSocial || !data.ruc) {
      throw new BadRequestException(
        'Nombre comercial, razón social y RUC son obligatorios',
      );
    }

    const existeEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existeEmail) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const existeRuc = await this.prisma.empresa.findUnique({
      where: { ruc: data.ruc },
    });

    if (existeRuc) {
      throw new ConflictException('Ya existe una empresa con ese RUC');
    }

    const passwordPlano = data.password || 'password';
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: UserRole.EMPRESA,
      },
    });

    await this.prisma.empresa.create({
      data: {
        id: user.id,
        nombreComercial: data.nombreComercial,
        razonSocial: data.razonSocial,
        ruc: data.ruc,
        sector: data.sector || null,
        sitioWeb: data.sitioWeb || null,
        descripcion: data.descripcion || null,
        logoUrl: data.logoUrl || null,
        ubicacion: data.ubicacion || data.direccion || null,
      },
    });

    return this.findOne(user.id);
  }

  async findAll(filters: {
    sector?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters.sector) {
      where.sector = filters.sector;
    }

    if (filters.search) {
      where.OR = [
        { nombreComercial: { contains: filters.search, mode: 'insensitive' } },
        { razonSocial: { contains: filters.search, mode: 'insensitive' } },
        { ruc: { contains: filters.search, mode: 'insensitive' } },
        { sector: { contains: filters.search, mode: 'insensitive' } },
        { ubicacion: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const skip = filters.skip ? Number(filters.skip) : 0;
    const take = filters.take ? Number(filters.take) : 10;

    const [empresas, total] = await Promise.all([
      this.prisma.empresa.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              ofertas: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          nombreComercial: 'asc',
        },
      }),
      this.prisma.empresa.count({ where }),
    ]);

    return {
      empresas,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
            lastLogin: true,
          },
        },
        ofertas: {
          include: {
            _count: {
              select: {
                postulaciones: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            ofertas: true,
          },
        },
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    return empresa;
  }

  async update(id: string, data: any, currentUser: any) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== id) {
      throw new ForbiddenException('Sin permisos para modificar esta empresa');
    }

    const empresaData: any = {};

    if (data.nombreComercial !== undefined) {
      empresaData.nombreComercial = data.nombreComercial;
    }

    if (data.razonSocial !== undefined) {
      empresaData.razonSocial = data.razonSocial;
    }

    if (data.ruc !== undefined) {
      empresaData.ruc = data.ruc;
    }

    if (data.sector !== undefined) {
      empresaData.sector = data.sector;
    }

    if (data.sitioWeb !== undefined) {
      empresaData.sitioWeb = data.sitioWeb;
    }

    if (data.descripcion !== undefined) {
      empresaData.descripcion = data.descripcion;
    }

    if (data.logoUrl !== undefined) {
      empresaData.logoUrl = data.logoUrl;
    }

    if (data.ubicacion !== undefined) {
      empresaData.ubicacion = data.ubicacion;
    }

    if (data.direccion !== undefined && data.ubicacion === undefined) {
      empresaData.ubicacion = data.direccion;
    }

    const email = data.email || data.user?.email;

    if (email) {
      await this.prisma.user.update({
        where: { id },
        data: { email },
      });
    }

    await this.prisma.empresa.update({
      where: { id },
      data: empresaData,
    });

    return this.findOne(id);
  }

  async delete(id: string, currentUser: any) {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo el administrador puede eliminar empresas');
    }

    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Empresa eliminada correctamente',
      id,
    };
  }

  async getSectores() {
    const result = await this.prisma.empresa.groupBy({
      by: ['sector'],
      _count: {
        id: true,
      },
    });

    return result
      .filter((r) => r.sector)
      .map((r) => ({
        sector: r.sector,
        total: r._count.id,
      }));
  }
}

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.EGRESADO)
  findAll(@Query() query: any) {
    return this.empresasService.findAll({
      sector: query.sector || undefined,
      search: query.search || undefined,
      skip: query.skip ? Number(query.skip) : 0,
      take: query.take ? Number(query.take) : 10,
    });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) {
    return this.empresasService.create(body);
  }

  @Get('sectores')
  @Roles(UserRole.ADMIN, UserRole.EGRESADO, UserRole.EMPRESA)
  getSectores() {
    return this.empresasService.getSectores();
  }

  @Get('me')
  @Roles(UserRole.EMPRESA)
  getMe(@CurrentUser() user: any) {
    return this.empresasService.findOne(user.sub);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EGRESADO, UserRole.EMPRESA)
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.empresasService.update(id, body, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.empresasService.delete(id, user);
  }
}

@Module({
  providers: [EmpresasService, PrismaService],
  controllers: [EmpresasController],
  exports: [EmpresasService],
})
export class EmpresasModule {}