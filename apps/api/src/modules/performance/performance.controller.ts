import { Controller, Get } from '@nestjs/common';
import { Public } from '../../auth/jwt-auth.guard';
import { PerformanceMetricsService } from './performance-metrics.service';

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceMetricsService: PerformanceMetricsService) { }

    @Public()
    @Get('summary')
    getSummary() {
        return this.performanceMetricsService.getSummary();
    }
}
