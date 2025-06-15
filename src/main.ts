import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { LoggingService } from './logging/logging.service';
import { HttpExceptionFilter } from './logging/http-exception.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  
  const loggingService = app.get(LoggingService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService));
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  loggingService.log(`Application is running on port ${port}`);
}
bootstrap();
