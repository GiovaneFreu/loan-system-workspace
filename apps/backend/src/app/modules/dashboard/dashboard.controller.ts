import { Controller, Get, Inject } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  @Inject(DashboardService) private readonly dashboardService: DashboardService;

  @Get()
  getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
