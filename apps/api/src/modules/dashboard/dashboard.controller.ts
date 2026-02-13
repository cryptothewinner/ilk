import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Public } from '../../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Public()
    @Get('kpis')
    async getKpis() {
        return this.dashboardService.getKpis();
    }

    @Public()
    @Get('production-status')
    async getProductionStatus() {
        return this.dashboardService.getProductionStatus();
    }

    @Public()
    @Get('recent-activity')
    async getRecentActivity() {
        return this.dashboardService.getRecentActivity();
    }
}
