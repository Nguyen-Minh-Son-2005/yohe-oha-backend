import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('database')
export class DatabaseController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  async checkConnection() {
    try {
      const result = await this.dataSource.query(
        'SELECT current_database() AS database, current_user AS username, NOW() AS server_time',
      );

      return {
        status: 'connected',
        message: 'NestJS đã kết nối PostgreSQL thành công!',
        database: result[0].database,
        username: result[0].username,
        serverTime: result[0].server_time,
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        message: 'Không thể truy vấn PostgreSQL.',
      });
    }
  }
}