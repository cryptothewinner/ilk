import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/jwt-auth.guard';

@Controller()
export class HealthController {
    @Public()
    @Get('health')
    health() {
        return {
            status: 'ok',
            service: 'sepenatural-api',
            timestamp: new Date().toISOString(),
        };
    }
}
