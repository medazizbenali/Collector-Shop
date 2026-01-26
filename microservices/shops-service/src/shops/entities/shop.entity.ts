import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', nullable: true })
  bannerUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', nullable: true })
  contactPhone: string;

  @Column({ type: 'varchar', nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', nullable: true })
  city: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', nullable: true, default: 'France' })
  country: string;

  @Column({ type: 'text', nullable: true })
  returnPolicy: string;

  @Column({ type: 'text', nullable: true })
  shippingPolicy: string;

  @Column({ type: 'int', default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'uuid' })
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
