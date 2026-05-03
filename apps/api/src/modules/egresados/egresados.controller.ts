import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EgresadosService } from './egresados.service';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  CurrentUser,
} from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('egresados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  // LISTAR EGRESADOS
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPRESA)
  findAll(@Query() query: any) {
    return this.egresadosService.findAll({
      carrera: query.carrera || undefined,
      anioEgreso: query.anioEgreso ? Number(query.anioEgreso) : undefined,
      habilidades: query.habilidades
        ? String(query.habilidades).split(',').filter(Boolean)
        : undefined,
      search: query.search || undefined,
      skip: query.skip ? Number(query.skip) : 0,
      take: query.take ? Number(query.take) : 12,
    });
  }

  // CREAR EGRESADO DESDE ADMIN
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: any) {
    return this.egresadosService.create(body);
  }

  // CARRERAS DISPONIBLES
  @Get('carreras')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  getCarreras() {
    return this.egresadosService.getCarrerasDisponibles();
  }

  // ESTADÍSTICAS DEL EGRESADO LOGUEADO
  @Get('me/estadisticas')
  @Roles(UserRole.EGRESADO)
  getMisEstadisticas(@CurrentUser() user: any) {
    return this.egresadosService.getEstadisticas(user.sub);
  }

  // PERFIL DEL EGRESADO LOGUEADO
  @Get('me')
  @Roles(UserRole.EGRESADO)
  getMe(@CurrentUser() user: any) {
    return this.egresadosService.findOne(user.sub);
  }

  // VER EGRESADO POR ID
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.EMPRESA, UserRole.EGRESADO)
  findOne(@Param('id') id: string) {
    return this.egresadosService.findOne(id);
  }

  // ACTUALIZAR EGRESADO
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EGRESADO)
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.egresadosService.update(id, body, user);
  }

  // AGREGAR HABILIDAD
  @Post(':id/habilidades')
  @Roles(UserRole.ADMIN, UserRole.EGRESADO)
  agregarHabilidad(
    @Param('id') id: string,
    @Body() body: { habilidadId: string; nivel: string },
    @CurrentUser() user: any,
  ) {
    return this.egresadosService.agregarHabilidad(
      id,
      body.habilidadId,
      body.nivel,
      user,
    );
  }

  // ELIMINAR HABILIDAD
  @Delete(':id/habilidades/:habilidadId')
  @Roles(UserRole.ADMIN, UserRole.EGRESADO)
  eliminarHabilidad(
    @Param('id') id: string,
    @Param('habilidadId') habilidadId: string,
    @CurrentUser() user: any,
  ) {
    return this.egresadosService.eliminarHabilidad(id, habilidadId, user);
  }

  // ELIMINAR EGRESADO
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.egresadosService.delete(id, user);
  }
}