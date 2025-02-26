import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import helmet from 'helmet';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet());
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  app.enableCors({ origin: '*' });

  const config = new DocumentBuilder()
    .setTitle('Health Connect API Documentation')
    .setDescription('It provides details about the API endpoints.')
    .setVersion('1.0')
    .addBearerAuth() // Add Bearer Authentication in Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('LISTING_PORT') || 3000;

  await app.listen(port, '0.0.0.0');
  console.log('🚀 ~ Heath connect backend is running on port :', port);
}
bootstrap();
