import { IsOptional, IsString, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleCondition, ArticleStatus } from '../entities/article.entity';

export class FilterArticleDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string;

  @IsOptional()
  @IsEnum(ArticleCondition)
  condition?: ArticleCondition;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
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
