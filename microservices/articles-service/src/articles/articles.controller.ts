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
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createArticleDto: CreateArticleDto, @Req() req: Request) {
    const user = req.user as any;
    const article = await this.articlesService.create(createArticleDto, user.id);
    return {
      message: 'Article created successfully',
      data: article,
    };
  }

  @Get()
  async findAll(@Query() filterDto: FilterArticleDto) {
    const result = await this.articlesService.findAll(filterDto);
    return {
      message: 'Articles retrieved successfully',
      data: result.articles,
      meta: {
        total: result.total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 20,
      },
    };
  }

  @Get('my-articles')
  @UseGuards(JwtAuthGuard)
  async getMyArticles(@Query() filterDto: FilterArticleDto, @Req() req: Request) {
    const user = req.user as any;
    console.log('🔍🔍🔍 [my-articles] ROUTE CALLED!');
    console.log('🔍 [my-articles] User:', JSON.stringify(user));
    console.log('🔍 [my-articles] User ID:', user.id);
    console.log('🔍 [my-articles] Filter:', JSON.stringify(filterDto));

    const result = await this.articlesService.findAll({ ...filterDto, sellerId: user.id });
    console.log('🔍 [my-articles] Result:', { total: result.total, articlesCount: result.articles.length });
    console.log('🔍 [my-articles] Articles:', JSON.stringify(result.articles.map(a => ({ id: a.id, title: a.title, status: a.status }))));

    return {
      message: 'My articles retrieved successfully',
      data: result.articles,
      meta: {
        total: result.total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 20,
      },
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req: Request) {
    const user = req.user as any;
    const stats = await this.articlesService.getStats(user.id);
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    return {
      message: 'Article retrieved successfully',
      data: article,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const article = await this.articlesService.update(id, updateArticleDto, user.id);
    return {
      message: 'Article updated successfully',
      data: article,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    await this.articlesService.remove(id, user.id);
    return {
      message: 'Article deleted successfully',
    };
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submitForApproval(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const article = await this.articlesService.submitForApproval(id, user.id);
    return {
      message: 'Article submitted for approval',
      data: article,
    };
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approve(@Param('id') id: string) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    const article = await this.articlesService.approve(id);
    return {
      message: 'Article approved',
      data: article,
    };
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard)
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    // TODO: Vérifier que l'utilisateur est un ADMIN
    const article = await this.articlesService.reject(id, reason);
    return {
      message: 'Article rejected',
      data: article,
    };
  }

  @Post(':id/sold')
  @UseGuards(JwtAuthGuard)
  async markAsSold(@Param('id') id: string, @Body('buyerId') buyerId: string) {
    const article = await this.articlesService.markAsSold(id, buyerId);
    return {
      message: 'Article marked as sold',
      data: article,
    };
  }
}
