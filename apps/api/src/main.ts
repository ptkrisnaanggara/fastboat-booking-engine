import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use((req: any, res: any, next: any) => {
    if (!req.path.startsWith('/api/v1/admin')) {
      return next();
    }

    const expectedKey = config.get<string>('ADMIN_API_KEY');
    const providedKey = req.headers['x-admin-api-key'];

    if (!expectedKey || providedKey !== expectedKey) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Invalid admin API key',
        error: 'Unauthorized',
      });
    }

    return next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('API_PORT', 3000);
  await app.listen(port);
}

bootstrap();
