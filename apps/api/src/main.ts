import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Seguridad
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefijo global — excluye /trpc y health para que el middleware lo maneje directamente
  app.setGlobalPrefix('api', { exclude: ['trpc', 'trpc/(.*)', 'health', 'health/live'] });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}`);
  console.log(`📡 REST endpoints en http://localhost:${port}/api`);
  console.log(`🔌 tRPC endpoint en http://localhost:${port}/trpc`);
  console.log(`🩺 Health check en http://localhost:${port}/health`);
}
bootstrap();