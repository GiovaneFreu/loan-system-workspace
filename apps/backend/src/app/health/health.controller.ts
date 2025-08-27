import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

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
    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected'
        }
      };
    } catch (error) {
      throw new Error('Service not ready');
    }
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