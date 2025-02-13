import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // O usa el dominio de tu frontend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(3000);
  console.log('Backend corriendo en http://localhost:3000');
}
bootstrap();
