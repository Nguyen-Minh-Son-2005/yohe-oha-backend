import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('system_messages')
export class SystemMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 20, name: 'time_slot', default: 'ALL' })
  timeSlot: string; // MORNING, AFTERNOON, EVENING, ALL

  @Column({ type: 'varchar', length: 50, default: 'INSPIRATION' })
  category: string; // INSPIRATION, HEALTH_TIP, REMINDER

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
