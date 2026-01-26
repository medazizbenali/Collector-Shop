import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'uuid' })
  articleId: string;

  @Column({ type: 'uuid' })
  sellerId: string;

  @Column({ type: 'uuid', nullable: true })
  shopId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'json' })
  articleData: {
    title: string;
    description: string;
    images: string[];
    condition: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}
