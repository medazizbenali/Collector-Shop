import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUrl, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets' })
  slug: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  description?: string;

  @IsOptional()
  logoUrl?: string;

  @IsOptional()
  bannerUrl?: string;

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
