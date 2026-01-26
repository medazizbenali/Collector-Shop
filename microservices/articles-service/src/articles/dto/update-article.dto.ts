import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsUUID, Min, Max } from 'class-validator';
import { ArticleCondition, ArticleStatus } from '../entities/article.entity';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @IsEnum(ArticleCondition)
  @IsOptional()
  condition?: ArticleCondition;

  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

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
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  shopId?: string;
}
