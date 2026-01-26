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
  Req,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { FilterShopDto } from './dto/filter-shop.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createShopDto: CreateShopDto, @Req() req: Request) {
    const user = req.user as any;
    const shop = await this.shopsService.create(createShopDto, user.id);
    return {
      message: 'Shop created successfully',
      data: shop,
    };
  }

  @Get()
  async findAll(@Query() filterDto: FilterShopDto) {
    const result = await this.shopsService.findAll(filterDto);
    return {
      message: 'Shops retrieved successfully',
      data: result.shops,
      meta: {
        total: result.total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 20,
      },
    };
  }

  @Get('my/shops')
  @UseGuards(JwtAuthGuard)
  async getMyShops(@Req() req: Request) {
    const user = req.user as any;
    const result = await this.shopsService.findAll({ ownerId: user.id });
    return {
      message: 'My shops retrieved successfully',
      data: result.shops,
    };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const shop = await this.shopsService.findBySlug(slug);
    return {
      message: 'Shop retrieved successfully',
      data: shop,
    };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.shopsService.getStats(id);
    return {
      message: 'Shop stats retrieved successfully',
      data: stats,
    };
  }

  @Get(':id/articles')
  async getShopArticles(@Param('id') id: string) {
    const articles = await this.shopsService.getShopArticles(id);
    return {
      message: 'Shop articles retrieved successfully',
      data: articles,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const shop = await this.shopsService.findOne(id);
    return {
      message: 'Shop retrieved successfully',
      data: shop,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const shop = await this.shopsService.update(id, updateShopDto, user.id);
    return {
      message: 'Shop updated successfully',
      data: shop,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    await this.shopsService.remove(id, user.id);
    return {
      message: 'Shop deleted successfully',
    };
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Param('id') id: string) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    const shop = await this.shopsService.verify(id);
    return {
      message: 'Shop verified successfully',
      data: shop,
    };
  }

  @Post(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const shop = await this.shopsService.deactivate(id, user.id);
    return {
      message: 'Shop deactivated successfully',
      data: shop,
    };
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  async activate(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const shop = await this.shopsService.activate(id, user.id);
    return {
      message: 'Shop activated successfully',
      data: shop,
    };
  }
}
