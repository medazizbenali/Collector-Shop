import { IsString, IsNumber, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ArticleDataDto {
  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsString()
  sellerId: string;
}

export class AddToCartDto {
  @IsString()
  articleId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ArticleDataDto)
  articleData: ArticleDataDto;
}
