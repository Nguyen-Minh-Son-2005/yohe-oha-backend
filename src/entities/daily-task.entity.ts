import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { TaskCheckLog } from './task-check-log.entity';

@Entity('daily_tasks')
@Index(['userId', 'taskDate'])
export class DailyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.dailyTasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'task_date' })
  taskDate: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  category: string; // MEAL, SLEEP, EXERCISE, REST

  @Column({ type: 'varchar', length: 20, name: 'task_type', default: 'MAIN' })
  taskType: string; // MAIN, MINI_EVENT

  @Column({ type: 'varchar', length: 10, name: 'start_time' })
  startTime: string; // HH:mm

  @Column({ type: 'varchar', length: 10, name: 'end_time' })
  endTime: string; // HH:mm

  @Column({ type: 'int', name: 'duration_minutes', nullable: true })
  durationMinutes?: number; // For mini event countdown

  @Column({ type: 'int', name: 'buffer_minutes', default: 30 })
  bufferMinutes: number;

  @Column({ type: 'int', name: 'base_points', default: 10 })
  basePoints: number;

  @Column({ type: 'varchar', length: 20, default: 'UPCOMING' })
  status: string; // UPCOMING, ONGOING, COMPLETED, MISSED

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TaskCheckLog, (log) => log.task)
  checkLogs: TaskCheckLog[];
}
