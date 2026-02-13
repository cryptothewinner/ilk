import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('kpis')
    async getKpis() {
        return this.dashboardService.getKpis();
    }

    @Get('production-status')
    async getProductionStatus() {
        return this.dashboardService.getProductionStatus();
    }

    @Get('recent-activity')
    async getRecentActivity() {
        return this.dashboardService.getRecentActivity();
    }
}
