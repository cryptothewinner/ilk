import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('Bootstrap');

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // CORS
    app.enableCors({
        origin: [
            'http://localhost:3000', // Next.js
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
        }),
    );

    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 SepeNatural API running on http://localhost:${port}/api/v1`);
    logger.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
}
bootstrap();
