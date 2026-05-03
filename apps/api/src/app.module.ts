import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EgresadosModule } from './modules/egresados/egresados.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { OfertasModule } from './modules/ofertas/ofertas.module';
import { PostulacionesModule } from './modules/postulaciones/postulaciones.module';
import { HabilidadesModule } from './modules/habilidades/habilidades.module';
import { EstadisticasModule } from './modules/estadisticas/estadisticas.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { TrpcModule } from './trpc/trpc.module';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: { host: config.get('REDIS_HOST', 'localhost'), port: config.get<number>('REDIS_PORT', 6379) },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: 300,
        max: 1000,
      }),
    }),
    PrismaModule,
    AuthModule,
    EgresadosModule,
    EmpresasModule,
    OfertasModule,
    PostulacionesModule,
    HabilidadesModule,
    EstadisticasModule,
    ReportesModule,
    NotificacionesModule,
    TrpcModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
