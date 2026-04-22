import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsConfig = buildCorsConfig();

  app.use((request: Request, response: Response, next: NextFunction) => {
    applyCorsHeaders(request, response, corsConfig);

    if (request.method === 'OPTIONS') {
      response.status(204).send();
      return;
    }

    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  logCorsConfig(corsConfig);
  await app.listen(port, '0.0.0.0');
}

bootstrap();

function buildCorsConfig() {
  const allowedOrigins = getAllowedOrigins();
  const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';
  const allowMethods = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';

  return {
    allowedOrigins,
    allowVercelPreviews,
    allowMethods,
  };
}

function getAllowedOrigins() {
  const configuredOrigins =
    process.env.CORS_ALLOWED_ORIGINS ?? process.env.FRONTEND_URL;

  if (!configuredOrigins) {
    return ['http://localhost:3000'];
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ''));
}

function matchesOrigin(origin: string, allowedOrigin: string) {
  const normalizedOrigin = origin.replace(/\/$/, '');

  if (allowedOrigin.includes('*')) {
    const escapedPattern = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');

    return new RegExp(`^${escapedPattern}$`).test(normalizedOrigin);
  }

  return normalizedOrigin === allowedOrigin;
}

function isAllowedOrigin(origin: string, corsConfig: ReturnType<typeof buildCorsConfig>) {
  const normalizedOrigin = origin.replace(/\/$/, '');

  if (
    corsConfig.allowVercelPreviews &&
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)
  ) {
    return true;
  }

  return corsConfig.allowedOrigins.some((allowedOrigin) =>
    matchesOrigin(normalizedOrigin, allowedOrigin),
  );
}

function applyCorsHeaders(
  request: Request,
  response: Response,
  corsConfig: ReturnType<typeof buildCorsConfig>,
) {
  const origin = request.headers.origin;

  response.header('Vary', 'Origin, Access-Control-Request-Headers');

  if (!origin) {
    return;
  }

  if (!isAllowedOrigin(origin, corsConfig)) {
    return;
  }

  response.header('Access-Control-Allow-Origin', origin);
  response.header('Access-Control-Allow-Credentials', 'true');
  response.header('Access-Control-Allow-Methods', corsConfig.allowMethods);

  const requestHeaders = request.headers['access-control-request-headers'];
  response.header(
    'Access-Control-Allow-Headers',
    typeof requestHeaders === 'string' && requestHeaders.trim().length > 0
      ? requestHeaders
      : 'Content-Type, Authorization',
  );
}

function logCorsConfig(corsConfig: ReturnType<typeof buildCorsConfig>) {
  const previewMessage = corsConfig.allowVercelPreviews
    ? 'enabled'
    : 'disabled';

  console.log(
    `CORS allowed origins: ${corsConfig.allowedOrigins.join(', ') || 'none configured'}`,
  );
  console.log(`Vercel preview origin support: ${previewMessage}`);
}
