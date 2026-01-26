import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  buyerId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'json' })
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  stripeSessionId: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
