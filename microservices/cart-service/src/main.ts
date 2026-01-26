import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  });

  const port = process.env.PORT || 8004;
  await app.listen(port);

  console.log(`🛒 Cart Service started on port ${port}`);
}

bootstrap();
