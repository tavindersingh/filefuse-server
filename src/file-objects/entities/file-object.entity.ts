import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class FileObject extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 's3_key', unique: true })
  s3Key: string;

  @Column({ name: 'url_key', unique: true })
  urlKey: string;

  @Column({ name: 'downloads_count', default: 1 })
  downloadsCount: number;

  @Column({ name: 'auto_delete', default: true })
  autoDelete: boolean;

  @Column({ name: 'expiry_at' })
  expiryAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
