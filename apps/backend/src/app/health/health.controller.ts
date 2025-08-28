import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {

  @Get('/health')
  async checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('/ready')
  async checkReadiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected'
      }
    };
  }

  @Get('/live')
  checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid
    };
  }
}