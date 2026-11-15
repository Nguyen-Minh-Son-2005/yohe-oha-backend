import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DailyTask } from './daily-task.entity';
import { User } from './user.entity';

@Entity('task_check_logs')
export class TaskCheckLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'task_id' })
  taskId: string;

  @ManyToOne(() => DailyTask, (task) => task.checkLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: DailyTask;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'checked_at' })
  checkedAt: Date;

  @Column({ type: 'timestamp', name: 'client_time' })
  clientTime: Date;

  @Column({ type: 'int', name: 'points_awarded' })
  pointsAwarded: number;

  @Column({ type: 'varchar', length: 30, name: 'check_type' })
  checkType: string; // EXACT_WINDOW, BUFFER_WINDOW
}
