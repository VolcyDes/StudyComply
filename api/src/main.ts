import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

function parseOrigins(raw?: string) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowed = parseOrigins(process.env.ALLOWED_ORIGINS);

  app.enableCors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    const isLocal =
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1');

    const isVercel =
      origin.endsWith('.vercel.app');

    const isCustomProd =
      origin === 'https://study-comply.vercel.app';

    const ok = isLocal || isVercel || isCustomProd;

    return cb(ok ? null : new Error(`CORS blocked for origin: ${origin}`), ok);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});


  // === Swagger (DEV ONLY) ===
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('StudyComply API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
