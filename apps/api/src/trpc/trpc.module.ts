import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TrpcService } from './trpc.service';
import { TrpcMiddleware } from './trpc.middleware';
import { AuthModule } from '../modules/auth/auth.module';
import { EgresadosModule } from '../modules/egresados/egresados.module';
import { OfertasModule } from '../modules/ofertas/ofertas.module';
import { EstadisticasModule } from '../modules/estadisticas/estadisticas.module';
import { ReportesModule } from '../modules/reportes/reportes.module';

@Module({
  imports: [AuthModule, EgresadosModule, OfertasModule, EstadisticasModule, ReportesModule],
  providers: [TrpcService, TrpcMiddleware],
  exports: [TrpcService],
})
export class TrpcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TrpcMiddleware).forRoutes('trpc');
  }
}
