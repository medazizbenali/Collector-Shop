import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const user = req.user as any;
    const order = await this.ordersService.create(createOrderDto, user.id);
    return {
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() filterDto: FilterOrderDto, @Req() req: Request) {
    const user = req.user as any;
    const result = await this.ordersService.findAll(filterDto, user.id);
    return {
      message: 'Orders retrieved successfully',
      data: result.orders,
      meta: {
        total: result.total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 20,
      },
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return {
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const order = await this.ordersService.updateStatus(id, updateOrderStatusDto, user.id);
    return {
      message: 'Order status updated successfully',
      data: order,
    };
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const result = await this.ordersService.checkout(id, user.id);
    return {
      message: 'Checkout URL generated',
      data: result,
    };
  }
}
