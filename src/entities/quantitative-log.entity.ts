import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuantitativeTask } from './quantitative-task.entity';
import { User } from './user.entity';

@Entity('quantitative_logs')
export class QuantitativeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'quantitative_task_id' })
  quantitativeTaskId: string;

  @ManyToOne(() => QuantitativeTask, (task) => task.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quantitative_task_id' })
  quantitativeTask: QuantitativeTask;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', name: 'increment_value' })
  incrementValue: number;

  @CreateDateColumn({ name: 'logged_at' })
  loggedAt: Date;
}
