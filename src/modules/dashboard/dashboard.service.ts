import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyTask } from '../../entities/daily-task.entity';
import { TaskCheckLog } from '../../entities/task-check-log.entity';
import { QuantitativeTask } from '../../entities/quantitative-task.entity';
import { QuantitativeLog } from '../../entities/quantitative-log.entity';
import { DailyProgress } from '../../entities/daily-progress.entity';
import { SystemMessage } from '../../entities/system-message.entity';
import { SystemConfig } from '../../entities/system-config.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DailyTask)
    private taskRepository: Repository<DailyTask>,
    @InjectRepository(TaskCheckLog)
    private checkLogRepository: Repository<TaskCheckLog>,
    @InjectRepository(QuantitativeTask)
    private quantTaskRepository: Repository<QuantitativeTask>,
    @InjectRepository(QuantitativeLog)
    private quantLogRepository: Repository<QuantitativeLog>,
    @InjectRepository(DailyProgress)
    private progressRepository: Repository<DailyProgress>,
    @InjectRepository(SystemMessage)
    private messageRepository: Repository<SystemMessage>,
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  async getTodayDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // 1. Get dynamic message from system_messages
    const message = await this.getRandomMessage(now);

    // 2. Get Quantitative Tasks (Water & Steps)
    const quantitativeTasks = await this.quantTaskRepository.find({
      where: { userId, taskDate: today },
    });

    // 3. Get Main Tasks and Mini Events
    const allTasks = await this.taskRepository.find({
      where: { userId, taskDate: today },
      order: { startTime: 'ASC' },
    });

    // Recompute task status based on current time
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const mainTasks: DailyTask[] = [];
    const miniEvents: any[] = [];

    for (const task of allTasks) {
      if (task.taskType === 'MINI_EVENT') {
        // Calculate remaining seconds if still pending
        let remainingSeconds = 0;
        if (task.status !== 'COMPLETED' && task.durationMinutes) {
          const createdAt = new Date(task.createdAt).getTime();
          const expireAt = createdAt + task.durationMinutes * 60 * 1000;
          remainingSeconds = Math.max(0, Math.floor((expireAt - now.getTime()) / 1000));
          if (remainingSeconds === 0 && task.status === 'UPCOMING') {
            task.status = 'MISSED';
            await this.taskRepository.save(task);
          }
        }
        miniEvents.push({
          ...task,
          remainingSeconds,
        });
      } else {
        // Main task dynamic status check
        if (task.status === 'UPCOMING' || task.status === 'ONGOING') {
          const { status } = this.evaluateTimeWindow(task, currentTimeStr);
          if (task.status !== status) {
            task.status = status;
            await this.taskRepository.save(task);
          }
        }
        mainTasks.push(task);
      }
    }

    // 4. Get or initialize DailyProgress
    let progress = await this.progressRepository.findOne({
      where: { userId, progressDate: today },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        progressDate: today,
        mainTaskPoints: 0,
        quantitativePoints: 0,
        eventVaultPoints: 0,
        isVaultUnlocked: false,
        completionRate: 0,
      });
      await this.progressRepository.save(progress);
    }

    // 5. Calculate total potential max points & realtime percentage
    const maxMainPoints = mainTasks.reduce((sum, t) => sum + t.basePoints * 2, 0); // max is x2
    const maxQuantPoints = quantitativeTasks.reduce((sum, q) => sum + q.maxPoints, 0);
    const totalMax = maxMainPoints + maxQuantPoints;

    let pointsEarnedTotal = progress.mainTaskPoints + progress.quantitativePoints;
    if (progress.isVaultUnlocked) {
      pointsEarnedTotal += progress.eventVaultPoints;
    }

    const completionRate = totalMax > 0 ? parseFloat(((pointsEarnedTotal / totalMax) * 100).toFixed(1)) : 0;

    if (progress.completionRate !== completionRate) {
      progress.completionRate = completionRate;
      await this.progressRepository.save(progress);
    }

    return {
      date: today,
      currentTime: currentTimeStr,
      message,
      progress: {
        mainTaskPoints: progress.mainTaskPoints,
        quantitativePoints: progress.quantitativePoints,
        eventVaultPoints: progress.eventVaultPoints,
        isVaultUnlocked: progress.isVaultUnlocked,
        completionRate: progress.completionRate,
        totalPointsEarned: pointsEarnedTotal,
        totalMaxPoints: totalMax,
      },
      quantitativeTasks: quantitativeTasks.map((q) => ({
        ...q,
        percentage: q.targetValue > 0 ? Math.min(100, Math.round((q.currentValue / q.targetValue) * 100)) : 0,
      })),
      mainTasks,
      miniEvents,
    };
  }

  async checkTask(userId: string, taskId: string, clientTimeStr?: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy nhiệm vụ');
    }

    if (task.status === 'COMPLETED') {
      throw new BadRequestException('Nhiệm vụ này đã được hoàn thành trước đó');
    }

    const serverNow = new Date();
    const clientTime = clientTimeStr ? new Date(clientTimeStr) : serverNow;

    const currentHour = serverNow.getHours().toString().padStart(2, '0');
    const currentMin = serverNow.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    const { inExactWindow, inBufferWindow, isTooEarly, isTooLate } = this.evaluateTimeWindow(task, currentTimeStr);

    if (isTooEarly) {
      throw new BadRequestException(
        `Chưa đến thời gian thực hiện nhiệm vụ này (Bắt đầu lúc ${task.startTime}, có thể check sớm trước ${task.bufferMinutes} phút)`,
      );
    }

    if (isTooLate || (!inExactWindow && !inBufferWindow)) {
      throw new BadRequestException(
        'Đã quá khung giờ thực hiện nhiệm vụ (kể cả thời gian biên), nhiệm vụ đã bị tính là bỏ lỡ',
      );
    }

    // Exact window gets 2x points, buffer window gets 1x
    const multiplier = inExactWindow ? 2 : 1;
    const pointsAwarded = task.basePoints * multiplier;
    const checkType = inExactWindow ? 'EXACT_WINDOW' : 'BUFFER_WINDOW';

    task.status = 'COMPLETED';
    await this.taskRepository.save(task);

    // Save check log
    const log = this.checkLogRepository.create({
      taskId: task.id,
      userId,
      checkedAt: serverNow,
      clientTime,
      pointsAwarded,
      checkType,
    });
    await this.checkLogRepository.save(log);

    // Update Daily Progress
    const today = task.taskDate;
    let progress = await this.progressRepository.findOne({
      where: { userId, progressDate: today },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        progressDate: today,
        mainTaskPoints: 0,
        quantitativePoints: 0,
        eventVaultPoints: 0,
        isVaultUnlocked: false,
        completionRate: 0,
      });
    }

    progress.mainTaskPoints += pointsAwarded;

    // CHECK NỔ HŨ: If category is SLEEP, unlock the event vault!
    let justUnlockedVault = false;
    if (task.category === 'SLEEP' && !progress.isVaultUnlocked) {
      progress.isVaultUnlocked = true;
      justUnlockedVault = true;
    }

    await this.progressRepository.save(progress);

    return {
      message: inExactWindow
        ? `Tuyệt vời! Bạn hoàn thành đúng khung giờ và nhận x2 điểm (+${pointsAwarded} điểm)!`
        : `Bạn đã hoàn thành nhiệm vụ (+${pointsAwarded} điểm). Hãy cố gắng check đúng giờ hơn nhé!`,
      pointsAwarded,
      checkType,
      isVaultUnlocked: progress.isVaultUnlocked,
      justUnlockedVault,
      vaultPointsReleased: justUnlockedVault ? progress.eventVaultPoints : 0,
      task,
    };
  }

  async incrementQuantitative(userId: string, taskId: string, customAmount?: number) {
    const task = await this.quantTaskRepository.findOne({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy nhiệm vụ định lượng');
    }

    const increment = customAmount && customAmount > 0 ? customAmount : task.stepIncrement;
    task.currentValue += increment;

    // Calculate points earned proportionally
    const ratio = Math.min(1, task.currentValue / task.targetValue);
    const newPointsEarned = Math.round(task.maxPoints * ratio);
    const pointsDiff = newPointsEarned - task.pointsEarned;
    task.pointsEarned = newPointsEarned;

    await this.quantTaskRepository.save(task);

    // Log the increment
    const log = this.quantLogRepository.create({
      quantitativeTaskId: task.id,
      userId,
      incrementValue: increment,
      loggedAt: new Date(),
    });
    await this.quantLogRepository.save(log);

    // Update progress
    const today = task.taskDate;
    let progress = await this.progressRepository.findOne({
      where: { userId, progressDate: today },
    });

    if (progress && pointsDiff > 0) {
      progress.quantitativePoints += pointsDiff;
      await this.progressRepository.save(progress);
    }

    return {
      message: `Đã ghi nhận +${increment} ${task.unit}`,
      task: {
        ...task,
        percentage: Math.min(100, Math.round((task.currentValue / task.targetValue) * 100)),
      },
      pointsDiff,
    };
  }

  async completeMiniEvent(userId: string, taskId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userId, taskType: 'MINI_EVENT' },
    });

    if (!task) {
      throw new NotFoundException('Không tìm thấy nhiệm vụ mini event');
    }

    if (task.status === 'COMPLETED') {
      throw new BadRequestException('Mini event này đã được hoàn thành');
    }

    if (task.status === 'MISSED') {
      throw new BadRequestException('Mini event đã hết thời gian thực hiện');
    }

    task.status = 'COMPLETED';
    await this.taskRepository.save(task);

    const today = task.taskDate;
    let progress = await this.progressRepository.findOne({
      where: { userId, progressDate: today },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        progressDate: today,
        mainTaskPoints: 0,
        quantitativePoints: 0,
        eventVaultPoints: 0,
        isVaultUnlocked: false,
        completionRate: 0,
      });
    }

    // Points go into event_vault_points (Rương kho báu / Lì xì)
    const pointsAwarded = task.basePoints;
    progress.eventVaultPoints += pointsAwarded;
    await this.progressRepository.save(progress);

    return {
      message: `Hoàn thành mini event! +${pointsAwarded} điểm đã được cất vào Rương kho báu, sẽ nổ hũ sau khi check task Đi ngủ!`,
      pointsAwarded,
      eventVaultPoints: progress.eventVaultPoints,
      isVaultUnlocked: progress.isVaultUnlocked,
      task,
    };
  }

  private evaluateTimeWindow(task: DailyTask, currentTimeStr: string) {
    const startMins = this.toMinutes(task.startTime);
    const endMins = this.toMinutes(task.endTime);
    const currentMins = this.toMinutes(currentTimeStr);
    const buffer = task.bufferMinutes || 30;

    const inExactWindow = currentMins >= startMins && currentMins <= endMins;
    const inBufferWindow =
      (currentMins >= startMins - buffer && currentMins < startMins) ||
      (currentMins > endMins && currentMins <= endMins + buffer);

    const isTooEarly = currentMins < startMins - buffer;
    const isTooLate = currentMins > endMins + buffer;

    let status = 'UPCOMING';
    if (inExactWindow) {
      status = 'ONGOING';
    } else if (isTooLate) {
      status = 'MISSED';
    }

    return { inExactWindow, inBufferWindow, isTooEarly, isTooLate, status };
  }

  private toMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  private async getRandomMessage(now: Date) {
    const hour = now.getHours();
    let slot = 'ALL';
    if (hour >= 5 && hour < 11.5) {
      slot = 'MORNING';
    } else if (hour >= 11.5 && hour < 18) {
      slot = 'AFTERNOON';
    } else {
      slot = 'EVENING';
    }

    const messages = await this.messageRepository.find({
      where: [{ timeSlot: slot, isActive: true }, { timeSlot: 'ALL', isActive: true }],
    });

    if (messages.length === 0) {
      return {
        greeting: 'Chào bạn!',
        content: 'Chúc bạn một ngày tràn đầy năng lượng và sống khỏe mỗi ngày!',
      };
    }

    const random = messages[Math.floor(Math.random() * messages.length)];
    let greeting = 'Chào bạn!';
    if (slot === 'MORNING') greeting = 'Chào buổi sáng!';
    else if (slot === 'AFTERNOON') greeting = 'Chào buổi chiều!';
    else if (slot === 'EVENING') greeting = 'Chào buổi tối!';

    return {
      greeting,
      content: random.content,
      category: random.category,
    };
  }
}
