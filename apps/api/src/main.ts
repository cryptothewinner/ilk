import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { PerformanceMetricsService } from './modules/performance/performance-metrics.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:4000',
            'http://127.0.0.1:4000',
        ];

    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.setGlobalPrefix('api/v1');

    const perf = app.get(PerformanceMetricsService);
    const prisma = app.get(PrismaService);

    app.use((req, res, next) => {
        const start = performance.now();
        res.on('finish', () => {
            const durationMs = performance.now() - start;
            perf.recordRequest({
                method: req.method,
                route: req.originalUrl || req.url,
                statusCode: res.statusCode,
                durationMs,
                timestamp: Date.now(),
            });
        });
        next();
    });

    prisma.$on('query' as any, (event: any) => {
        const target = String(event.target || 'raw.raw');
        const [model = 'raw', action = 'raw'] = target.split('.');
        perf.recordPrisma({
            model,
            action,
            durationMs: event.duration ?? 0,
            timestamp: Date.now(),
        });
    });

    const port = process.env.API_PORT || 4000;
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}`);
}
bootstrap();
