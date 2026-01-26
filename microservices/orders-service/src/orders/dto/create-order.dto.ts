import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  articleId: string;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsString()
  @IsOptional()
  shopId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  shippingCost: number;

  @IsNotEmpty()
  articleData: {
    title: string;
    description: string;
    images: string[];
    condition: string;
  };
}

export class CreateOrderDto {
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
