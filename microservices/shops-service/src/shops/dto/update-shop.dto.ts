import { IsString, IsEmail, IsOptional, IsUrl, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateShopDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsUrl()
  @IsOptional()
  bannerUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  returnPolicy?: string;

  @IsString()
  @IsOptional()
  shippingPolicy?: string;
}
