import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyTask } from '../../entities/daily-task.entity';
import { TaskCheckLog } from '../../entities/task-check-log.entity';
import { QuantitativeTask } from '../../entities/quantitative-task.entity';
import { QuantitativeLog } from '../../entities/quantitative-log.entity';
import { DailyProgress } from '../../entities/daily-progress.entity';
import { SystemMessage } from '../../entities/system-message.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyTask,
      TaskCheckLog,
      QuantitativeTask,
      QuantitativeLog,
      DailyProgress,
      SystemMessage,
      SystemConfig,
      UserProfile,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
