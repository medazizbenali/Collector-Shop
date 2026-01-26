import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

export enum ArticleCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'enum', enum: ArticleCondition })
  condition: ArticleCondition;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Column({ type: 'json', default: [] })
  images: string[];

  @Column({ type: 'json', default: [] })
  tags: string[];

  @Column({ type: 'varchar', nullable: true })
  brand: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount: number;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'uuid', nullable: true })
  shopId: string;

  @Column({ type: 'uuid', nullable: true })
  buyerId: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
