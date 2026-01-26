import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
