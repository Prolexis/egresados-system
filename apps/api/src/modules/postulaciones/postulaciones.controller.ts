import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { JwtAuthGuard, Roles, RolesGuard, CurrentUser } from '../../common/guards/jwt-auth.guard';
import { UserRole, EstadoPostulacion } from '@prisma/client';

@Controller('postulaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostulacionesController {
  constructor(private postulacionesService: PostulacionesService) {}

  @Post()
  @Roles(UserRole.EGRESADO)
  postular(@CurrentUser() user: any, @Body() body: { ofertaId: string; comentario?: string }) {
    return this.postulacionesService.postular(user.sub, body.ofertaId, body.comentario);
  }

  @Get('mis-postulaciones')
  @Roles(UserRole.EGRESADO)
  getMisPostulaciones(@CurrentUser() user: any) {
    return this.postulacionesService.getMisPostulaciones(user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  getAll(@Query() query: any) {
    return this.postulacionesService.getTodasPostulaciones({
      estado: query.estado,
      skip: query.skip ? parseInt(query.skip) : 0,
      take: query.take ? parseInt(query.take) : 20,
    });
  }

  @Get('oferta/:ofertaId')
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  getByOferta(@Param('ofertaId') ofertaId: string, @CurrentUser() user: any) {
    return this.postulacionesService.getPostulacionesPorOferta(ofertaId, user.sub);
  }

  @Put(':id/estado')
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: EstadoPostulacion; motivo?: string },
    @CurrentUser() user: any,
  ) {
    return this.postulacionesService.cambiarEstado(id, body.estado, user.sub, body.motivo);
  }
}
