import { ordersClient } from '@/lib/api';
import { Article } from './articlesApi';
import { User } from '@/types/user.types';

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

export interface OrderItem {
  id: string;
  article: Article;
  seller: User;
  quantity: number;
  price: number;
  shippingCost: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  buyer: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  shippingCost: number;
  shippingAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDto {
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes?: string;
}

class OrdersApiService {
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await ordersClient.post('/orders', data);
    return response.data.data;
  }

  async getOrders(): Promise<Order[]> {
    const response = await ordersClient.get('/orders');
    return response.data.data;
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await ordersClient.get(`/orders/${orderId}`);
    return response.data.data;
  }
}

export const ordersApi = new OrdersApiService();
