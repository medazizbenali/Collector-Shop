import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsArray, IsUUID, Min, Max } from 'class-validator';
import { ArticleCondition } from '../entities/article.entity';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @IsEnum(ArticleCondition)
  condition: ArticleCondition;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  brand?: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  @IsOptional()
  year?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  shopId?: string;
}
