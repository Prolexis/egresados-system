import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import {
  JwtAuthGuard,
  Roles,
  RolesGuard,
  CurrentUser,
} from '../../common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('ofertas')
export class OfertasController {
  constructor(private readonly ofertasService: OfertasService) {}

  // ─── PÚBLICO: listado de ofertas ──────────────────────────────────────────
  @Get()
  findAll(@Query() query: any) {
    return this.ofertasService.findAll({
      estado: query.estado || undefined,
      modalidad: query.modalidad || undefined,
      tipoContrato: query.tipoContrato || undefined,
      empresaId: query.empresaId || undefined,
      search: query.search || undefined,
      salarioMin: query.salarioMin ? Number(query.salarioMin) : undefined,
      salarioMax: query.salarioMax ? Number(query.salarioMax) : undefined,
      skip: query.skip ? Number(query.skip) : 0,
      take: query.take ? Number(query.take) : 10,
    });
  }

  // ─── PRIVADO: empresa ve sus propias ofertas ──────────────────────────────
  // IMPORTANTE: esta ruta debe ir antes de @Get(':id')
  @Get('mis-ofertas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA)
  getMisOfertas(@CurrentUser() user: any) {
    return this.ofertasService.getMisOfertas(user.sub);
  }

  // ─── PÚBLICO: detalle de oferta ───────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ofertasService.findOne(id);
  }

  // ─── PRIVADO: empresa o admin crea oferta ─────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.ofertasService.create(user.sub, body);
  }

  // ─── PRIVADO: empresa o admin edita oferta ────────────────────────────────
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.ofertasService.update(id, body, user);
  }

  // ─── PRIVADO: empresa o admin elimina oferta ──────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPRESA, UserRole.ADMIN)
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ofertasService.delete(id, user);
  }
}