import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log']);

  const config = new DocumentBuilder()
    .setTitle('FileFuse APIs')
    .setDescription('FileFuse Apis')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT, () =>
    console.log(
      `Server running in mode ${process.env.NODE_ENV} on port ${PORT}`,
    ),
  );
}
bootstrap();
