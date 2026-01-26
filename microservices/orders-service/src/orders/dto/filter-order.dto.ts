import { IsOptional, IsString, IsEnum, IsUUID, IsNumber, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class FilterOrderDto {
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
