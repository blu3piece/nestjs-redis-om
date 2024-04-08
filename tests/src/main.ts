import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, { logger: new Logger() });
  const port = 3001;
  await app.listen(port, () => logger.log(`Listen port: ${port}`));
}
bootstrap();
