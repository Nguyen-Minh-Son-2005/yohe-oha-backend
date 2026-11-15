import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CheckTaskDto } from './dto/check-task.dto';
import { IncrementQuantitativeDto } from './dto/increment-quantitative.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../../entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('dashboard/today')
  getTodayDashboard(@GetUser() user: User) {
    return this.dashboardService.getTodayDashboard(user.id);
  }

  @Post('tasks/:id/check')
  checkTask(
    @GetUser() user: User,
    @Param('id') taskId: string,
    @Body() dto: CheckTaskDto,
  ) {
    return this.dashboardService.checkTask(user.id, taskId, dto?.clientTime);
  }

  @Post('quantitative/:id/increment')
  incrementQuantitative(
    @GetUser() user: User,
    @Param('id') taskId: string,
    @Body() dto: IncrementQuantitativeDto,
  ) {
    return this.dashboardService.incrementQuantitative(user.id, taskId, dto?.amount);
  }

  @Post('mini-events/:id/complete')
  completeMiniEvent(@GetUser() user: User, @Param('id') taskId: string) {
    return this.dashboardService.completeMiniEvent(user.id, taskId);
  }
}
