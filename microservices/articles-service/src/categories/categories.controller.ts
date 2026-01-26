import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // @UseGuards(JwtAuthGuard) // Temporarily disabled for seeding
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Category created successfully',
      data: category,
    };
  }

  @Get()
  async findAll(@Query('isActive') isActive?: string) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const categories = await this.categoriesService.findAll(isActiveBool);
    return {
      message: 'Categories retrieved successfully',
      data: categories,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return {
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    await this.categoriesService.remove(id);
    return {
      message: 'Category deleted successfully',
    };
  }
}
