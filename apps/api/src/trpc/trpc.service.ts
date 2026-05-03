// ─── trpc.service.ts ──────────────────────────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { JwtService } from '@nestjs/jwt';
import { EstadisticasService } from '../modules/estadisticas/estadisticas.service';
import { ReportesService } from '../modules/reportes/reportes.service';
import { EgresadosService } from '../modules/egresados/egresados.service';
import { OfertasService } from '../modules/ofertas/ofertas.service';

const t = initTRPC.context<{ user: any }>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { user: ctx.user } });
});

@Injectable()
export class TrpcService {
  constructor(
    private jwtService: JwtService,
    private estadisticasService: EstadisticasService,
    private reportesService: ReportesService,
    private egresadosService: EgresadosService,
    private ofertasService: OfertasService,
  ) {}

  appRouter() {
    const { estadisticasService, reportesService, egresadosService, ofertasService } = this;

    return router({
      // ─ Estadísticas ─────────────────────────────────────────────────────────
      adminDashboard: protectedProcedure
        .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
        .query(({ ctx, input }) => {
          if (ctx.user.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN' });
          return estadisticasService.getAdminDashboard(input);
        }),

      egresadoDashboard: protectedProcedure
        .query(({ ctx }) => {
          if (ctx.user.role !== 'EGRESADO') throw new TRPCError({ code: 'FORBIDDEN' });
          return estadisticasService.getEgresadoDashboard(ctx.user.sub);
        }),

      empresaDashboard: protectedProcedure
        .query(({ ctx }) => {
          if (ctx.user.role !== 'EMPRESA') throw new TRPCError({ code: 'FORBIDDEN' });
          return estadisticasService.getEmpresaDashboard(ctx.user.sub);
        }),

      // ─ Reportes ─────────────────────────────────────────────────────────────
      solicitarReporte: protectedProcedure
        .input(z.object({ tipo: z.string(), parametros: z.record(z.any()).optional() }))
        .mutation(({ ctx, input }) =>
          reportesService.solicitarReporte(ctx.user.sub, input.tipo, input.parametros || {}),
        ),

      estadoReporte: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ input }) => reportesService.getEstado(input.id)),

      misReportes: protectedProcedure
        .query(({ ctx }) => reportesService.getMisReportes(ctx.user.sub)),

      // ─ Egresados ────────────────────────────────────────────────────────────
      egresados: protectedProcedure
        .input(z.object({
          carrera: z.string().optional(),
          search: z.string().optional(),
          skip: z.number().optional(),
          take: z.number().optional(),
        }).optional())
        .query(({ input }) => egresadosService.findAll(input || {})),

      // ─ Ofertas ──────────────────────────────────────────────────────────────
      ofertas: protectedProcedure
        .input(z.object({
          estado: z.string().optional(),
          modalidad: z.string().optional(),
          search: z.string().optional(),
          skip: z.number().optional(),
          take: z.number().optional(),
        }).optional())
        .query(({ input }) => ofertasService.findAll(input as any || {})),
    });
  }
}

export type AppRouter = ReturnType<TrpcService['appRouter']>;
